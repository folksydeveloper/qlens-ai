import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { OpenAIService } from './openai.service';
import { QuotaService } from '../quota/quota.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { StreamHandler } from '../proxy/stream-handler';

@Controller()
export class OpenAIController {
  constructor(
    private openaiService: OpenAIService,
    private quotaService: QuotaService,
    private apiKeyService: ApiKeyService,
  ) {}

  @Post('chat/completions')
  async chatCompletions(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const startTime = Date.now();
    const requestId = randomUUID();
    const validation = await this.validateOpenAIRequest(req, res, requestId, body?.model);
    if (!validation) return;

    if (!body.model || !Array.isArray(body.messages)) {
      await this.writeFailureLog(validation, requestId, '/v1/chat/completions', 400, Date.now() - startTime, 'invalid_request_error', 'model and messages are required', body?.model);
      res.status(400).json({ error: { message: 'model and messages are required', type: 'invalid_request_error', code: 'invalid_request_error' } });
      return;
    }

    const estimatedTokens = Number(body.max_tokens || body.max_completion_tokens || 4096);
    const quota = await this.quotaService.checkQuota(validation.userId, estimatedTokens);
    if (!quota.allowed) {
      await this.writeFailureLog(validation, requestId, '/v1/chat/completions', 429, Date.now() - startTime, 'quota_exceeded', quota.reason || 'Quota exceeded', body.model);
      res.status(429).json({ error: { message: 'Quota exceeded', type: 'quota_exceeded', code: 'quota_exceeded' } });
      return;
    }

    try {
      if (body.stream === true) {
        const { stream } = await this.openaiService.streamCompletion(body);
        const { outputTokens } = await StreamHandler.handleOpenAIStream(stream, res, requestId);
        const inputTokens = this.estimateInputTokens(body.messages);
        const totalTokens = inputTokens + outputTokens;
        const deduction = await this.quotaService.deductQuota(validation.userId, totalTokens);
        await this.writeSuccessLogs(validation, requestId, '/v1/chat/completions', body.model, inputTokens, outputTokens, totalTokens, deduction.source || quota.source || 'plan_daily', Date.now() - startTime);
      } else {
        const result = await this.openaiService.completion(body);
        const latency = Date.now() - startTime;
        const usage = result.usage || { prompt_tokens: this.estimateInputTokens(body.messages), completion_tokens: 0, total_tokens: 0 };
        const totalTokens = usage.total_tokens || (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
        const deduction = await this.quotaService.deductQuota(validation.userId, totalTokens);
        await this.writeSuccessLogs(validation, requestId, '/v1/chat/completions', body.model, usage.prompt_tokens || 0, usage.completion_tokens || 0, totalTokens, deduction.source || quota.source || 'plan_daily', latency);
        res.json(result);
      }
    } catch (error: any) {
      await this.writeFailureLog(validation, requestId, '/v1/chat/completions', 503, Date.now() - startTime, 'service_unavailable', error?.message || 'Upstream service unavailable', body.model);
      res.status(503).json({ error: { message: 'Model service unavailable', type: 'service_unavailable', code: 'service_unavailable' } });
    }
  }

  @Post('completions')
  async completions(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const chatBody = { ...body, messages: [{ role: 'user', content: body.prompt || '' }] };
    return this.chatCompletions(chatBody, req, res);
  }

  @Get('models')
  async listModels(@Req() req: Request, @Res() res: Response) {
    const requestId = randomUUID();
    const validation = await this.validateOpenAIRequest(req, res, requestId);
    if (!validation) return;
    const models = await this.openaiService.listModels();
    const allowedModels = (models || []).filter((m: any) => this.apiKeyService.isModelAllowed(validation, m.id || m.publicModelId || m.model || ''));
    res.json({ object: 'list', data: allowedModels });
  }

  private async validateOpenAIRequest(req: Request, res: Response, requestId: string, model?: string): Promise<any | null> {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!apiKey) {
      res.status(401).json({ error: { message: 'API key required', type: 'authentication_error', code: 'authentication_error' } });
      return null;
    }
    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ error: { message: 'Invalid API key', type: 'authentication_error', code: 'invalid_api_key' } });
      return null;
    }
    if (!this.apiKeyService.isProtocolAllowed(validation, 'OPENAI')) {
      res.status(403).json({ error: { message: 'OpenAI protocol is not allowed for this key', type: 'permission_error', code: 'protocol_not_allowed' } });
      return null;
    }
    if (model && !this.apiKeyService.isModelAllowed(validation, model)) {
      res.status(403).json({ error: { message: 'Model is not allowed for this key or plan', type: 'permission_error', code: 'model_not_allowed' } });
      return null;
    }
    return validation;
  }

  private estimateInputTokens(messages: any[]): number {
    const chars = messages.reduce((acc, m) => acc + String(m?.content || '').length, 0);
    return Math.ceil(chars / 4);
  }

  private async writeSuccessLogs(validation: any, requestId: string, endpoint: string, model: string, inputTokens: number, outputTokens: number, totalTokens: number, deductionSource: string, latency: number) {
    await this.quotaService.writeUsageLog({ userId: validation.userId, apiKeyId: validation.apiKey.id, requestId, model, compatibilityMode: 'OPENAI', inputTokens, outputTokens, totalTokens, deductionSource, latency, status: 'SUCCESS' });
    await this.quotaService.writeRequestLog({ requestId, userId: validation.userId, apiKeyId: validation.apiKey.id, model, compatibilityMode: 'OPENAI', endpoint, method: 'POST', statusCode: 200, inputTokens, outputTokens, totalTokens, latency });
  }

  private async writeFailureLog(validation: any, requestId: string, endpoint: string, statusCode: number, latency: number, errorCode: string, errorMessage: string, model?: string) {
    await this.quotaService.writeRequestLog({ requestId, userId: validation?.userId, apiKeyId: validation?.apiKey?.id, model, compatibilityMode: 'OPENAI', endpoint, method: 'POST', statusCode, latency, errorCode, errorMessage });
  }
}
