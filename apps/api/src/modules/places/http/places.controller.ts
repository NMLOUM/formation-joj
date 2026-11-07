import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  siteIdParamsSchema,
  type SiteResponse,
  siteSchema,
  suggestPlacesQuerySchema,
  type VisitSuggestionResponse,
  visitSuggestionSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { ListSites } from '../application/use-cases/list-sites';
import { SuggestPlaces } from '../application/use-cases/suggest-places';
import type { Site } from '../domain/site';
import type { VisitSuggestion } from '../domain/visit-plan';

class SiteIdParamsDto extends createZodDto(siteIdParamsSchema) {}
class SuggestPlacesQueryDto extends createZodDto(suggestPlacesQuerySchema) {}
class SiteDto extends createZodDto(siteSchema) {}
class VisitSuggestionDto extends createZodDto(visitSuggestionSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('sites')
@Controller('sites')
export class PlacesController {
  constructor(
    private readonly listSites: ListSites,
    private readonly suggestPlaces: SuggestPlaces,
  ) {}

  @Get()
  @ZodSerializerDto([SiteDto])
  async list(): Promise<SiteResponse[]> {
    return (await this.listSites.execute()).map(toSiteResponse);
  }

  @Get(':siteId/places')
  @ZodSerializerDto([VisitSuggestionDto])
  async suggest(
    @Param() { siteId }: SiteIdParamsDto,
    @Query() { freeHours }: SuggestPlacesQueryDto,
  ): Promise<VisitSuggestionResponse[]> {
    return (await this.suggestPlaces.execute(siteId, freeHours)).map(toSuggestionResponse);
  }
}

function toSiteResponse(site: Site): SiteResponse {
  return { id: site.id, name: site.name };
}

function toSuggestionResponse(suggestion: VisitSuggestion): VisitSuggestionResponse {
  return {
    id: suggestion.place.id,
    name: suggestion.place.name,
    distanceKm: suggestion.distanceKm,
    travelMinutes: suggestion.travelMinutes,
    visitMinutes: suggestion.place.visitMinutes,
    fits: suggestion.fits,
  };
}
