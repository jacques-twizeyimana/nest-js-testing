import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Meter } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { CreateMeterDto } from './dto/create-meter.dto';

@Injectable()
export class MeterService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(name?: string | undefined): Promise<Meter[]> {
    if (name) {
      return this.prisma.meter.findMany({
        where: { name },
      });
    }

    return this.prisma.meter.findMany();
  }

  async getOne(id: string): Promise<Meter> {
    return this.prisma.meter.findUnique({
      where: { id },
    });
  }

  async insertOne(meter: CreateMeterDto): Promise<Meter> {
    return this.prisma.meter.create({
      data: meter,
    });
  }

  async updateOne(id: string, meter: UpdateMeterDto): Promise<Meter> {
    return this.prisma.meter.update({
      data: meter,
      where: { id },
    });
  }

  async deleteOne(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.prisma.meter.delete({ where: { id } });
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }
}
