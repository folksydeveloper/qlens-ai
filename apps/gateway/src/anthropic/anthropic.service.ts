import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private readonly upstreamUrl = process.env.INTERNAL_MODEL_BASE_URL || 'http://127.0.0.1:1930';
  private readonly upstreamApiKey = process.env.INTERNAL_MODEL_API_KEY || '';

  async completion(body: any) {
    const startTime = Date.now();
    const messages = (body.messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : m.content?.[0]?.text || '',
    }));

    const response = await axios.post(
      `${this.upstreamUrl}/v1/chat/completions`,
      {
        model: body.model,
        messages,
        max_tokens: body.max_tokens || 4096,
        temperature: body.temperature || 0.7,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.upstreamApiKey}`,
        },
        timeout: 120000,
      },
    );

    const choice = response.data.choices?.[0];
    const contentText = choice?.message?.content || '';

    return {
      id: response.data.id || `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: contentText }],
      model: body.model,
      stop_reason: choice?.finish_reason === 'stop' ? 'end_turn' : choice?.finish_reason || 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: response.data.usage?.prompt_tokens || 0,
        output_tokens: response.data.usage?.completion_tokens || 0,
      },
      latency: Date.now() - startTime,
    };
  }

  async streamCompletion(body: any) {
    const startTime = Date.now();

    const messages = (body.messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : m.content?.[0]?.text || '',
    }));

    const response = await axios({
      method: 'POST',
      url: `${this.upstreamUrl}/v1/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.upstreamApiKey}`,
      },
      data: {
        model: body.model,
        messages,
        max_tokens: body.max_tokens || 4096,
        temperature: body.temperature || 0.7,
        stream: true,
      },
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
