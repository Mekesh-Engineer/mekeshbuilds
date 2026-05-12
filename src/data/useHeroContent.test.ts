import { describe, expect, it } from 'vitest';
import { HERO_DATA } from '@/data/useHeroContent';

describe('HERO_DATA', () => {
  it('uses hi as the greeting badge text', () => {
    expect(HERO_DATA.greetingBadgeText).toBe('hi');
  });
});
