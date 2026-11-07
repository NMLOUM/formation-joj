import type { FreeHours } from '@joj/shared';
import type { Place } from './place';
import type { Site } from './site';

/** Vitesse moyenne retenue par la spec pour estimer un trajet en ville. */
const AVERAGE_SPEED_KMH = 20;
const EARTH_RADIUS_KM = 6371;

/** Un lieu tel que le visiteur le voit depuis son site, pour son temps libre. */
export interface VisitSuggestion {
  place: Place;
  distanceKm: number;
  travelMinutes: number;
  fits: boolean;
}

/**
 * Les deux règles de la spec : du plus proche au plus loin, et en bas de liste les lieux dont
 * aller, visite et retour dépassent le temps libre (égalité comprise : un lieu juste à temps tient).
 */
export function suggestVisits(
  site: Site,
  places: readonly Place[],
  freeHours: FreeHours,
): VisitSuggestion[] {
  const freeMinutes = freeHours * 60;
  return places
    .map((place) => suggest(site, place, freeMinutes))
    .sort((a, b) => Number(b.fits) - Number(a.fits) || a.distanceKm - b.distanceKm);
}

function suggest(site: Site, place: Place, freeMinutes: number): VisitSuggestion {
  const distanceKm = roundToTenth(distanceBetween(site, place));
  // Calculé sur la distance arrondie : 2 km donnent 6 min, pas 7 à cause d'un 2,0000001.
  const travelMinutes = Math.ceil((distanceKm / AVERAGE_SPEED_KMH) * 60);
  const fits = 2 * travelMinutes + place.visitMinutes <= freeMinutes;
  return { place, distanceKm, travelMinutes, fits };
}

interface Point {
  latitude: number;
  longitude: number;
}

/** Distance à vol d'oiseau (formule de haversine), en kilomètres. */
function distanceBetween(from: Point, to: Point): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const roundToTenth = (km: number): number => Math.round(km * 10) / 10;
