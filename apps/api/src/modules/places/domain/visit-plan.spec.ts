import { describe, expect, it } from 'vitest';
import { Place } from './place';
import { Site } from './site';
import { suggestVisits } from './visit-plan';

/** Un degré de latitude, en kilomètres, sur la sphère terrestre de rayon 6 371 km. */
const KM_PER_DEGREE = (Math.PI / 180) * 6371;

const diamniadio = Site.restore({
  id: 'diamniadio',
  name: 'Diamniadio',
  latitude: 14.72,
  longitude: -17.18,
});

/** Un lieu plein nord du site, à `km` kilomètres. */
function placeNorth(name: string, km: number, visitMinutes: number): Place {
  return Place.restore({
    id: `place-${name}`,
    name,
    latitude: diamniadio.latitude + km / KM_PER_DEGREE,
    longitude: diamniadio.longitude,
    visitMinutes,
  });
}

// Les lieux de la spec : A à 2 km (30 min), B à 4 km (90 min), C à 6 km (20 min).
const places = [placeNorth('C', 6, 20), placeNorth('A', 2, 30), placeNorth('B', 4, 90)];

const summary = (freeHours: 1 | 2 | 3) =>
  suggestVisits(diamniadio, places, freeHours).map((s) => ({
    name: s.place.name,
    distanceKm: s.distanceKm,
    travelMinutes: s.travelMinutes,
    fits: s.fits,
  }));

describe('suggestVisits', () => {
  it('001-AS1: sorts places from nearest to farthest', () => {
    expect(summary(3)).toEqual([
      { name: 'A', distanceKm: 2, travelMinutes: 6, fits: true },
      { name: 'B', distanceKm: 4, travelMinutes: 12, fits: true },
      { name: 'C', distanceKm: 6, travelMinutes: 18, fits: true },
    ]);
  });

  it('001-AS2: moves a place that does not fit the free time to the bottom', () => {
    expect(summary(1)).toEqual([
      { name: 'A', distanceKm: 2, travelMinutes: 6, fits: true },
      { name: 'C', distanceKm: 6, travelMinutes: 18, fits: true },
      { name: 'B', distanceKm: 4, travelMinutes: 12, fits: false },
    ]);
  });

  it('001-AS2: keeps a place whose round trip and visit take exactly the free time', () => {
    // 5 km = 15 min d'aller, 30 min de visite, 15 min de retour : 60 min pour 1 h.
    const exact = placeNorth('D', 5, 30);

    const [suggestion] = suggestVisits(diamniadio, [exact], 1);

    expect(suggestion).toMatchObject({ travelMinutes: 15, fits: true });
  });
});
