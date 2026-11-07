// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { sql } from 'drizzle-orm';
import {
  check,
  doublePrecision,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const sites = pgTable(
  'sites',
  {
    // Mot court lisible dans l'adresse (`diamniadio`), plutôt qu'un uuid.
    id: varchar('id', { length: 50 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
  },
  // Deux sites de même nom seraient indiscernables dans la liste de choix.
  (table) => [uniqueIndex('sites_name_key').on(table.name)],
);

export const places = pgTable(
  'places',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    visitMinutes: integer('visit_minutes').notNull(),
  },
  // Une durée de visite nulle ou négative fausserait la règle du temps libre (001-AS2).
  (table) => [check('places_visit_minutes_check', sql`${table.visitMinutes} >= 1`)],
);

export type SiteRow = typeof sites.$inferSelect;
export type PlaceRow = typeof places.$inferSelect;
