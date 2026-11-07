import { Place } from '../domain/place';
import type { PlaceRow } from './places.schema';

/** Ligne de la table → entité. Les lieux ne sont jamais écrits par l'application. */
export function toDomain(row: PlaceRow): Place {
  return Place.restore({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    visitMinutes: row.visitMinutes,
  });
}
