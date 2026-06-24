import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class ApiKeyService {
  private readonly apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  private readonly apiSecret = process.env.API_SERVICE_SECRET || 'internal-secret-dev';

  async validate(apiKey: string) {
    if (!apiKey?.startsWith('qlens-sk-')) return null;

    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keyPrefix = apiKey.substring(0, 10);

    try {
      const res = await axios.post(`${this.apiBaseUrl}/api-keys/validate`, {
        keyHash,
        keyPrefix,
      }, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });

      if (res.data?.valid) {
        return {
          valid: true,
          userId: res.data.userId,
          apiKey: res.data.apiKey,
          user: res.data.user,
          subscription: res.data.subscription || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
