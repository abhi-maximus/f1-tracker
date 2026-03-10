import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRaceDetail } from './useRaceDetail';

vi.mock('../api/jolpica', () => ({
  getQualifyingResults: vi.fn(),
  getRaceResults: vi.fn(),
}));

import { getQualifyingResults, getRaceResults } from '../api/jolpica';

const MOCK_QUALIFYING = [
  { position: 1, driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris', constructorId: 'mclaren', q1: '1:15.0', q2: '1:14.0', q3: '1:13.0' },
];

const MOCK_RESULTS = [
  { driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris', constructorId: 'mclaren', status: 'Finished', points: 25, position: 1, positionText: '1', lapsCompleted: 57, time: '1:30:00' },
];

afterEach(() => vi.clearAllMocks());

describe('useRaceDetail', () => {
  it('fetches qualifying and race results in parallel', async () => {
    getQualifyingResults.mockResolvedValue(MOCK_QUALIFYING);
    getRaceResults.mockResolvedValue(MOCK_RESULTS);
    const { result } = renderHook(() => useRaceDetail(2026, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qualifying).toEqual(MOCK_QUALIFYING);
    expect(result.current.results).toEqual(MOCK_RESULTS);
    expect(result.current.error).toBeNull();
  });

  it('starts with loading=true', () => {
    getQualifyingResults.mockReturnValue(new Promise(() => {}));
    getRaceResults.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useRaceDetail(2026, 1));
    expect(result.current.loading).toBe(true);
    expect(result.current.qualifying).toEqual([]);
    expect(result.current.results).toEqual([]);
  });

  it('returns empty qualifying when getQualifyingResults fails', async () => {
    getQualifyingResults.mockRejectedValue(new Error('No qualifying'));
    getRaceResults.mockResolvedValue(MOCK_RESULTS);
    const { result } = renderHook(() => useRaceDetail(2026, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qualifying).toEqual([]);
    expect(result.current.results).toEqual(MOCK_RESULTS);
  });

  it('returns empty results when getRaceResults fails', async () => {
    getQualifyingResults.mockResolvedValue(MOCK_QUALIFYING);
    getRaceResults.mockRejectedValue(new Error('No results'));
    const { result } = renderHook(() => useRaceDetail(2026, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qualifying).toEqual(MOCK_QUALIFYING);
    expect(result.current.results).toEqual([]);
  });

  it('does not fetch when year or round is missing', () => {
    renderHook(() => useRaceDetail(null, null));
    expect(getQualifyingResults).not.toHaveBeenCalled();
    expect(getRaceResults).not.toHaveBeenCalled();
  });

  it('refetches when round changes', async () => {
    getQualifyingResults.mockResolvedValue(MOCK_QUALIFYING);
    getRaceResults.mockResolvedValue(MOCK_RESULTS);
    const { rerender } = renderHook(({ round }) => useRaceDetail(2026, round), { initialProps: { round: 1 } });
    await waitFor(() => expect(getQualifyingResults).toHaveBeenCalledWith(2026, 1));
    rerender({ round: 2 });
    await waitFor(() => expect(getQualifyingResults).toHaveBeenCalledWith(2026, 2));
  });
});
