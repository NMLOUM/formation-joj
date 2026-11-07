import type { FreeHours, SiteResponse, VisitSuggestionResponse } from '@joj/shared';

/**
 * Les données de la fausse API, en mémoire. Les handlers les lisent et les modifient comme la
 * vraie base ; `resetFixture()` (appelé après chaque test par `mockControl.reset()`) les remet
 * dans cet état, pour qu'un test ne dépende jamais de ce qu'un autre a créé ou supprimé.
 * Chaque ressource de l'API y ajoute sa liste, avec ses valeurs de départ.
 */

export const UNKNOWN_SITE_ID = 'thies';

export const diamniadio: SiteResponse = { id: 'diamniadio', name: 'Diamniadio' };
export const saly: SiteResponse = { id: 'saly', name: 'Saly' };

// L'exemple de la spec 001 : A à 2 km (30 min), B à 4 km (90 min), C à 6 km (20 min).
const a = {
  id: '0199f5c2-0000-7000-8000-00000000000a',
  name: 'A',
  distanceKm: 2,
  travelMinutes: 6,
  visitMinutes: 30,
};
const b = {
  id: '0199f5c2-0000-7000-8000-00000000000b',
  name: 'B',
  distanceKm: 4,
  travelMinutes: 12,
  visitMinutes: 90,
};
const c = {
  id: '0199f5c2-0000-7000-8000-00000000000c',
  name: 'C',
  distanceKm: 6,
  travelMinutes: 18,
  visitMinutes: 20,
};

/**
 * Les classements que l'API calculerait, précalculés : le front n'importe pas le domaine de
 * l'API, donc la fausse API ne refait pas le calcul. Clé : `<site>:<heures>`.
 */
const suggestionsFor = (fitsB: boolean): VisitSuggestionResponse[] =>
  fitsB
    ? [
        { ...a, fits: true },
        { ...b, fits: true },
        { ...c, fits: true },
      ]
    : [
        { ...a, fits: true },
        { ...c, fits: true },
        { ...b, fits: false },
      ];

export const suggestionKey = (siteId: string, freeHours: FreeHours) => `${siteId}:${freeHours}`;

const initial = () => ({
  sites: [diamniadio, saly],
  suggestions: new Map<string, VisitSuggestionResponse[]>([
    [suggestionKey('diamniadio', 1), suggestionsFor(false)],
    // Avec 2 h, B tient : 12 + 90 + 12 = 114 min ≤ 120.
    [suggestionKey('diamniadio', 2), suggestionsFor(true)],
    [suggestionKey('diamniadio', 3), suggestionsFor(true)],
  ]),
});

export const fixture = initial();

export function resetFixture(): void {
  Object.assign(fixture, initial());
}
