/**
 * La page d'accueil, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : le
 * visiteur choisit son site d'épreuve et son temps libre, puis voit les lieux classés.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/utils';

async function choose(site: string, freeTime: string) {
  const user = userEvent.setup();
  await renderRoute({ initialEntries: ['/'] });
  await screen.findByText('Choisissez votre site d’épreuve.');
  // La liste des sites arrive de l'API : on attend l'option avant de la choisir.
  await screen.findByRole('option', { name: site });
  await user.selectOptions(screen.getByLabelText('Site d’épreuve'), site);
  await user.click(screen.getByRole('button', { name: freeTime }));
  const list = await screen.findByRole('list', { name: 'Lieux' });
  return within(list).getAllByRole('listitem');
}

describe('FreeTimePage', () => {
  it('001-AS1: shows the places around the chosen site, nearest first', async () => {
    const items = await choose('Diamniadio', '3 h');

    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual(['A', 'B', 'C']);
    expect(items[0]).toHaveTextContent('2 km');
    expect(items[0]).toHaveTextContent('6 min de trajet');
    expect(items[0]).toHaveTextContent('30 min de visite');
    expect(screen.queryByText('Pas le temps')).not.toBeInTheDocument();
  });

  it('001-AS2: marks a place that does not fit as "Pas le temps", at the bottom', async () => {
    const items = await choose('Diamniadio', '1 h');

    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual(['A', 'C', 'B']);
    expect(items[2]).toHaveTextContent('Pas le temps');
    expect(items[0]).not.toHaveTextContent('Pas le temps');
  });
});
