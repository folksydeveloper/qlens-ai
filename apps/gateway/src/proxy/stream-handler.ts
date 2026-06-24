import { Logger } from '@nestjs/common';

export class StreamHandler {
  private static readonly logger = new Logger(StreamHandler.name);

  static async handleOpenAIStream(
    upstreamStream: any,
    res: any,
    requestId: string,
  ): Promise<{ outputTokens: number; content: string }> {
    return new Promise((resolve) => {
      let outputTokens = 0;
      let content = '';

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      upstreamStream.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        res.write(chunk);

        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const json = JSON.parse(line.substring(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) content += delta;
              const usage = json.usage;
              if (usage?.completion_tokens) outputTokens = usage.completion_tokens;
            } catch {}
          }
        }
      });

      upstreamStream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
        resolve({ outputTokens, content });
      });

      upstreamStream.on('error', (err: Error) => {
        this.logger.error(`Stream error: ${err.message}`);
        res.end();
        resolve({ outputTokens, content });
      });
    });
  }

  static async handleAnthropicStream(
    upstreamStream: any,
    res: any,
    requestId: string,
  ): Promise<{ outputTokens: number; content: string }> {
    return new Promise((resolve) => {
      let outputTokens = 0;
      let content = '';

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      upstreamStream.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        res.write(chunk);

        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.substring(6));
              if (json.type === 'content_block_delta') {
                content += json.delta?.text || '';
              }
              if (json.type === 'message_delta' && json.usage) {
                outputTokens = json.usage?.output_tokens || outputTokens;
              }
            } catch {}
          }
        }
      });

      upstreamStream.on('end', () => {
        res.write('event: message_stop\ndata: {"type":"message_stop"}\n\n');
        res.end();
        resolve({ outputTokens, content });
      });

      upstreamStream.on('error', (err: Error) => {
        this.logger.error(`Anthropic stream error: ${err.message}`);
        res.end();
        resolve({ outputTokens, content });
      });
    });
  }
}
