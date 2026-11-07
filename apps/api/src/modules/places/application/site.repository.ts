import type { Site } from '../domain/site';

/**
 * Port de lecture des sites d'épreuve : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSiteRepository (infra) et InMemorySiteRepository (tests).
 */
export abstract class SiteRepository {
  abstract findById(id: string): Promise<Site | null>;
  /** Triés par nom. */
  abstract list(): Promise<Site[]>;
}
