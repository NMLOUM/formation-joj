import { Injectable } from '@nestjs/common';
import type { FreeHours } from '@joj/shared';
import { siteNotFound } from '../../domain/places.errors';
import { suggestVisits, type VisitSuggestion } from '../../domain/visit-plan';
import { PlaceRepository } from '../place.repository';
import { SiteRepository } from '../site.repository';

/** Les lieux autour d'un site d'épreuve, classés pour le temps libre du visiteur. */
@Injectable()
export class SuggestPlaces {
  constructor(
    private readonly sites: SiteRepository,
    private readonly places: PlaceRepository,
  ) {}

  async execute(siteId: string, freeHours: FreeHours): Promise<VisitSuggestion[]> {
    const site = await this.sites.findById(siteId);
    if (!site) throw siteNotFound(siteId);
    return suggestVisits(site, await this.places.list(), freeHours);
  }
}
