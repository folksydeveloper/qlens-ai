import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { QuotaService } from '../quota/quota.service';

@Module({
  providers: [ProxyService, QuotaService],
  exports: [ProxyService],
})
export class ProxyModule {}
