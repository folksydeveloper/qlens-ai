import { Module } from '@nestjs/common';
import { OpenAIController } from './openai.controller';
import { OpenAIService } from './openai.service';
import { ApiKeyModule } from '../api-key/api-key.module';
import { QuotaModule } from '../quota/quota.module';
import { ApiKeyService } from '../api-key/api-key.service';
import { QuotaService } from '../quota/quota.service';

@Module({
  imports: [ApiKeyModule, QuotaModule],
  controllers: [OpenAIController],
  providers: [OpenAIService, ApiKeyService, QuotaService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
