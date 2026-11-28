import type { INestApplication } from '@nestjs/common';
import { disciplineListSchema, disciplineSchema, type DisciplineResponse } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

describe('/api/disciplines/:id/similaires (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  // La base est partagée entre les tests : un préfixe unique isole nos disciplines.
  const prefix = `Sim ${crypto.randomUUID().slice(0, 8)}`;
  const create = async (name: string, category: string): Promise<DisciplineResponse> => {
    const response = await api()
      .post('/api/disciplines')
      .send({ name: `${prefix} ${name}`, category })
      .expect(201);
    return disciplineSchema.parse(response.body);
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('000-AS6: lists the other disciplines of the same category, sorted by name (200)', async () => {
    const lutte = await create('Lutte', 'sports-de-combat');
    await create('Taekwondo', 'sports-de-combat');
    await create('Judo', 'sports-de-combat');
    await create('Natation', 'sports-nautiques');

    const response = await api().get(`/api/disciplines/${lutte.id}/similaires`).expect(200);

    const similar = disciplineListSchema.parse(response.body);
    expect(similar.every((d) => d.category === 'sports-de-combat')).toBe(true);
    expect(similar.map((d) => d.id)).not.toContain(lutte.id);
    const ours = similar.filter((d) => d.name.startsWith(prefix)).map((d) => d.name);
    expect(ours).toEqual([`${prefix} Judo`, `${prefix} Taekwondo`]);
  });

  it('000-AS11: answers 404 for an unknown discipline', async () => {
    const response = await api().get(`/api/disciplines/${UNKNOWN_ID}/similaires`).expect(404);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
  });

  it('000-AS11: rejects an id that is not a UUID (400)', async () => {
    const response = await api().get('/api/disciplines/pas-un-uuid/similaires').expect(400);
    expect(response.body).toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});
