import { Module } from '@nestjs/common';
import { AbuseService } from './abuse.service';
import { AbuseController } from './abuse.controller';

@Module({
  controllers: [AbuseController],
  providers: [AbuseService],
  exports: [AbuseService],
})
export class AbuseModule {}
