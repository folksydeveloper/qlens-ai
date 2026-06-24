import { Controller, Get, Post, Body, Req, Res, HttpCode, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { OpenAIService } from './openai.service';
import { QuotaService } from '../quota/quota.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { StreamHandler } from '../proxy/stream-handler';

@Controller('v1')
export class OpenAIController {
  private readonly logger = new Logger(OpenAIController.name);

  constructor(
    private openaiService: OpenAIService,
    private quotaService: QuotaService,
    private apiKeyService: ApiKeyService,
  ) {}

  @Post('chat/completions')
  async chatCompletions(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      res.status(401).json({ error: { message: 'API key required', type: 'authentication_error' } });
      return;
    }

    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ error: { message: 'Invalid API key', type: 'authentication_error' } });
      return;
    }

    const quota = await this.quotaService.checkQuota(validation.userId);
    if (!quota?.allowed) {
      res.status(429).json({ error: { message: 'Quota exceeded', type: 'quota_exceeded' } });
      return;
    }

    if (!body.model || !body.messages) {
      res.status(400).json({ error: { message: 'model and messages are required', type: 'invalid_request_error' } });
      return;
    }

    if (body.stream === true) {
      // Streaming response
      const { stream, startTime: proxyStart } = await this.openaiService.streamCompletion(body);
      
      const { outputTokens, content } = await StreamHandler.handleOpenAIStream(stream, res, requestId);
      
      // Post-processing: deduct quota, log usage
      const latency = Date.now() - startTime;
      await this.quotaService.deductQuota(validation.userId, outputTokens);
      await this.quotaService.writeUsageLog({
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        requestId,
        model: body.model,
        inputTokens: body.messages?.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0) || 0,
        outputTokens,
        totalTokens: outputTokens,
        deductionSource: quota.source || 'plan_daily',
        latency,
      });
      await this.quotaService.writeRequestLog({
        requestId,
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        model: body.model,
        endpoint: '/v1/chat/completions',
        method: 'POST',
        statusCode: 200,
        outputTokens,
        totalTokens: outputTokens,
        latency,
      });
    } else {
      // Non-streaming response
      const result = await this.openaiService.completion(body);
      const latency = Date.now() - startTime;
      const usage = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      await this.quotaService.deductQuota(validation.userId, usage.completion_tokens);
      await this.quotaService.writeUsageLog({
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        requestId,
        model: body.model,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        deductionSource: quota.source || 'plan_daily',
        latency,
      });
      await this.quotaService.writeRequestLog({
        requestId,
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        model: body.model,
        endpoint: '/v1/chat/completions',
        method: 'POST',
        statusCode: 200,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        latency,
      });

      res.json(result);
    }
  }

  @Post('completions')
  async completions(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Legacy completions endpoint
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.replace('Bearer ', '');
    if (!apiKey) {
      res.status(401).json({ error: { message: 'API key required', type: 'authentication_error' } });
      return;
    }
    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ error: { message: 'Invalid API key', type: 'authentication_error' } });
      return;
    }

    // Wrap in OpenAI chat format
    const chatBody = {
      ...body,
      model: body.model,
      messages: [{ role: 'user', content: body.prompt || '' }],
      stream: body.stream,
    };

    if (body.stream === true) {
      const { stream } = await this.openaiService.streamCompletion(chatBody);
      await StreamHandler.handleOpenAIStream(stream, res, crypto.randomUUID());
    } else {
      const result = await this.openaiService.completion(chatBody);
      res.json(result);
    }
  }

  @Get('models')
  async listModels(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.replace('Bearer ', '');
    if (!apiKey) {
      res.status(401).json({ error: { message: 'API key required', type: 'authentication_error' } });
      return;
    }
    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ error: { message: 'Invalid API key', type: 'authentication_error' } });
      return;
    }

    const models = await this.openaiService.listModels();
    res.json({ object: 'list', data: models });
  }
}
