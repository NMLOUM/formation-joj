/**
 * Un audit axe-core de chaque état de la page d'accueil : avant le choix du site, puis avec la
 * liste des lieux, dont un lieu marqué « Pas le temps ».
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('home page accessibility', () => {
  it('001-AS1: the page is clean before a site is chosen', async () => {
    await renderRoute({ initialEntries: ['/'] });
    await screen.findByText('Choisissez votre site d’épreuve.');
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('001-AS2: the page is clean with a place marked "Pas le temps"', async () => {
    const user = userEvent.setup();
    await renderRoute({ initialEntries: ['/'] });
    // La liste des sites arrive de l'API : on attend l'option avant de la choisir.
    await screen.findByRole('option', { name: 'Diamniadio' });
    await user.selectOptions(screen.getByLabelText('Site d’épreuve'), 'Diamniadio');
    await user.click(screen.getByRole('button', { name: '1 h' }));
    await screen.findByText('Pas le temps');
    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
