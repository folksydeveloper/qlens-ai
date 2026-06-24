import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QuotaService {
  private readonly apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  private readonly apiSecret = process.env.API_SERVICE_SECRET || 'internal-secret';

  async validateApiKey(key: string): Promise<{ valid: boolean; userId?: string; subscription?: any } | null> {
    try {
      const res = await axios.post(`${this.apiBaseUrl}/api-keys/validate`, {
        apiKey: key,
      }, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return null;
    }
  }

  async checkQuota(userId: string): Promise<{ allowed: boolean; remaining: number; source?: string }> {
    try {
      const res = await axios.get(`${this.apiBaseUrl}/usage/check-quota?userId=${userId}`, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return { allowed: true, remaining: -1 };
    }
  }

  async deductQuota(userId: string, tokens: number): Promise<{ success: boolean; remaining: number }> {
    try {
      const res = await axios.post(`${this.apiBaseUrl}/usage/deduct-quota`, {
        userId,
        tokens,
      }, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
      return res.data;
    } catch {
      return { success: false, remaining: 0 };
    }
  }

  async logRequest(data: {
    requestId: string;
    userId?: string;
    apiKeyId?: string;
    model?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    latency: number;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/usage/log-request`, data, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
    } catch {
      // Silent fail for logging
    }
  }

  async writeUsageLog(data: {
    userId: string;
    apiKeyId: string;
    requestId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    deductionSource: string;
    cost?: number;
    latency: number;
  }): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/usage/log-usage`, data, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
    } catch {
      // Silent fail
    }
  }

  async writeRequestLog(data: {
    requestId: string;
    userId?: string;
    apiKeyId?: string;
    model?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    latency: number;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/usage/log-request`, data, {
        headers: { 'X-Service-Secret': this.apiSecret },
        timeout: 5000,
      });
    } catch {
      // Silent fail
    }
  }
}
