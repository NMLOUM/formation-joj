import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineRepository } from './testing/in-memory-discipline.repository';
import { CreateDiscipline } from './use-cases/create-discipline';
import { ListSimilarDisciplines } from './use-cases/list-similar-disciplines';

function setup() {
  const disciplines = new InMemoryDisciplineRepository();
  return {
    createDiscipline: new CreateDiscipline(disciplines),
    listSimilarDisciplines: new ListSimilarDisciplines(disciplines),
  };
}

describe('ListSimilarDisciplines', () => {
  it('000-AS6: lists the other disciplines of the same category, sorted by name', async () => {
    const { createDiscipline, listSimilarDisciplines } = setup();
    const lutte = await createDiscipline.execute({ name: 'Lutte', category: 'sports-de-combat' });
    await createDiscipline.execute({ name: 'Taekwondo', category: 'sports-de-combat' });
    await createDiscipline.execute({ name: 'Judo', category: 'sports-de-combat' });
    await createDiscipline.execute({ name: 'Natation', category: 'sports-nautiques' });

    const names = (await listSimilarDisciplines.execute(lutte.id)).map((d) => d.name);

    expect(names).toEqual(['Judo', 'Taekwondo']);
  });

  it('000-AS6: returns an empty list when the discipline is alone in its category', async () => {
    const { createDiscipline, listSimilarDisciplines } = setup();
    const lutte = await createDiscipline.execute({ name: 'Lutte', category: 'sports-de-combat' });
    await createDiscipline.execute({ name: 'Natation', category: 'sports-nautiques' });

    expect(await listSimilarDisciplines.execute(lutte.id)).toEqual([]);
  });

  it('000-AS11: reports an unknown discipline as not found', async () => {
    const { listSimilarDisciplines } = setup();
    await expect(
      listSimilarDisciplines.execute('0199f5c2-0000-7000-8000-00000000ffff'),
    ).rejects.toMatchObject({ code: 'DISCIPLINE_NOT_FOUND', kind: 'NOT_FOUND' });
  });
});
