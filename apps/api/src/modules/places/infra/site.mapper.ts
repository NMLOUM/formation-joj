import { Site } from '../domain/site';
import type { SiteRow } from './places.schema';

/** Ligne de la table → entité. Les sites ne sont jamais écrits par l'application. */
export function toDomain(row: SiteRow): Site {
  return Site.restore({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
  });
}
