import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStandings } from './useStandings';

vi.mock('../api/jolpica', () => ({
  getConstructorStandings: vi.fn(),
  getDriverStandings: vi.fn(),
}));

import { getConstructorStandings, getDriverStandings } from '../api/jolpica';

const MOCK_CONSTRUCTORS = [
  { Constructor: { constructorId: 'ferrari' }, points: '100', position: '1', wins: '3' },
  { Constructor: { constructorId: 'mclaren' }, points: '85',  position: '2', wins: '1' },
];

const MOCK_DRIVERS = [
  {
    Driver: { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16' },
    Constructors: [{ constructorId: 'ferrari' }],
    points: '60', position: '1', wins: '2',
  },
  {
    Driver: { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton', permanentNumber: '44' },
    Constructors: [{ constructorId: 'ferrari' }],
    points: '40', position: '3', wins: '1',
  },
  {
    Driver: { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', permanentNumber: '4' },
    Constructors: [{ constructorId: 'mclaren' }],
    points: '85', position: '2', wins: '1',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  getConstructorStandings.mockResolvedValue(MOCK_CONSTRUCTORS);
  getDriverStandings.mockResolvedValue(MOCK_DRIVERS);
});

afterEach(() => vi.clearAllMocks());

describe('useStandings', () => {
  it('starts with loading=true', () => {
    getConstructorStandings.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useStandings(2026));
    expect(result.current.loading).toBe(true);
  });

  it('sets loading=false after fetch completes', async () => {
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('parses constructor standings correctly', async () => {
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.constructorPoints.ferrari).toMatchObject({
      points: 100, position: 1, wins: 3,
    });
    expect(result.current.constructorPoints.mclaren).toMatchObject({
      points: 85, position: 2, wins: 1,
    });
  });

  it('parses driver standings correctly', async () => {
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.driverPoints.leclerc).toMatchObject({
      points: 60, position: 1, wins: 2,
      familyName: 'Leclerc', givenName: 'Charles',
      permanentNumber: '16', teamId: 'ferrari',
    });
  });

  it('getTeamDriverStandings returns drivers sorted by position', async () => {
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const ferrariDrivers = result.current.getTeamDriverStandings('ferrari');
    expect(ferrariDrivers).toHaveLength(2);
    expect(ferrariDrivers[0].position).toBe(1);
    expect(ferrariDrivers[1].position).toBe(3);
  });

  it('getTeamDriverStandings returns [] for unknown team', async () => {
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.getTeamDriverStandings('haas')).toEqual([]);
  });

  it('does nothing when year is falsy', () => {
    const { result } = renderHook(() => useStandings(null));
    expect(result.current.loading).toBe(true);
    expect(getConstructorStandings).not.toHaveBeenCalled();
  });

  it('fails silently when both APIs throw', async () => {
    getConstructorStandings.mockRejectedValue(new Error('err'));
    getDriverStandings.mockRejectedValue(new Error('err'));
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.constructorPoints).toEqual({});
    expect(result.current.driverPoints).toEqual({});
  });

  it('handles entries missing Constructor', async () => {
    getConstructorStandings.mockResolvedValue([
      { Constructor: null, points: '0', position: '1', wins: '0' },
    ]);
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // No entry added because Constructor is null
    expect(Object.keys(result.current.constructorPoints)).toHaveLength(0);
  });

  it('handles driver entries missing driverId', async () => {
    getDriverStandings.mockResolvedValue([
      { Driver: { driverId: null }, Constructors: [{ constructorId: 'ferrari' }], points: '0', position: '1', wins: '0' },
    ]);
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(Object.keys(result.current.driverPoints)).toHaveLength(0);
  });

  it('getConstructorStandings failing individually still resolves', async () => {
    getConstructorStandings.mockRejectedValue(new Error('constructor fail'));
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // constructorPoints empty, driverPoints populated
    expect(result.current.constructorPoints).toEqual({});
    expect(result.current.driverPoints.leclerc).toBeDefined();
  });

  it('getDriverStandings failing still populates constructorPoints', async () => {
    getDriverStandings.mockRejectedValue(new Error('driver fail'));
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.constructorPoints.ferrari).toBeDefined();
    expect(result.current.driverPoints).toEqual({});
  });

  it('defaults missing wins/position values', async () => {
    getConstructorStandings.mockResolvedValue([
      { Constructor: { constructorId: 'ferrari' }, points: '50' },
    ]);
    getDriverStandings.mockResolvedValue([
      {
        Driver: { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', permanentNumber: '16' },
        Constructors: [{ constructorId: 'ferrari' }],
        points: '50',
      },
    ]);
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.constructorPoints.ferrari.position).toBe(99);
    expect(result.current.constructorPoints.ferrari.wins).toBe(0);
    expect(result.current.driverPoints.leclerc.position).toBe(99);
    expect(result.current.driverPoints.leclerc.wins).toBe(0);
  });

  it('uses empty string fallbacks for null Driver name fields', async () => {
    getDriverStandings.mockResolvedValue([
      {
        Driver: { driverId: 'test_driver', givenName: null, familyName: null, permanentNumber: null },
        Constructors: [{ constructorId: 'ferrari' }],
        points: '10', position: '5', wins: '0',
      },
    ]);
    const { result } = renderHook(() => useStandings(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.driverPoints.test_driver.familyName).toBe('');
    expect(result.current.driverPoints.test_driver.givenName).toBe('');
    expect(result.current.driverPoints.test_driver.permanentNumber).toBe('');
  });

  it('does not update state if unmounted before fetch completes (cancelled branch)', async () => {
    let resolve;
    getConstructorStandings.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = renderHook(() => useStandings(2026));
    unmount();
    resolve([]);
    // No errors expected
  });
});
