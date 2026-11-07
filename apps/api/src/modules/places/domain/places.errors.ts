import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const PLACE_ERROR_KINDS = {
  /** Aucun site d'épreuve n'a cet identifiant. */
  SITE_NOT_FOUND: 'NOT_FOUND',
} as const satisfies Record<string, ErrorKind>;

export type PlaceErrorCode = keyof typeof PLACE_ERROR_KINDS;

export class PlaceError extends AppError<PlaceErrorCode> {
  constructor(code: PlaceErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, PLACE_ERROR_KINDS[code], message, details);
  }
}

export function siteNotFound(id: string): PlaceError {
  return new PlaceError('SITE_NOT_FOUND', `No site with id ${id}`, { id });
}
