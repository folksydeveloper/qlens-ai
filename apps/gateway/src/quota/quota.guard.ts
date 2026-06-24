import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { QuotaService } from './quota.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private quotaService: QuotaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const validation = request.validation;
    if (!validation?.userId) {
      throw new ForbiddenException('Authentication required');
    }

    const quota = await this.quotaService.checkQuota(validation.userId);
    if (!quota?.allowed) {
      throw new ForbiddenException('Quota exceeded. Please upgrade your plan or top up.');
    }

    return true;
  }
}
