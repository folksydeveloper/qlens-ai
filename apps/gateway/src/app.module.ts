import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from './openai/openai.module';
import { AnthropicModule } from './anthropic/anthropic.module';
import { ProxyModule } from './proxy/proxy.module';
import { QuotaModule } from './quota/quota.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ApiKeyModule,
    QuotaModule,
    ProxyModule,
    OpenAIModule,
    AnthropicModule,
    HealthModule,
  ],
})
export class AppModule {}
