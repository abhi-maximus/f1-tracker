import { describe, it, expect } from 'vitest';
import { TEAM_CONFIG, FALLBACK_CONFIG, getTeamTheme } from './teamConfig';

describe('TEAM_CONFIG', () => {
  const knownIds = [
    'red_bull', 'ferrari', 'mercedes', 'mclaren', 'aston_martin',
    'alpine', 'haas', 'alphatauri', 'rb', 'williams',
    'alfa', 'sauber', 'kick_sauber', 'audi', 'cadillac',
  ];

  it.each(knownIds)('"%s" has required fields', (id) => {
    const cfg = TEAM_CONFIG[id];
    expect(cfg).toBeDefined();
    expect(typeof cfg.shortName).toBe('string');
    expect(cfg.bgGradient).toMatch(/^from-/);
    expect(cfg.textColor).toMatch(/^#/);
  });
});

describe('getTeamTheme', () => {
  it('returns the correct config for a known constructorId', () => {
    const theme = getTeamTheme('ferrari');
    expect(theme.shortName).toBe('Ferrari');
    expect(theme.bgGradient).toContain('red');
  });

  it('returns FALLBACK_CONFIG for an unknown constructorId', () => {
    const theme = getTeamTheme('unknown_team_xyz');
    expect(theme).toEqual(FALLBACK_CONFIG);
    expect(theme.shortName).toBeNull();
  });

  it('FALLBACK_CONFIG has a valid bgGradient and textColor', () => {
    expect(FALLBACK_CONFIG.bgGradient).toMatch(/^from-/);
    expect(FALLBACK_CONFIG.textColor).toMatch(/^#/);
  });

  it('returns mclaren theme', () => {
    const theme = getTeamTheme('mclaren');
    expect(theme.shortName).toBe('McLaren');
  });

  it('returns alphatauri theme (legacy team)', () => {
    const theme = getTeamTheme('alphatauri');
    expect(theme.shortName).toBe('AlphaTauri');
  });

  it('returns cadillac theme (2026 expansion)', () => {
    const theme = getTeamTheme('cadillac');
    expect(theme.shortName).toBe('Cadillac');
  });
});
