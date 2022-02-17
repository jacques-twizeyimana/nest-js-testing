import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Token, Meter } from '@prisma/client';
import { useContainer } from 'class-validator';

describe('Tokens (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: Token;
  let meter: Meter;
  const catShape = expect.objectContaining({
    id: expect.any(String),
    code: expect.any(String),
    status: expect.any(String),
    age: expect.any(Number),
    ownerId: expect.any(String),
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    meter = await prisma.meter.create({
      data: {
        code: '167891',
        email: 'sandberg@gmail.com',
        status: 'ACTIVE',
      },
    });

    token = await prisma.token.create({
      data: {
        code: '7188171',
        status: 'ACTIVE',
        age: 4,
        meter: {
          connect: { id: meter.id },
        },
      },
    });

    await prisma.token.create({
      data: {
        code: '189187',
        status: 'INACTIVE',
        meter: {
          connect: { id: meter.id },
        },
      },
    });

    await prisma.token.create({
      data: {
        code: 'Cat3',
        status: 'ACTIVE',
        age: 6,
        meter: {
          connect: { id: meter.id },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.truncate();
    await prisma.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // TODO: use transactions and transaction rollback once prisma supports it
  });

  describe('GET /tokens', () => {
    it('returns a list of tokens', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/tokens',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([catShape]));
    });

    describe('with code filter', () => {
      it('returns a filtered list of tokens', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/tokens?code=${token.code}`,
        );

        expect(status).toBe(200);
        expect(body).toStrictEqual(expect.arrayContaining([catShape]));
        expect(body).toHaveLength(1);
      });
    });
  });

  describe('GET /tokens/:id', () => {
    it('returns a token', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/tokens/${token.id}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(catShape);
    });
  });

  describe('POST /tokens', () => {
    it('creates a token', async () => {
      const beforeCount = await prisma.token.count();

      const { status, body } = await request(app.getHttpServer())
        .post('/tokens')
        .send({
          code: '6781909',
          status: 'ACTIVE',
          age: 5,
          ownerId: meter.id,
        });

      const afterCount = await prisma.token.count();

      expect(status).toBe(201);
      expect(body).toStrictEqual(catShape);
      expect(afterCount - beforeCount).toBe(1);
    });

    describe('with non existing meter', () => {
      it('returns HTTP status 400', async () => {
        const beforeCount = await prisma.token.count();

        const { status, body } = await request(app.getHttpServer())
          .post('/tokens')
          .send({
            code: '671898',
            status: 'ACTIVE',
            age: 5,
            ownerId: 12,
          });

        const afterCount = await prisma.token.count();

        expect(status).toBe(400);
        expect(afterCount - beforeCount).toBe(0);
      });
    });
  });
  describe('PATCH /tokens/:id', () => {
    it('updates a token', async () => {
      const newMeter = await prisma.meter.create({
        data: {
          code: '7819098',
          age: 28,
        },
      });

      const { status, body } = await request(app.getHttpServer())
        .patch(`/tokens/${token.id}`)
        .send({
          code: '1678919',
          status: 'INACTIVE',
          ownerId: newMeter.id,
        });

      expect(status).toBe(200);
      expect(body).toStrictEqual(catShape);
    });
  });

  describe('DELETE /tokens/:id', () => {
    it('deletes a token', async () => {
      const { status, body } = await request(app.getHttpServer()).delete(
        `/tokens/${token.id}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual({ deleted: true });
    });
  });
});
