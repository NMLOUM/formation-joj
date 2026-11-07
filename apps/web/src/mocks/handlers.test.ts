/**
 * La fausse API tient le même contrat que apps/api : si elle s'en écarte, les tests du front
 * passent contre une API qui n'existe pas. Ces tests l'appellent avec `fetch`, sans React.
 */
import { siteListSchema, visitSuggestionListSchema } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { diamniadio, saly, UNKNOWN_SITE_ID } from './fixture';

const call = (path: string) => fetch(`http://localhost${path}`);

describe('mock sites API', () => {
  it('001-AS1: lists the sites sorted by name', async () => {
    const response = await call('/api/sites');
    expect(response.status).toBe(200);
    expect(siteListSchema.parse(await response.json())).toEqual([diamniadio, saly]);
  });

  it('001-AS2: ranks the places of the spec example for 1 h', async () => {
    const response = await call('/api/sites/diamniadio/places?freeHours=1');
    expect(response.status).toBe(200);
    const places = visitSuggestionListSchema.parse(await response.json());
    expect(places.map(({ name, fits }) => ({ name, fits }))).toEqual([
      { name: 'A', fits: true },
      { name: 'C', fits: true },
      { name: 'B', fits: false },
    ]);
  });

  it('001-AS3: rejects an unknown site (404 SITE_NOT_FOUND)', async () => {
    const response = await call(`/api/sites/${UNKNOWN_SITE_ID}/places?freeHours=2`);
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ status: 404, code: 'SITE_NOT_FOUND' });
  });

  it('001-AS4: rejects a free time of 4 hours (400 VALIDATION_FAILED)', async () => {
    const response = await call('/api/sites/diamniadio/places?freeHours=4');
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(body.errors).toEqual([expect.objectContaining({ path: 'freeHours' })]);
  });
});
