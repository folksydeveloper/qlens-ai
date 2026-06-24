import { Controller, Post, Body, Req, Res, HttpCode, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AnthropicService } from './anthropic.service';
import { QuotaService } from '../quota/quota.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { StreamHandler } from '../proxy/stream-handler';

@Controller('v1')
export class AnthropicController {
  private readonly logger = new Logger(AnthropicController.name);

  constructor(
    private anthropicService: AnthropicService,
    private quotaService: QuotaService,
    private apiKeyService: ApiKeyService,
  ) {}

  @Post('messages')
  async messages(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const xApiKey = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'];
    const apiKey = (xApiKey || authHeader?.replace('Bearer ', '')) as string;

    if (!apiKey) {
      res.status(401).json({ type: 'error', error: { type: 'authentication_error', message: 'API key required' } });
      return;
    }

    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation?.valid) {
      res.status(401).json({ type: 'error', error: { type: 'authentication_error', message: 'Invalid API key' } });
      return;
    }

    const quota = await this.quotaService.checkQuota(validation.userId);
    if (!quota?.allowed) {
      res.status(429).json({ type: 'error', error: { type: 'quota_exceeded', message: 'Quota exceeded' } });
      return;
    }

    if (!body.model || !body.messages) {
      res.status(400).json({ type: 'error', error: { type: 'invalid_request_error', message: 'model and messages are required' } });
      return;
    }

    if (body.stream === true) {
      const { stream } = await this.anthropicService.streamCompletion(body);
      const { outputTokens, content } = await StreamHandler.handleAnthropicStream(stream, res, requestId);

      const latency = Date.now() - startTime;
      await this.quotaService.deductQuota(validation.userId, outputTokens);
      await this.quotaService.writeUsageLog({
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        requestId,
        model: body.model,
        inputTokens: 0,
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
        endpoint: '/v1/messages',
        method: 'POST',
        statusCode: 200,
        outputTokens,
        totalTokens: outputTokens,
        latency,
      });
    } else {
      const result = await this.anthropicService.completion(body);
      const latency = Date.now() - startTime;
      const usage = result.usage || { input_tokens: 0, output_tokens: 0 };

      await this.quotaService.deductQuota(validation.userId, usage.output_tokens);
      await this.quotaService.writeUsageLog({
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        requestId,
        model: body.model,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        deductionSource: quota.source || 'plan_daily',
        latency,
      });
      await this.quotaService.writeRequestLog({
        requestId,
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        model: body.model,
        endpoint: '/v1/messages',
        method: 'POST',
        statusCode: 200,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        latency,
      });

      res.json(result);
    }
  }
}
