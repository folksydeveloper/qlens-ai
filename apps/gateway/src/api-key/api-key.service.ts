import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface GatewayKeyValidation {
  valid: boolean;
  userId: string;
  apiKey: any;
  user: any;
  subscription: any;
}

@Injectable()
export class ApiKeyService {
  private readonly apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  private readonly serviceToken = process.env.API_SERVICE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-service-token');

  async validate(apiKey: string): Promise<GatewayKeyValidation | null> {
    if (!apiKey?.startsWith('qlens-sk-')) return null;
    if (!this.serviceToken) return null;

    try {
      const res = await axios.post(
        `${this.apiBaseUrl}/api-keys/validate`,
        { apiKey },
        {
          headers: { 'X-Service-Secret': this.serviceToken },
          timeout: 5000,
        },
      );
      return res.data?.valid ? (res.data as GatewayKeyValidation) : null;
    } catch {
      return null;
    }
  }

  isModelAllowed(validation: GatewayKeyValidation, model: string): boolean {
    const keyModels = this.parseList(validation.apiKey?.allowedModels);
    const planModels = this.parseList(validation.subscription?.plan?.allowedModels);
    const allowedModels = keyModels.length ? keyModels : planModels;
    return allowedModels.length === 0 || allowedModels.includes(model);
  }

  isProtocolAllowed(validation: GatewayKeyValidation, protocol: 'OPENAI' | 'ANTHROPIC'): boolean {
    const protocols = this.parseList(validation.apiKey?.allowedProtocols).map((p) => p.toUpperCase());
    return protocols.length === 0 || protocols.includes(protocol);
  }

  private parseList(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
}
