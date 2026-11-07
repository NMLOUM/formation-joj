import { describe, expect, it } from 'vitest';
import { Place } from '../domain/place';
import { PlaceError } from '../domain/places.errors';
import { Site } from '../domain/site';
import { InMemoryPlaceRepository } from './testing/in-memory-place.repository';
import { InMemorySiteRepository } from './testing/in-memory-site.repository';
import { SuggestPlaces } from './use-cases/suggest-places';

const diamniadio = Site.restore({
  id: 'diamniadio',
  name: 'Diamniadio',
  latitude: 14.72,
  longitude: -17.18,
});

const lacRose = Place.restore({
  id: '0199f5c2-0000-7000-8000-000000000001',
  name: 'Lac Rose',
  latitude: 14.84,
  longitude: -17.23,
  visitMinutes: 60,
});

function setup() {
  const sites = new InMemorySiteRepository([diamniadio]);
  const places = new InMemoryPlaceRepository([lacRose]);
  return { suggestPlaces: new SuggestPlaces(sites, places) };
}

describe('places (application layer)', () => {
  it('001-AS3: rejects an unknown site', async () => {
    const { suggestPlaces } = setup();

    const failure = suggestPlaces.execute('thies', 2);

    await expect(failure).rejects.toBeInstanceOf(PlaceError);
    await expect(failure).rejects.toMatchObject({ code: 'SITE_NOT_FOUND', kind: 'NOT_FOUND' });
  });
});
