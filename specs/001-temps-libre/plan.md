# 001 — Que faire avec mon temps libre : plan

**Statut** : Validé

## 1. Résumé

On construit un module `places` côté API et un écran côté front. Le visiteur choisit son site d'épreuve et son temps libre, et voit les lieux autour de ce site, du plus proche au plus loin, avec leur distance, leur temps de trajet et leur durée de visite ; les lieux qu'il n'a pas le temps de visiter passent en bas avec la mention « Pas le temps ». Les sites et les lieux ne sont pas saisis dans l'application : ils viennent d'une liste préparée par l'équipe, chargée en base par `pnpm db:seed`. Le travail tient en six tâches, dans l'ordre des couches : schémas partagés, règle de classement, cas d'usage, persistance, routes HTTP, puis écran. Les catégories, la fiche d'un lieu, la géolocalisation et la saisie des lieux sont laissées de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec             | Dans le code      | Ce que c'est                                                                   |
| ------------------------ | ----------------- | ------------------------------------------------------------------------------ |
| site d'épreuve           | `Site`            | Un lieu de compétition (Dakar, Diamniadio, Saly), point de départ du visiteur  |
| lieu                     | `Place`           | Un endroit à visiter, avec ses coordonnées et sa durée de visite conseillée    |
| durée de visite          | `visitMinutes`    | Le temps conseillé sur place, en minutes                                       |
| temps libre              | `freeHours`       | Le temps dont dispose le visiteur : 1, 2 ou 3 heures                           |
| distance                 | `distanceKm`      | La distance à vol d'oiseau entre le site et le lieu, en kilomètres, au dixième |
| temps de trajet          | `travelMinutes`   | La durée d'un aller, estimée à 20 km/h, arrondie à la minute supérieure        |
| tient / « Pas le temps » | `fits`            | Vrai si aller, visite et retour tiennent dans le temps libre                   |
| suggestion               | `VisitSuggestion` | Un lieu tel que le visiteur le voit : distance, trajet, visite et `fits`       |
| proposer les lieux       | `SuggestPlaces`   | Le cas d'usage qui classe les lieux autour d'un site pour un temps libre donné |

## 2. Fichiers par couche

On crée le module `places`, organisé comme le module de référence `disciplines` de la branche `main` : un dossier par couche dans `apps/api/src/modules/places/`. Seuls les fichiers nécessaires aux quatre scénarios et à l'écran sont listés.

- **shared** :
  - `packages/shared/src/places.ts` contient les schémas Zod : `FREE_HOURS` (1, 2, 3), `siteIdParamsSchema` (identifiant de site non vide), `suggestPlacesQuerySchema` (`freeHours` reçu en texte dans l'adresse, accepté seulement s'il vaut 1, 2 ou 3, puis converti en nombre), et les réponses `siteSchema`, `siteListSchema`, `visitSuggestionSchema` et `visitSuggestionListSchema`.
  - `packages/shared/src/places.spec.ts` teste ces schémas.
  - `packages/shared/src/index.ts` exporte le nouveau fichier.
- **domain** :
  - `domain/site.ts` et `domain/place.ts` sont les entités `Site` et `Place`, relues depuis la base par `restore()` ; elles n'ont pas de règle de création, puisque les lieux ne sont pas saisis dans l'application.
  - `domain/visit-plan.ts` porte les deux règles de la spec : `suggestVisits(site, places, freeHours)` calcule pour chaque lieu sa distance (formule de haversine, arrondie au dixième de kilomètre), son temps de trajet (3 minutes par kilomètre, arrondi à la minute supérieure) et `fits` (aller + visite + retour ≤ temps libre, égalité comprise), puis trie : d'abord les lieux qui tiennent, puis les autres, chaque groupe du plus proche au plus loin.
  - `domain/places.errors.ts` déclare le code `SITE_NOT_FOUND` et la classe `PlaceError`.
  - `domain/visit-plan.spec.ts` teste ces règles avec les lieux A, B et C de la spec.
- **application** :
  - `application/site.repository.ts` est le port `SiteRepository` : `findById(id)` et `list()` (triés par nom).
  - `application/place.repository.ts` est le port `PlaceRepository` : `list()`.
  - `application/testing/in-memory-site.repository.ts` et `application/testing/in-memory-place.repository.ts` sont les repositories en mémoire des tests.
  - `application/use-cases/list-sites.ts` (`ListSites`) renvoie les sites, pour la liste de choix de l'écran.
  - `application/use-cases/suggest-places.ts` (`SuggestPlaces`) charge le site (ou lève `SITE_NOT_FOUND`), lit les lieux et appelle `suggestVisits`.
  - `application/places.application.spec.ts` teste les deux cas d'usage avec les repositories en mémoire.
- **infra** :
  - `infra/places.schema.ts` déclare les tables `sites` et `places` (section 3).
  - `infra/site.mapper.ts` et `infra/place.mapper.ts` convertissent une ligne en entité (`toDomain`).
  - `infra/drizzle-site.repository.ts` et `infra/drizzle-place.repository.ts` implémentent les ports.
  - `infra/drizzle-places.repository.int.spec.ts` teste les deux repositories sur PGlite en mémoire.
  - `apps/api/data/01-sites.json` et `apps/api/data/02-places.json` sont la liste préparée : les trois sites et une dizaine de lieux réels autour d'eux, avec des coordonnées approximatives et une durée de visite.
- **http** :
  - `http/places.controller.ts` est le controller fin, avec deux routes :
    - `GET /api/sites` renvoie 200 avec la liste des sites `[{ id, name }]`, triée par nom.
    - `GET /api/sites/:siteId/places?freeHours=1` renvoie 200 avec la liste des suggestions `[{ id, name, distanceKm, travelMinutes, visitMinutes, fits }]`, dans l'ordre de la spec ; 404 `SITE_NOT_FOUND` si le site n'existe pas, 400 `VALIDATION_FAILED` si `freeHours` ne vaut pas 1, 2 ou 3.
  - `places.module.ts` relie les ports à leurs implémentations Drizzle et déclare les cas d'usage.
  - `apps/api/src/app.module.ts` ajoute `PlacesModule` à ses `imports`.
  - `apps/api/test/places.e2e.spec.ts` teste les deux routes de bout en bout, après avoir inséré dans la base de test le site Diamniadio et les lieux A, B et C.
- **web** :
  - `apps/web/src/mocks/fixture.ts` ajoute les sites et des suggestions précalculées par site et par temps libre (dont l'exemple de la spec) ; `apps/web/src/mocks/handlers.ts` ajoute les deux routes, avec les mêmes schémas et les mêmes codes d'erreur ; `apps/web/src/mocks/handlers.test.ts` les teste.
  - `features/places/api/places.api.ts` appelle les deux routes et valide les réponses ; `features/places/api/places.queries.ts` contient les hooks TanStack Query.
  - `features/places/components/free-time-page.tsx` est l'écran : la liste des sites, les trois boutons de temps libre, l'invitation à choisir un site, puis la liste.
  - `features/places/components/visit-list.tsx` affiche chaque lieu (nom, distance, trajet, visite) et la mention « Pas le temps ».
  - `features/places/components/free-time-page.test.tsx` teste l'écran contre la fausse API.
  - `apps/web/src/routes/index.tsx` affiche cet écran sur la page d'accueil ; `apps/web/src/routes/index.a11y.test.tsx` en fait l'audit d'accessibilité.

## 3. Données

On stocke les sites d'épreuve et les lieux de la liste préparée, dans deux tables chargées par `pnpm db:seed`. Migration : `pnpm db:generate --name=create-sites-and-places`.

- **`sites`** : `id` (texte court, clé primaire, par exemple `diamniadio` : il apparaît dans l'adresse), `name` (varchar 100, non nul), `latitude` et `longitude` (nombres à virgule, non nuls).
  - Unicité `sites_name_key` sur `name` : deux sites ne portent pas le même nom dans la liste de choix.
- **`places`** : `id` (uuid, clé primaire), `name` (varchar 100, non nul), `latitude` et `longitude` (nombres à virgule, non nuls), `visit_minutes` (entier, non nul).
  - Contrainte `places_visit_minutes_check` (`visit_minutes >= 1`) : une durée de visite nulle ou négative fausserait la règle de temps libre d'AS2.
  - Pas de lien entre un lieu et un site : la distance se calcule à la demande, depuis n'importe quel site.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP. Le temps libre mal formé est arrêté par le schéma Zod, qui renvoie le code existant `VALIDATION_FAILED`.

| Code AppError       | Catégorie  | HTTP | Quand                                             | Scénario |
| ------------------- | ---------- | ---- | ------------------------------------------------- | -------- |
| `SITE_NOT_FOUND`    | NOT_FOUND  | 404  | Aucun site d'épreuve n'a l'identifiant demandé    | AS3      |
| `VALIDATION_FAILED` | VALIDATION | 400  | Le temps libre ne vaut pas 1, 2 ou 3 (schéma Zod) | AS4      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit ; l'e2e vérifie en plus le statut et le corps vus par l'appelant, et l'écran ce que voit le visiteur.

| Scénario | Fichier de test                                      | Niveau   | Ce que le test vérifie                                                                    |
| -------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| AS1      | `domain/visit-plan.spec.ts`                          | unitaire | Avec 3 h : A, B, C dans cet ordre, à 2, 4 et 6 km, 6, 12 et 18 min de trajet, tous `fits` |
| AS1      | `apps/api/test/places.e2e.spec.ts`                   | e2e      | 200 et un corps conforme à `visitSuggestionListSchema`, dans l'ordre A, B, C              |
| AS1      | `features/places/components/free-time-page.test.tsx` | écran    | Après le choix du site et de 3 h, les lieux s'affichent avec distance, trajet et visite   |
| AS2      | `domain/visit-plan.spec.ts`                          | unitaire | Avec 1 h : A, C, puis B, avec B non `fits` (114 min) ; un total égal au temps libre tient |
| AS2      | `apps/api/test/places.e2e.spec.ts`                   | e2e      | 200, ordre A, C, B, et `fits: false` pour B seulement                                     |
| AS2      | `features/places/components/free-time-page.test.tsx` | écran    | Avec 1 h, B est en dernier et porte la mention « Pas le temps »                           |
| AS3      | `application/places.application.spec.ts`             | unitaire | `SuggestPlaces` lève `SITE_NOT_FOUND` pour le site `thies`                                |
| AS3      | `apps/api/test/places.e2e.spec.ts`                   | e2e      | 404 `SITE_NOT_FOUND`                                                                      |
| AS4      | `packages/shared/src/places.spec.ts`                 | unitaire | `freeHours` à 4, 0 ou « abc » est refusé ; 1, 2 et 3 sont acceptés                        |
| AS4      | `apps/api/test/places.e2e.spec.ts`                   | e2e      | 400 `VALIDATION_FAILED`, avec `freeHours` comme champ en cause dans `errors`              |

## 6. Tâches

Six tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [x] T01 [001-AS4] Écrire d'abord `packages/shared/src/places.spec.ts` (« 001-AS4: rejects a free time other than 1, 2 or 3 hours »), puis `packages/shared/src/places.ts` et son export dans `index.ts`
- [ ] T02 [001-AS1, AS2] Écrire d'abord `domain/visit-plan.spec.ts` (« 001-AS1: sorts places from nearest to farthest », « 001-AS2: moves a place that does not fit the free time to the bottom »), puis `site.ts`, `place.ts`, `visit-plan.ts` et `places.errors.ts`
- [ ] T03 [001-AS3] Écrire d'abord `application/places.application.spec.ts` (« 001-AS3: rejects an unknown site »), puis les ports, les repositories en mémoire, `ListSites` et `SuggestPlaces`
- [ ] T04 [001-AS1] Écrire d'abord `infra/drizzle-places.repository.int.spec.ts` (« 001-AS1: reads the sites and places of the prepared list »), puis `places.schema.ts`, la migration générée, les mappers, les repositories Drizzle et les fichiers `apps/api/data/*.json`
- [ ] T05 [001-AS1, AS2, AS3, AS4] Écrire d'abord `apps/api/test/places.e2e.spec.ts` (un test par scénario, « 001-AS1: lists places by distance (200) » … « 001-AS4: … »), puis `places.controller.ts`, `places.module.ts` et l'ajout à `app.module.ts`
- [ ] T06 [001-AS1, AS2] Écrire d'abord `features/places/components/free-time-page.test.tsx` (« 001-AS1: shows the places around the chosen site », « 001-AS2: marks a place that does not fit as "Pas le temps" »), puis la fausse API et son test, `places.api.ts`, `places.queries.ts`, les composants, la page d'accueil et son audit d'accessibilité
