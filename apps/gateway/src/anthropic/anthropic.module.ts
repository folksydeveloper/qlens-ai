import { Module } from '@nestjs/common';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';
import { ApiKeyModule } from '../api-key/api-key.module';
import { QuotaModule } from '../quota/quota.module';
import { ApiKeyService } from '../api-key/api-key.service';
import { QuotaService } from '../quota/quota.service';

@Module({
  imports: [ApiKeyModule, QuotaModule],
  controllers: [AnthropicController],
  providers: [AnthropicService, ApiKeyService, QuotaService],
  exports: [AnthropicService],
})
export class AnthropicModule {}
