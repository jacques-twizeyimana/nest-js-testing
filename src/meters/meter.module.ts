import { Module } from '@nestjs/common';
import { MetersService } from './meters.service';
import { MetersController } from './meter.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MetersController],
  providers: [MetersService, PrismaService],
})
export class MetersModule {}
