import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRaces } from './useRaces';

vi.mock('../api/jolpica', () => ({
  getFullSchedule: vi.fn(),
}));

import { getFullSchedule } from '../api/jolpica';

const MOCK_RACES = [
  { round: '1', raceName: 'Australian Grand Prix', date: '2026-03-15', Circuit: { circuitName: 'Albert Park', Location: { country: 'Australia' } } },
  { round: '2', raceName: 'Bahrain Grand Prix', date: '2026-03-29', Circuit: { circuitName: 'Bahrain International Circuit', Location: { country: 'Bahrain' } } },
];

afterEach(() => vi.clearAllMocks());

describe('useRaces', () => {
  it('returns races from getFullSchedule', async () => {
    getFullSchedule.mockResolvedValue(MOCK_RACES);
    const { result } = renderHook(() => useRaces(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.races).toEqual(MOCK_RACES);
    expect(result.current.error).toBeNull();
  });

  it('starts with loading=true and empty races', () => {
    getFullSchedule.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useRaces(2026));
    expect(result.current.loading).toBe(true);
    expect(result.current.races).toEqual([]);
  });

  it('sets error on API failure', async () => {
    getFullSchedule.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useRaces(2026));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.races).toEqual([]);
  });

  it('resets races and refetches when year changes', async () => {
    getFullSchedule.mockResolvedValue(MOCK_RACES);
    const { result, rerender } = renderHook(({ year }) => useRaces(year), { initialProps: { year: 2026 } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.races).toHaveLength(2);

    getFullSchedule.mockResolvedValue([MOCK_RACES[0]]);
    rerender({ year: 2025 });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.races).toHaveLength(1);
  });

  it('calls getFullSchedule with the provided year', async () => {
    getFullSchedule.mockResolvedValue([]);
    renderHook(() => useRaces(2024));
    await waitFor(() => expect(getFullSchedule).toHaveBeenCalledWith(2024));
  });
});
