# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge` (principes : `specs/constitution.md`).
- Pas de code de production sans un test vu en échec pour la bonne raison (`pnpm tdd:red <fichier>`).
- `pnpm verify` avant chaque commit ; `pnpm check` avant de déclarer une fonctionnalité terminée.
- Une tâche = un commit Conventional Commits (`feat(api): …`) ; jamais `--no-verify`.
- Ne jamais modifier une spec ou un plan validés sans l'accord de l'humain.

## Architecture

- `apps/api` et `apps/web` importent `@joj/shared` (`packages/shared`) mais jamais l'un l'autre : ils ne se parlent que par HTTP.
- Un module par domaine dans `apps/api/src/modules/<domaine>/`, découpé en `domain/`, `application/`, `infra/`, `http/`, sur le modèle de `disciplines`.
- `domain/` reste du TypeScript pur : ni NestJS ni Drizzle (le lint le vérifie).
- `application/` définit le port (`<nom>.repository.ts`, classe abstraite) ; `infra/` l'implémente avec Drizzle ; le module Nest relie les deux.
- Les schémas Zod d'entrée et de sortie vivent dans `packages/shared` et servent à l'API comme au front.
- Front : une fonctionnalité dans `apps/web/src/features/<nom>/` (`api/` pour les appels HTTP et les hooks, `components/`), une page par fichier dans `src/routes/`.
- Ordre pour ajouter une fonctionnalité : section « Ajouter une fonctionnalité » de `README.md`.

## Concepts appréciés

- Typage strict : pas de `any` ; les codes d'erreur sont des unions littérales typées.
- Un cas d'usage = une classe avec une seule méthode `execute()`, dans `application/use-cases/`.
- Controller fin : il valide (DTO Zod), appelle un seul cas d'usage et sérialise. Aucune règle métier.
- Entités du domaine : constructeur privé, `create()` applique les règles, `restore()` relit la base sans les rejouer.
- Le domaine revalide ses règles : il ne fait pas confiance à la validation HTTP.
- Fonctions courtes ; un commentaire explique le pourquoi, pas le quoi.

## Bonnes pratiques

- Toute erreur métier est une `AppError` du domaine (ex. `DisciplineError`) avec un code stable et une catégorie (`VALIDATION`, `NOT_FOUND`, `CONFLICT`, `BUSINESS_RULE`) ; seul `ProblemDetailsFilter` la transforme en réponse HTTP (RFC 9457).
- Une entrée est validée par un schéma Zod de `packages/shared`, jamais à la main dans le controller ; un corps invalide donne un 400 `VALIDATION_FAILED`.
- Une contrainte d'unicité est vérifiée par le cas d'usage, et le repository traduit la violation en base en la même erreur de domaine.
- Aucun secret dans le code : les valeurs sensibles vont dans `apps/api/.env`.
- Tests : domaine en TypeScript pur, cas d'usage avec le repository en mémoire, repository Drizzle sur PGlite, e2e de l'API dans `apps/api/test/` (supertest).
- Front : la fausse API (`src/mocks/`, MSW) suit le même contrat que l'API, et chaque état d'écran a son audit `*.a11y.test.tsx`.
- Design : couleurs uniquement via les variables de `styles.css`, composants de `components/ui/` (shadcn), jamais de code couleur en dur.

## Nommage

- Fichiers en kebab-case, suffixés par leur rôle : `create-discipline.ts`, `drizzle-discipline.repository.ts`, `discipline.mapper.ts`, `disciplines.errors.ts`.
- Classes en PascalCase ; un cas d'usage = verbe + nom : `CreateDiscipline`, `ListDisciplines`.
- Port et implémentations : `DisciplineRepository`, `DrizzleDisciplineRepository`, `InMemoryDisciplineRepository`.
- Codes d'erreur en majuscules, préfixés par le domaine : `DISCIPLINE_NAME_TAKEN`, `DISCIPLINE_NOT_FOUND`.
- Schémas Zod en camelCase suffixés par `Schema` : `createDisciplineSchema`.
- Fichiers de test : `*.spec.ts` (unitaire), `*.int.spec.ts` (intégration), `*.e2e.spec.ts` (e2e de l'API), `*.test.tsx` (front).
- Titres de tests en anglais, préfixés par l'id du scénario de la spec : `it('000-AS4: rejects a name already taken')`.
- Commits Conventional Commits en anglais : `feat(api): add disciplines module`.
