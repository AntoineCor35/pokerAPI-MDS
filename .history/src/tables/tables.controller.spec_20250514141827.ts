import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TablesModule } from './tables.module';
import { AuthGuard } from '../auth/decorators/public';

describe('TablesController', () => {
  let controller: TablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
    }).compile();

    controller = module.get<TablesController>(TablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('TablesController (e2e) - /tables/:id/status', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TablesModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return 401 if not authenticated', async () => {
    await request(app.getHttpServer())
      .get('/tables/1/status')
      .expect(401);
  });

  it('should return 200 and status if authenticated', async () => {
    // Simule un user authentifié (à adapter selon votre logique d'auth)
    await request(app.getHttpServer())
      .get('/tables/1/status')
      .set('Authorization', 'Bearer fake-token')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
