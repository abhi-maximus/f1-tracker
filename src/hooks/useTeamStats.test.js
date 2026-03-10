import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { classifyStatus, useTeamStats } from './useTeamStats';

// ── classifyStatus ────────────────────────────────────────────────────────────

describe('classifyStatus', () => {
  it.each([
    ['Finished',   'finished'],
    ['finished',   'finished'],
    ['+1 Lap',     'finished'],
    ['+3 Laps',    'finished'],
    ['Lapped',     'finished'],
  ])('"%s" → finished', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });

  it.each([
    ['Did not start', 'dns'],
    ['DNS',           'dns'],
    ['Did not qualify', 'dns'],
    ['DNQ',           'dns'],
  ])('"%s" → dns', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });

  it.each([
    ['Collision',         'crash'],
    ['Accident',          'crash'],
    ['Spun off',          'crash'],
    ['Contact with wall', 'crash'],
  ])('"%s" → crash', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });

  it.each([
    ['Engine',          'engine'],
    ['Power Unit',      'engine'],
    ['MGU-K',           'engine'],
    ['Electrical',      'engine'],
  ])('"%s" → engine', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });

  it.each([
    ['Retired',    'dnf'],
    ['Gearbox',    'dnf'],
    ['Hydraulics', 'dnf'],
    ['Brakes',     'dnf'],
    ['Overheating','dnf'],
  ])('"%s" → dnf', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });
});

// ── useTeamStats hook ─────────────────────────────────────────────────────────

vi.mock('../api/openf1', () => ({
  getSessions: vi.fn(),
  getPitStops: vi.fn(),
}));

vi.mock('../api/jolpica', () => ({
  getRaceSchedule: vi.fn(),
  getRaceResults: vi.fn(),
}));

import { getSessions, getPitStops } from '../api/openf1';
import { getRaceSchedule, getRaceResults } from '../api/jolpica';

const MOCK_TEAMS = [
  { id: 'ferrari',  name: 'Scuderia Ferrari', shortName: 'Ferrari',  driverNumbers: [16, 44], drivers: ['Charles Leclerc', 'Lewis Hamilton'], bgGradient: 'from-red-600 to-yellow-500', textColor: '#fff', constructorId: 'ferrari' },
  { id: 'mclaren',  name: 'McLaren F1 Team',  shortName: 'McLaren',  driverNumbers: [4, 81],  drivers: ['Lando Norris', 'Oscar Piastri'],    bgGradient: 'from-orange-500 to-sky-600',  textColor: '#fff', constructorId: 'mclaren' },
];

const MOCK_RACE = {
  round: '1', raceName: 'Australian Grand Prix', date: '2026-03-08',
  Circuit: { Location: { locality: 'Melbourne' } },
};

const MOCK_SESSION = { session_key: 11234, date_end: '2026-03-08T06:00:00Z' };

beforeEach(() => {
  vi.clearAllMocks();
  getSessions.mockResolvedValue([MOCK_SESSION]);
  getRaceSchedule.mockResolvedValue([MOCK_RACE]);
  getPitStops.mockResolvedValue([]);
  getRaceResults.mockResolvedValue([]);
});

afterEach(() => vi.clearAllMocks());

describe('useTeamStats', () => {
  it('starts with loading=true', () => {
    getRaceSchedule.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    expect(result.current.loading).toBe(true);
  });

  it('sets loading=false after fetch completes', async () => {
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('returns sessions from completed races', async () => {
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].raceName).toBe('Australian Grand Prix');
  });

  it('counts races per team from results', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Finished', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 58 },
      { constructorId: 'ferrari', status: 'Finished', givenName: 'Lewis',   familyName: 'Hamilton', permanentNumber: '44', lapsCompleted: 58 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.races).toBe(1);
  });

  it('counts DNFs correctly', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Retired', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 20 },
      { constructorId: 'ferrari', status: 'Finished', givenName: 'Lewis', familyName: 'Hamilton', permanentNumber: '44', lapsCompleted: 58 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.dnfs).toBe(1);
  });

  it('counts crashes separately from DNFs', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Collision', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 10 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.crashes).toBe(1);
    expect(result.current.stats.ferrari.dnfs).toBe(1);
  });

  it('counts engine failures separately', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Engine', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 30 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.engineFailures).toBe(1);
  });

  it('excludes DNS from race counts and DNFs', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'mclaren', status: 'Did not start', givenName: 'Oscar', familyName: 'Piastri', permanentNumber: '81', lapsCompleted: 0 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.mclaren.dnfs).toBe(0);
    expect(result.current.stats.mclaren.races).toBe(0);
  });

  it('ignores unknown constructorId in results', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'cadillac', status: 'Finished', givenName: 'X', familyName: 'Y', permanentNumber: '99', lapsCompleted: 58 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Should not throw; known teams unaffected
    expect(result.current.stats.ferrari.races).toBe(0);
  });

  it('calculates average pit time, filtering outliers >120s', async () => {
    getPitStops.mockResolvedValue([
      { driver_number: 16, pit_duration: 24.5 },
      { driver_number: 16, pit_duration: 25.5 },
      { driver_number: 16, pit_duration: 999 }, // outlier, should be excluded
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.avgPitTime).toBe('25.0');
  });

  it('calculates reliability score correctly', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Finished', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 58 },
      { constructorId: 'ferrari', status: 'Retired', givenName: 'Lewis', familyName: 'Hamilton', permanentNumber: '44', lapsCompleted: 30 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // 1 DNF out of 2 starts = 50%
    expect(result.current.stats.ferrari.reliabilityScore).toBe(50);
  });

  it('reliability is 100 when no races completed', async () => {
    getRaceSchedule.mockResolvedValue([]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.ferrari.reliabilityScore).toBe(100);
  });

  it('populates dnfHistory with incident timeline', async () => {
    getRaceResults.mockResolvedValue([
      { constructorId: 'ferrari', status: 'Engine', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16', lapsCompleted: 22 },
    ]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const history = result.current.stats.ferrari.dnfHistory;
    expect(history).toHaveLength(1);
    expect(history[0].raceName).toBe('Australian Grand Prix');
    expect(history[0].incidents[0].type).toBe('engine');
    expect(history[0].incidents[0].lapsCompleted).toBe(22);
  });

  it('sets error when getRaceSchedule throws', async () => {
    getRaceSchedule.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });

  it('safeGet returns [] when getSessions throws (catch branch)', async () => {
    getSessions.mockRejectedValue(new Error('sessions fail'));
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Should complete without error since safeGet swallows the exception
    expect(result.current.error).toBeNull();
  });

  it('safeGet returns [] when getRaceResults throws', async () => {
    getRaceResults.mockRejectedValue(new Error('results fail'));
    getRaceSchedule.mockResolvedValue([MOCK_RACE]);
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Should complete without crashing
    expect(result.current.stats.ferrari.dnfs).toBe(0);
  });

  it('does nothing when teams array is empty', () => {
    const { result } = renderHook(() => useTeamStats(2026, []));
    expect(result.current.loading).toBe(true); // never resolves, hook bails early
  });

  it('sets lastUpdated after successful fetch', async () => {
    const { result } = renderHook(() => useTeamStats(2026, MOCK_TEAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });
});
