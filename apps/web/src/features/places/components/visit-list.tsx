import type { VisitSuggestionResponse } from '@joj/shared';

export function VisitList({ places }: { places: VisitSuggestionResponse[] }) {
  return (
    <ul aria-label="Lieux" className="flex flex-col gap-2">
      {places.map((place) => (
        <li
          key={place.id}
          aria-label={place.name}
          className={`rounded-md border p-3 ${place.fits ? '' : 'opacity-70'}`}
        >
          <p className="font-medium">{place.name}</p>
          <p className="text-sm text-muted-foreground">
            {place.distanceKm} km · {place.travelMinutes} min de trajet · {place.visitMinutes} min
            de visite
          </p>
          {!place.fits && <p className="text-sm font-medium text-destructive">Pas le temps</p>}
        </li>
      ))}
    </ul>
  );
}
