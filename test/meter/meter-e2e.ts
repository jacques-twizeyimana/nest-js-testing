import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Meter, User } from '@prisma/client';
import { useContainer } from 'class-validator';

describe('Meters (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let meter: Meter;
  let user: User;
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

    user = await prisma.user.create({
      data: {
        name: 'Jacques',
        email: 'sandberg@gmail.com',
        status: 'ACTIVE',
      },
    });

    meter = await prisma.meter.create({
      data: {
        code: '7188171',
        status: 'ACTIVE',
        age: 4,
        user: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.meter.create({
      data: {
        code: '189187',
        status: 'INACTIVE',
        user: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.meter.create({
      data: {
        code: 'Cat3',
        status: 'ACTIVE',
        age: 6,
        user: {
          connect: { id: user.id },
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

  describe('GET /meters', () => {
    it('returns a list of meters', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/meters',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([catShape]));
    });

    describe('with code filter', () => {
      it('returns a filtered list of meters', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/meters?code=${meter.code}`,
        );

        expect(status).toBe(200);
        expect(body).toStrictEqual(expect.arrayContaining([catShape]));
        expect(body).toHaveLength(1);
      });
    });
  });

  describe('GET /meters/:id', () => {
    it('returns a meter', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/meters/${meter.id}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(catShape);
    });
  });

  describe('POST /meters', () => {
    it('creates a meter', async () => {
      const beforeCount = await prisma.meter.count();

      const { status, body } = await request(app.getHttpServer())
        .post('/meters')
        .send({
          code: '6781909',
          status: 'ACTIVE',
          age: 5,
          ownerId: user.id,
        });

      const afterCount = await prisma.meter.count();

      expect(status).toBe(201);
      expect(body).toStrictEqual(catShape);
      expect(afterCount - beforeCount).toBe(1);
    });

    describe('with non existing user', () => {
      it('returns HTTP status 400', async () => {
        const beforeCount = await prisma.meter.count();

        const { status, body } = await request(app.getHttpServer())
          .post('/meters')
          .send({
            code: '671898',
            status: 'ACTIVE',
            age: 5,
            ownerId: 12,
          });

        const afterCount = await prisma.meter.count();

        expect(status).toBe(400);
        expect(afterCount - beforeCount).toBe(0);
      });
    });
  });
  describe('PATCH /meters/:id', () => {
    it('updates a meter', async () => {
      const newUser = await prisma.user.create({
        data: {
          code: 'NewUser',
          age: 28,
        },
      });

      const { status, body } = await request(app.getHttpServer())
        .patch(`/meters/${meter.id}`)
        .send({
          code: '1678919',
          status: 'INACTIVE',
          ownerId: newUser.id,
        });

      expect(status).toBe(200);
      expect(body).toStrictEqual(catShape);
    });
  });

  describe('DELETE /meters/:id', () => {
    it('deletes a meter', async () => {
      const { status, body } = await request(app.getHttpServer()).delete(
        `/meters/${meter.id}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual({ deleted: true });
    });
  });
});
