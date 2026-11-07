import { type ProblemDetails, suggestPlacesQuerySchema } from '@joj/shared';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import type { z } from 'zod';
import { mockControl } from './control';
import { fixture, suggestionKey } from './fixture';

/**
 * La fausse API des tests du front : le même contrat que apps/api (mêmes schémas zod, mêmes
 * codes d'erreur, même format RFC 9457), sur les données de `fixture.ts`. Une nouvelle route
 * de l'API s'ajoute ici (un `http.get`, `http.post`… par route), avec son test dans `handlers.test.ts`.
 */

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export function problem(
  status: number,
  code: string,
  detail: string,
  extra: Pick<ProblemDetails, 'errors' | 'details'> = {},
) {
  return HttpResponse.json(
    {
      type: `urn:problem-type:${code.toLowerCase().replaceAll('_', '-')}`,
      title: TITLES[status] ?? 'Error',
      status,
      code,
      detail,
      ...extra,
    } satisfies ProblemDetails,
    { status, headers: { 'content-type': 'application/problem+json' } },
  );
}

/** Latence, puis panne armée par `mockControl` : renvoie la réponse d'erreur, ou `null`. */
export async function gate(method: string, path: string): Promise<Response | null> {
  if (mockControl.latency > 0) await delay(mockControl.latency);
  const status = mockControl.takeFailure(`${method} ${path}`);
  return status === null ? null : problem(status, 'INTERNAL_ERROR', 'Mocked failure.');
}

export function validationFailed(error: z.ZodError) {
  return problem(400, 'VALIDATION_FAILED', 'The request is invalid.', {
    errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}

const siteNotFound = (id: string) =>
  problem(404, 'SITE_NOT_FOUND', `No site with id ${id}`, { details: { id } });

export const handlers: RequestHandler[] = [
  http.get('*/api/sites', async () => {
    const failure = await gate('GET', '/api/sites');
    if (failure) return failure;
    return HttpResponse.json([...fixture.sites].sort((x, y) => x.name.localeCompare(y.name)));
  }),

  http.get('*/api/sites/:siteId/places', async ({ params, request }) => {
    const failure = await gate('GET', '/api/sites/:siteId/places');
    if (failure) return failure;
    // Même ordre de contrôle que l'API : la query d'abord (DTO), puis le site (cas d'usage).
    const query = suggestPlacesQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) return validationFailed(query.error);
    const siteId = String(params['siteId']);
    if (!fixture.sites.some((site) => site.id === siteId)) return siteNotFound(siteId);
    return HttpResponse.json(
      fixture.suggestions.get(suggestionKey(siteId, query.data.freeHours)) ?? [],
    );
  }),
];
