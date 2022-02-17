import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateTokenDto } from './dto/update-token.dto';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(name?: string | undefined): Promise<Token[]> {
    if (name) {
      return this.prisma.token.findMany({
        where: { name },
      });
    }

    return this.prisma.token.findMany();
  }

  async getOne(id: string): Promise<Token> {
    return this.prisma.token.findUnique({
      where: { id },
    });
  }

  async insertOne(token: CreateTokenDto): Promise<Token> {
    return this.prisma.token.create({
      data: token,
    });
  }

  async updateOne(id: string, token: UpdateTokenDto): Promise<Token> {
    return this.prisma.token.update({
      data: token,
      where: { id },
    });
  }

  async deleteOne(id: string): Promise<{ deleted: boolean; message?: string }> {
    try {
      await this.prisma.token.delete({ where: { id } });
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }
}
