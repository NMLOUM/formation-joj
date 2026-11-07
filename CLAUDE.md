# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/spec` → `/spec-plan` → `/tdd-task` → `/converge`, selon les six principes de `specs/constitution.md`.
- Test d'abord, vu en échec pour la bonne raison, puis le code minimal pour le faire passer.
- Ordre de construction (voir `README.md`, « Ajouter une fonctionnalité ») : schéma partagé → domaine → cas d'usage → table et migration → repository Drizzle → controller et e2e → fausse API MSW → écran.
- Une tâche = un commit Conventional Commits ; `pnpm verify` avant de commiter, `pnpm check` avant de conclure une fonctionnalité. Jamais de `--no-verify`.

## Architecture

- `packages/shared` : schémas Zod d'entrée et de réponse, importés par l'API comme par le front. Il n'importe ni `apps/api` ni `apps/web`.
- API : un module par domaine dans `apps/api/src/modules/<domaine>/`, sur le modèle de `disciplines` :
  - `domain/` : entités et erreurs, TypeScript pur (aucun import de NestJS, Drizzle ou `pg`, vérifié par oxlint) ;
  - `application/` : le port `<entité>.repository.ts` (classe abstraite), `use-cases/` et `testing/` (repository en mémoire) ;
  - `infra/` : table Drizzle `<nom>.schema.ts`, mapper (`toDomain`/`toRow`), repository Drizzle ;
  - `http/` : controller fin. Le `<nom>.module.ts` relie le port à son implémentation et s'ajoute à `src/app.module.ts`.
- `apps/api/src/core/` : transverse (config, base, `AppError`, `ProblemDetailsFilter`, santé). Les migrations sont générées par `pnpm db:generate`, jamais éditées à la main.
- Front : `src/features/<nom>/api/` (appels HTTP dans `<nom>.api.ts`, hooks TanStack Query dans `<nom>.queries.ts`) et `components/` ; les pages dans `src/routes/` ; la fausse API dans `src/mocks/`, au même contrat que `apps/api`.

## Concepts appréciés

- Une classe par cas d'usage, `@Injectable()`, avec une seule méthode publique `execute()`.
- Entités à constructeur privé : `create()` applique les règles métier, `restore()` relit la base sans les rejouer.
- Les cas d'usage dépendent du port abstrait, jamais de Drizzle : on les teste avec le repository en mémoire.
- Controller fin : valider (DTO `createZodDto`), appeler un cas d'usage, sérialiser (`@ZodSerializerDto`). Aucune règle métier.
- Typage strict, pas de `any` ; fonctions courtes ; commentaires qui disent le pourquoi.

## Bonnes pratiques

- Toute erreur métier est une `AppError` (code stable + catégorie `VALIDATION`, `NOT_FOUND`, `CONFLICT` ou `BUSINESS_RULE`), déclarée dans `domain/<nom>.errors.ts`. Seul `ProblemDetailsFilter` la traduit en HTTP (400, 404, 409, 422, RFC 9457).
- Toute entrée HTTP (corps, paramètres) est validée par un schéma Zod de `packages/shared`, jamais à la main dans le controller. Le front valide aussi les réponses avec ces schémas.
- Aucun secret dans le code : les valeurs sensibles vont dans `apps/api/.env` (ignoré par git).
- Tests de l'API : `*.spec.ts` (domaine et cas d'usage, en mémoire), `*.int.spec.ts` (repository sur PGlite en mémoire), `apps/api/test/*.e2e.spec.ts` (supertest).
- Tests du front : `*.test.tsx` à côté du fichier testé, contre la fausse API MSW ; un audit d'accessibilité `*.a11y.test.tsx` par route.
- Tests sans Docker ni réseau : `pnpm test` doit passer partout.

## Nommage

- Fichiers en kebab-case, suffixés par leur rôle : `create-discipline.ts`, `discipline.mapper.ts`, `drizzle-discipline.repository.ts`, `disciplines.controller.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines`. Repositories : `DisciplineRepository` (port), `DrizzleDisciplineRepository`, `InMemoryDisciplineRepository`.
- Codes d'erreur en MAJUSCULES, préfixés par l'entité : `DISCIPLINE_NOT_FOUND`, `DISCIPLINE_NAME_TAKEN`.
- Colonnes en base en snake_case (`created_at`), propriétés TypeScript en camelCase (`createdAt`).
- Titres de tests en anglais, préfixés par le scénario : `it('001-AS2: rejects a full slot')` (sans spec : `it('AS2: …')`).
- Commits Conventional Commits avec portée, et pour une tâche la tâche et son scénario : `feat(benevoles): T03 refuse a full slot (001-AS2)`.
