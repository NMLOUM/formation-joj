import { Module } from '@nestjs/common';
import { PlaceRepository } from './application/place.repository';
import { SiteRepository } from './application/site.repository';
import { ListSites } from './application/use-cases/list-sites';
import { SuggestPlaces } from './application/use-cases/suggest-places';
import { PlacesController } from './http/places.controller';
import { DrizzlePlaceRepository } from './infra/drizzle-place.repository';
import { DrizzleSiteRepository } from './infra/drizzle-site.repository';

@Module({
  controllers: [PlacesController],
  providers: [
    // Les ports (classes abstraites) sont reliés ici à leurs implémentations Drizzle.
    { provide: SiteRepository, useClass: DrizzleSiteRepository },
    { provide: PlaceRepository, useClass: DrizzlePlaceRepository },
    ListSites,
    SuggestPlaces,
  ],
})
export class PlacesModule {}
