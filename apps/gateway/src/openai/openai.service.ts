import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly upstreamUrl = process.env.INTERNAL_MODEL_BASE_URL || 'http://127.0.0.1:1930';
  private readonly upstreamApiKey = process.env.INTERNAL_MODEL_API_KEY || '';

  async completion(body: any) {
    const startTime = Date.now();

    const response = await axios.post(
      `${this.upstreamUrl}/v1/chat/completions`,
      { ...body, stream: false },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.upstreamApiKey}`,
        },
        timeout: 120000,
      },
    );

    return {
      ...response.data,
      latency: Date.now() - startTime,
    };
  }

  async streamCompletion(body: any) {
    const startTime = Date.now();

    const response = await axios({
      method: 'POST',
      url: `${this.upstreamUrl}/v1/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.upstreamApiKey}`,
      },
      data: { ...body, stream: true },
      responseType: 'stream',
      timeout: 120000,
    });

    return { stream: response.data, startTime };
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.upstreamUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${this.upstreamApiKey}` },
        timeout: 5000,
      });
      return response.data?.data || [];
    } catch (error: any) {
      this.logger.warn(`Unable to list upstream models: ${error?.message || 'unknown error'}`);
      return [];
    }
  }
}
