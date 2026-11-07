import type { FreeHours } from '@joj/shared';
import { useQuery } from '@tanstack/react-query';
import { placesApi } from './places.api';

export const useSites = () =>
  useQuery({ queryKey: ['sites'], queryFn: ({ signal }) => placesApi.sites(signal) });

/** Rien n'est demandé tant que le visiteur n'a pas choisi de site. */
export const useSuggestions = (siteId: string, freeHours: FreeHours) =>
  useQuery({
    queryKey: ['sites', siteId, 'places', freeHours],
    queryFn: ({ signal }) => placesApi.suggestions(siteId, freeHours, signal),
    enabled: siteId !== '',
  });
