import { Module } from '@nestjs/common';
import { MeterService } from './meters.service';
import { MetersController } from './meter.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MetersController],
  providers: [MeterService, PrismaService],
})
export class MetersModule {}
