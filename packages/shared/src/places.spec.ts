import { describe, expect, it } from 'vitest';
import { suggestPlacesQuerySchema } from './places.ts';

describe('suggestPlacesQuerySchema', () => {
  it.each(['4', '0', 'abc', ''])(
    '001-AS4: rejects a free time other than 1, 2 or 3 hours (%j)',
    (freeHours) => {
      const result = suggestPlacesQuerySchema.safeParse({ freeHours });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['freeHours']);
    },
  );

  it.each([
    ['1', 1],
    ['2', 2],
    ['3', 3],
  ])('001-AS4: accepts %j hours and reads it as a number', (freeHours, expected) => {
    expect(suggestPlacesQuerySchema.parse({ freeHours })).toEqual({ freeHours: expected });
  });
});
