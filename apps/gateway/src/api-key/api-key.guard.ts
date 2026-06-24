import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const xApiKey = request.headers['x-api-key'];

    const apiKey = xApiKey || authHeader?.replace('Bearer ', '');
    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const validation = await this.apiKeyService.validate(apiKey);
    if (!validation) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    request.apiKey = validation.apiKey;
    request.user = validation.user;
    request.validation = validation;

    return true;
  }
}
