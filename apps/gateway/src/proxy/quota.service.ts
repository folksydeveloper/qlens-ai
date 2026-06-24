import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class QuotaService {
  private apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  private apiSecret = process.env.API_SERVICE_SECRET || 'internal-secret-change-me';

  async validateApiKey(key: string): Promise<{ valid: boolean; userId?: string; subscription?: any } | null> {
    try {
      const keyHash = createHash('sha256').update(key).digest('hex');
      const keyPrefix = key.substring(0, 10);
      const res = await axios.post(`${this.apiBaseUrl}/api-keys/validate`, {
        keyHash,
        keyPrefix,
      }, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return null;
    }
  }

  async checkAndDeductQuota(userId: string, tokenCount: number): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const res = await axios.post(`${this.apiBaseUrl}/usage/deduct`, {
        userId,
        tokenCount,
      }, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return { allowed: true, remaining: -1 };
    }
  }
}
