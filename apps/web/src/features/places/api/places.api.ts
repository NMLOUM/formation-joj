import {
  type FreeHours,
  type SiteResponse,
  siteListSchema,
  type VisitSuggestionResponse,
  visitSuggestionListSchema,
} from '@joj/shared';
import { api } from '@/lib/api';

/** Les appels HTTP de la fonctionnalité, réponse validée par le schéma partagé. */
export const placesApi = {
  sites: (signal?: AbortSignal) =>
    api.request<SiteResponse[]>('/sites', { schema: siteListSchema, signal }),

  suggestions: (siteId: string, freeHours: FreeHours, signal?: AbortSignal) =>
    api.request<VisitSuggestionResponse[]>(`/sites/${siteId}/places?freeHours=${freeHours}`, {
      schema: visitSuggestionListSchema,
      signal,
    }),
};
