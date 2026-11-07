import type { Place } from '../domain/place';

/**
 * Port de lecture des lieux : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzlePlaceRepository (infra) et InMemoryPlaceRepository (tests).
 */
export abstract class PlaceRepository {
  /** Tous les lieux de la liste préparée, sans ordre garanti : le domaine les classe. */
  abstract list(): Promise<Place[]>;
}
