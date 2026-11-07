import { Injectable } from '@nestjs/common';
import type { Site } from '../../domain/site';
import { SiteRepository } from '../site.repository';

/** Les sites d'épreuve, pour la liste de choix de l'écran. */
@Injectable()
export class ListSites {
  constructor(private readonly sites: SiteRepository) {}

  execute(): Promise<Site[]> {
    return this.sites.list();
  }
}
