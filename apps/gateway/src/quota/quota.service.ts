import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);
  private readonly apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  private readonly serviceToken = process.env.API_SERVICE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-service-token');

  async checkQuota(userId: string, estimatedTokens = 1): Promise<{ allowed: boolean; remaining: number; source?: string; reason?: string }> {
    if (!this.serviceToken) return { allowed: false, remaining: 0, reason: 'service_auth_missing' };
    try {
      const res = await axios.post(`${this.apiBaseUrl}/usage/check-quota`, { userId, tokens: estimatedTokens }, {
        headers: { 'X-Service-Secret': this.serviceToken },
        timeout: 5000,
      });
      return res.data;
    } catch (error: any) {
      this.logger.error(`Quota check failed closed: ${error?.message || 'unknown error'}`);
      return { allowed: false, remaining: 0, reason: 'quota_service_unavailable' };
    }
  }

  async deductQuota(userId: string, tokens: number): Promise<{ success: boolean; remaining: number; source?: string }> {
    if (!this.serviceToken) return { success: false, remaining: 0 };
    try {
      const res = await axios.post(`${this.apiBaseUrl}/usage/deduct-quota`, { userId, tokens }, {
        headers: { 'X-Service-Secret': this.serviceToken },
        timeout: 5000,
      });
      return res.data;
    } catch (error: any) {
      this.logger.error(`Quota deduction failed: ${error?.message || 'unknown error'}`);
      return { success: false, remaining: 0 };
    }
  }

  async writeUsageLog(data: {
    userId: string;
    apiKeyId: string;
    requestId: string;
    model: string;
    compatibilityMode: 'OPENAI' | 'ANTHROPIC';
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    deductionSource: string;
    cost?: number;
    latency: number;
    status?: string;
    errorCode?: string;
  }): Promise<void> {
    if (!this.serviceToken) return;
    try {
      await axios.post(`${this.apiBaseUrl}/usage/log-usage`, data, {
        headers: { 'X-Service-Secret': this.serviceToken },
        timeout: 5000,
      });
    } catch (error: any) {
      this.logger.error(`Usage log write failed: ${error?.message || 'unknown error'}`);
    }
  }

  async writeRequestLog(data: {
    requestId: string;
    userId?: string;
    apiKeyId?: string;
    model?: string;
    compatibilityMode?: 'OPENAI' | 'ANTHROPIC';
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
    if (!this.serviceToken) return;
    try {
      await axios.post(`${this.apiBaseUrl}/usage/log-request`, data, {
        headers: { 'X-Service-Secret': this.serviceToken },
        timeout: 5000,
      });
    } catch (error: any) {
      this.logger.error(`Request log write failed: ${error?.message || 'unknown error'}`);
    }
  }
}
