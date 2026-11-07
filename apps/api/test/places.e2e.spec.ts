import type { INestApplication } from '@nestjs/common';
import { siteListSchema, visitSuggestionListSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { places, sites } from '../src/modules/places/infra/places.schema';
import { createTestApp } from './create-test-app';

/** Un degré de latitude, en kilomètres, sur la sphère terrestre de rayon 6 371 km. */
const KM_PER_DEGREE = (Math.PI / 180) * 6371;
const DIAMNIADIO = { id: 'diamniadio', name: 'Diamniadio', latitude: 14.72, longitude: -17.18 };

/** Un lieu plein nord de Diamniadio, à `km` kilomètres. */
const placeNorth = (id: string, name: string, km: number, visitMinutes: number) => ({
  id,
  name,
  latitude: DIAMNIADIO.latitude + km / KM_PER_DEGREE,
  longitude: DIAMNIADIO.longitude,
  visitMinutes,
});

describe('/api/sites (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    // La liste préparée de la spec : A à 2 km (30 min), B à 4 km (90 min), C à 6 km (20 min).
    const db = app.get<Database>(DATABASE);
    await db.insert(sites).values(DIAMNIADIO);
    await db
      .insert(places)
      .values([
        placeNorth('0199f5c2-0000-7000-8000-00000000000c', 'C', 6, 20),
        placeNorth('0199f5c2-0000-7000-8000-00000000000a', 'A', 2, 30),
        placeNorth('0199f5c2-0000-7000-8000-00000000000b', 'B', 4, 90),
      ]);
  });

  afterAll(() => app?.close());

  const suggestions = async (freeHours: string) => {
    const response = await api()
      .get('/api/sites/diamniadio/places')
      .query({ freeHours })
      .expect(200);
    return visitSuggestionListSchema
      .parse(response.body)
      .map(({ name, distanceKm, travelMinutes, visitMinutes, fits }) => ({
        name,
        distanceKm,
        travelMinutes,
        visitMinutes,
        fits,
      }));
  };

  it('001-AS1: lists the sites to choose from (200)', async () => {
    const response = await api().get('/api/sites').expect(200);

    expect(siteListSchema.parse(response.body)).toEqual([{ id: 'diamniadio', name: 'Diamniadio' }]);
  });

  it('001-AS1: lists places by distance (200)', async () => {
    expect(await suggestions('3')).toEqual([
      { name: 'A', distanceKm: 2, travelMinutes: 6, visitMinutes: 30, fits: true },
      { name: 'B', distanceKm: 4, travelMinutes: 12, visitMinutes: 90, fits: true },
      { name: 'C', distanceKm: 6, travelMinutes: 18, visitMinutes: 20, fits: true },
    ]);
  });

  it('001-AS2: moves a place that does not fit 1 h to the bottom (200)', async () => {
    expect(await suggestions('1')).toEqual([
      { name: 'A', distanceKm: 2, travelMinutes: 6, visitMinutes: 30, fits: true },
      { name: 'C', distanceKm: 6, travelMinutes: 18, visitMinutes: 20, fits: true },
      { name: 'B', distanceKm: 4, travelMinutes: 12, visitMinutes: 90, fits: false },
    ]);
  });

  it('001-AS3: rejects an unknown site (404 SITE_NOT_FOUND)', async () => {
    const response = await api()
      .get('/api/sites/thies/places')
      .query({ freeHours: '2' })
      .expect(404);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 404, code: 'SITE_NOT_FOUND' });
  });

  it('001-AS4: rejects a free time of 4 hours (400)', async () => {
    const response = await api()
      .get('/api/sites/diamniadio/places')
      .query({ freeHours: '4' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'freeHours' })]);
  });
});
