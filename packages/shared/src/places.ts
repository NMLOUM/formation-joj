import { z } from 'zod';

/** Les temps libres proposés au visiteur, en heures. */
export const FREE_HOURS = [1, 2, 3] as const;
export type FreeHours = (typeof FREE_HOURS)[number];

/** L'adresse transporte du texte : chaque valeur acceptée a son nombre. */
const FREE_HOURS_BY_TEXT = { '1': 1, '2': 2, '3': 3 } as const satisfies Record<string, FreeHours>;
const FREE_HOURS_TEXT = ['1', '2', '3'] as const;

/** Paramètre `:siteId` : un mot court, lisible dans l'adresse (`diamniadio`). */
export const siteIdParamsSchema = z.object({ siteId: z.string().trim().min(1).max(50) });

/** Query de `GET /api/sites/:siteId/places`. */
export const suggestPlacesQuerySchema = z.object({
  freeHours: z.enum(FREE_HOURS_TEXT).transform((hours): FreeHours => FREE_HOURS_BY_TEXT[hours]),
});
export type SuggestPlacesQuery = z.infer<typeof suggestPlacesQuerySchema>;

/** Un site d'épreuve tel que l'API le renvoie. */
export const siteSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SiteResponse = z.infer<typeof siteSchema>;

export const siteListSchema = z.array(siteSchema);

/** Un lieu vu depuis un site, pour un temps libre donné. */
export const visitSuggestionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  distanceKm: z.number().nonnegative(),
  travelMinutes: z.number().int().nonnegative(),
  visitMinutes: z.number().int().positive(),
  /** Vrai si aller, visite et retour tiennent dans le temps libre. */
  fits: z.boolean(),
});
export type VisitSuggestionResponse = z.infer<typeof visitSuggestionSchema>;

export const visitSuggestionListSchema = z.array(visitSuggestionSchema);
