import { FREE_HOURS, type FreeHours } from '@joj/shared';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useSites, useSuggestions } from '../api/places.queries';
import { VisitList } from './visit-list';

export function FreeTimePage() {
  const [siteId, setSiteId] = useState('');
  const [freeHours, setFreeHours] = useState<FreeHours>(2);
  const sites = useSites();
  const suggestions = useSuggestions(siteId, freeHours);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Que faire avec mon temps libre ?</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="site">Site d’épreuve</Label>
        <NativeSelect id="site" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">—</option>
          {sites.data?.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div role="group" aria-label="Temps libre" className="flex gap-2">
        {FREE_HOURS.map((hours) => (
          <Button
            key={hours}
            variant={hours === freeHours ? 'default' : 'outline'}
            aria-pressed={hours === freeHours}
            onClick={() => setFreeHours(hours)}
          >
            {hours} h
          </Button>
        ))}
      </div>
      {siteId === '' && <p className="text-muted-foreground">Choisissez votre site d’épreuve.</p>}
      {suggestions.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les lieux.
        </p>
      )}
      {suggestions.isSuccess && <VisitList places={suggestions.data} />}
    </div>
  );
}
