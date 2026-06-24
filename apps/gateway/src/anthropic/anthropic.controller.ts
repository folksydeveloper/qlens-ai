import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { AnthropicService } from './anthropic.service';
import { QuotaService } from '../quota/quota.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { StreamHandler } from '../proxy/stream-handler';

@Controller()
export class AnthropicController {
  constructor(
    private anthropicService: AnthropicService,
    private quotaService: QuotaService,
    private apiKeyService: ApiKeyService,
  ) {}

  @Post('messages')
  async messages(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const startTime = Date.now();
    const requestId = randomUUID();
    const validation = await this.validateAnthropicRequest(req, res, body?.model);
    if (!validation) return;

    if (!body.model || !Array.isArray(body.messages)) {
      await this.writeFailureLog(validation, requestId, '/v1/messages', 400, Date.now() - startTime, 'invalid_request_error', 'model and messages are required', body?.model);
      res.status(400).json({ type: 'error', error: { type: 'invalid_request_error', message: 'model and messages are required' } });
      return;
    }

    const estimatedTokens = Number(body.max_tokens || 4096);
    const quota = await this.quotaService.checkQuota(validation.userId, estimatedTokens);
    if (!quota.allowed) {
      await this.writeFailureLog(validation, requestId, '/v1/messages', 429, Date.now() - startTime, 'quota_exceeded', quota.reason || 'Quota exceeded', body.model);
      res.status(429).json({ type: 'error', error: { type: 'quota_exceeded', message: 'Quota exceeded' } });
      return;
    }

    try {
      if (body.stream === true) {
        const { stream } = await this.anthropicService.streamCompletion(body);
        const { outputTokens } = await StreamHandler.handleAnthropicStream(stream, res, requestId);
        const inputTokens = this.estimateInputTokens(body.messages);
        const totalTokens = inputTokens + outputTokens;
        const deduction = await this.quotaService.deductQuota(validation.userId, totalTokens);
        await this.writeSuccessLogs(validation, requestId, '/v1/messages', body.model, inputTokens, outputTokens, totalTokens, deduction.source || quota.source || 'plan_daily', Date.now() - startTime);
      } else {
        const result = await this.anthropicService.completion(body);
        const latency = Date.now() - startTime;
        const usage = result.usage || { input_tokens: this.estimateInputTokens(body.messages), output_tokens: 0 };
        const totalTokens = (usage.input_tokens || 0) + (usage.output_tokens || 0);
        const deduction = await this.quotaService.deductQuota(validation.userId, totalTokens);
        await this.writeSuccessLogs(validation, requestId, '/v1/messages', body.model, usage.input_tokens || 0, usage.output_tokens || 0, totalTokens, deduction.source || quota.source || 'plan_daily', latency);
        res.json(result);
      }
    } catch (error: any) {
      await this.writeFailureLog(validation, requestId, '/v1/messages', 503, Date.now() - startTime, 'service_unavailable', error?.message || 'Upstream service unavailable', body.model);
      res.status(503).json({ type: 'error', error: { type: 'service_unavailable', message: 'Model service unavailable' } });
    }
  }

  @Get('models')
  async listModels(@Req() req: Request, @Res() res: Response) {
    const validation = await this.validateAnthropicRequest(req, res);
    if (!validation) return;
    const models = await this.anthropicService.listModels();
    const allowedModels = (models || []).filter((m: any) => this.apiKeyService.isModelAllowed(validation, m.id || m.publicModelId || m.model || ''));
    res.json({ data: allowedModels });
  }

  private async validateAnthropicRequest(req: Request, res: Response, model?: string): Promise<any | null> {
    const xApiKey = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;
    const apiKey = (Array.isArray(xApiKey) ? xApiKey[0] : xApiKey) || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);
    if (!apiKey) {
      res.status(401).json({ type: 'error', error: { type: 'authentication_error', message: 'API key required' } });
      return null;
    }
    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ type: 'error', error: { type: 'authentication_error', message: 'Invalid API key' } });
      return null;
    }
    if (!this.apiKeyService.isProtocolAllowed(validation, 'ANTHROPIC')) {
      res.status(403).json({ type: 'error', error: { type: 'permission_error', message: 'Anthropic protocol is not allowed for this key' } });
      return null;
    }
    if (model && !this.apiKeyService.isModelAllowed(validation, model)) {
      res.status(403).json({ type: 'error', error: { type: 'permission_error', message: 'Model is not allowed for this key or plan' } });
      return null;
    }
    return validation;
  }

  private estimateInputTokens(messages: any[]): number {
    const chars = messages.reduce((acc, m) => acc + String(m?.content || '').length, 0);
    return Math.ceil(chars / 4);
  }

  private async writeSuccessLogs(validation: any, requestId: string, endpoint: string, model: string, inputTokens: number, outputTokens: number, totalTokens: number, deductionSource: string, latency: number) {
    await this.quotaService.writeUsageLog({ userId: validation.userId, apiKeyId: validation.apiKey.id, requestId, model, compatibilityMode: 'ANTHROPIC', inputTokens, outputTokens, totalTokens, deductionSource, latency, status: 'SUCCESS' });
    await this.quotaService.writeRequestLog({ requestId, userId: validation.userId, apiKeyId: validation.apiKey.id, model, compatibilityMode: 'ANTHROPIC', endpoint, method: 'POST', statusCode: 200, inputTokens, outputTokens, totalTokens, latency });
  }

  private async writeFailureLog(validation: any, requestId: string, endpoint: string, statusCode: number, latency: number, errorCode: string, errorMessage: string, model?: string) {
    await this.quotaService.writeRequestLog({ requestId, userId: validation?.userId, apiKeyId: validation?.apiKey?.id, model, compatibilityMode: 'ANTHROPIC', endpoint, method: 'POST', statusCode, latency, errorCode, errorMessage });
  }
}
