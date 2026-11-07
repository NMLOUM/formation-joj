import type { Site } from '../../domain/site';
import { SiteRepository } from '../site.repository';

/** Fake fidèle au contrat du port (tri par nom), pour tester l'application sans base. */
export class InMemorySiteRepository extends SiteRepository {
  constructor(private readonly sites: readonly Site[] = []) {
    super();
  }

  async findById(id: string): Promise<Site | null> {
    return this.sites.find((site) => site.id === id) ?? null;
  }

  async list(): Promise<Site[]> {
    return [...this.sites].sort((a, b) => a.name.localeCompare(b.name));
  }
}
