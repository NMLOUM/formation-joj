import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Place } from '../domain/place';
import { Site } from '../domain/site';
import { DrizzlePlaceRepository } from './drizzle-place.repository';
import { DrizzleSiteRepository } from './drizzle-site.repository';
import { places, sites } from './places.schema';

describe('Drizzle sites and places repositories (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    // La liste préparée par l'équipe, comme la charge `pnpm db:seed`.
    await connection.db.insert(sites).values([
      { id: 'saly', name: 'Saly', latitude: 14.45, longitude: -17.01 },
      { id: 'diamniadio', name: 'Diamniadio', latitude: 14.72, longitude: -17.18 },
    ]);
    await connection.db.insert(places).values({
      id: '0199f5c2-0000-7000-8000-000000000001',
      name: 'Lac Rose',
      latitude: 14.84,
      longitude: -17.23,
      visitMinutes: 60,
    });
  });

  afterAll(() => connection?.close());

  it('001-AS1: reads the sites and places of the prepared list', async () => {
    const siteRepository = new DrizzleSiteRepository(connection.db);
    const placeRepository = new DrizzlePlaceRepository(connection.db);

    expect((await siteRepository.list()).map((site) => site.name)).toEqual(['Diamniadio', 'Saly']);
    expect(await siteRepository.findById('diamniadio')).toEqual(
      Site.restore({ id: 'diamniadio', name: 'Diamniadio', latitude: 14.72, longitude: -17.18 }),
    );
    expect(await siteRepository.findById('thies')).toBeNull();
    expect(await placeRepository.list()).toEqual([
      Place.restore({
        id: '0199f5c2-0000-7000-8000-000000000001',
        name: 'Lac Rose',
        latitude: 14.84,
        longitude: -17.23,
        visitMinutes: 60,
      }),
    ]);
  });
});
