import type { Place } from '../../domain/place';
import { PlaceRepository } from '../place.repository';

/** Fake du port, pour tester l'application sans base. Les entités sont en lecture seule. */
export class InMemoryPlaceRepository extends PlaceRepository {
  constructor(private readonly places: readonly Place[] = []) {
    super();
  }

  async list(): Promise<Place[]> {
    return [...this.places];
  }
}
