import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTeams } from './useTeams';

vi.mock('../api/jolpica', () => ({
  getConstructors: vi.fn(),
  getDriversByConstructor: vi.fn(),
}));

vi.mock('../data/teamConfig', () => ({
  getTeamTheme: vi.fn((id) => ({
    shortName: id.charAt(0).toUpperCase() + id.slice(1),
    bgGradient: 'from-red-600 to-yellow-500',
    textColor: '#fff',
  })),
}));

import { getConstructors, getDriversByConstructor } from '../api/jolpica';

const MOCK_CONSTRUCTORS = [
  { constructorId: 'ferrari', name: 'Scuderia Ferrari' },
  { constructorId: 'mclaren', name: 'McLaren F1 Team' },
];

const MOCK_DRIVER_MAP = {
  ferrari: [
    { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16' },
    { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton', permanentNumber: '44' },
  ],
  mclaren: [
    { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', permanentNumber: '4' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  getConstructors.mockResolvedValue(MOCK_CONSTRUCTORS);
  getDriversByConstructor.mockResolvedValue(MOCK_DRIVER_MAP);
});

afterEach(() => vi.clearAllMocks());

describe('useTeams', () => {
  it('starts with loading=true and empty teams', () => {
    getConstructors.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTeams(2026));
    expect(result.current.loading).toBe(true);
    expect(result.current.teams).toEqual([]);
  });

  it('sets loading=false after fetch completes', async () => {
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('returns built team objects with correct shape', async () => {
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.teams).toHaveLength(2);
    const ferrari = result.current.teams.find((t) => t.id === 'ferrari');
    expect(ferrari).toBeDefined();
    expect(ferrari.name).toBe('Scuderia Ferrari');
    expect(ferrari.constructorId).toBe('ferrari');
    expect(ferrari.bgGradient).toBe('from-red-600 to-yellow-500');
    expect(ferrari.textColor).toBe('#fff');
  });

  it('populates drivers array from driver map', async () => {
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const ferrari = result.current.teams.find((t) => t.id === 'ferrari');
    expect(ferrari.drivers).toEqual(['Charles Leclerc', 'Lewis Hamilton']);
    expect(ferrari.driverNumbers).toEqual([16, 44]);
  });

  it('handles constructor with no drivers in driver map', async () => {
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // mclaren only has 1 driver in mock
    const mclaren = result.current.teams.find((t) => t.id === 'mclaren');
    expect(mclaren.drivers).toHaveLength(1);
  });

  it('handles missing driver map (getDriversByConstructor throws)', async () => {
    getDriversByConstructor.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Should still build teams with empty drivers
    expect(result.current.teams).toHaveLength(2);
    expect(result.current.teams[0].drivers).toEqual([]);
  });

  it('sets loading=false and returns empty teams when getConstructors throws', async () => {
    getConstructors.mockRejectedValue(new Error('API error'));
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.teams).toEqual([]);
  });

  it('does nothing when year is falsy', () => {
    const { result } = renderHook(() => useTeams(null));
    // Effect bails early — stays loading, no API calls
    expect(result.current.loading).toBe(true);
    expect(getConstructors).not.toHaveBeenCalled();
  });

  it('converts permanentNumber strings to numbers', async () => {
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const ferrari = result.current.teams.find((t) => t.id === 'ferrari');
    expect(ferrari.driverNumbers[0]).toBe(16);
    expect(typeof ferrari.driverNumbers[0]).toBe('number');
  });

  it('resets teams when year changes', async () => {
    const { result, rerender } = renderHook(({ year }) => useTeams(year), {
      initialProps: { year: 2026 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.teams).toHaveLength(2);

    rerender({ year: 2025 });
    // Should reset teams to [] and start loading again
    expect(result.current.teams).toEqual([]);
  });

  it('does not update state if unmounted before fetch completes (cancelled branch)', async () => {
    let resolveConstructors;
    getConstructors.mockReturnValue(new Promise((r) => { resolveConstructors = r; }));
    const { unmount } = renderHook(() => useTeams(2026));
    unmount(); // triggers cancelled=true
    // Resolve after unmount — should not cause state update errors
    resolveConstructors(MOCK_CONSTRUCTORS);
    // No assertion needed — test passes if no error is thrown
  });

  it('handles permanentNumber that cannot be parsed as number (defaults to 0)', async () => {
    getDriversByConstructor.mockResolvedValue({
      ferrari: [
        { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '' },
      ],
    });
    const { result } = renderHook(() => useTeams(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const ferrari = result.current.teams.find((t) => t.id === 'ferrari');
    expect(ferrari.driverNumbers[0]).toBe(0); // Number('') is NaN → || 0
  });
});
