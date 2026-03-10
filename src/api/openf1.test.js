import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSessions, getDrivers, getLaps,
  getPitStops, getRaceControl, getStints, getPosition,
} from './openf1';

function mockFetch(data, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => { vi.stubGlobal('fetch', mockFetch([])); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('openf1 API', () => {
  it('getSessions builds correct URL with year + session_type', async () => {
    global.fetch = mockFetch([{ session_key: 1 }]);
    const result = await getSessions(2025);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/sessions?year=2025&session_type=Race');
    expect(result).toEqual([{ session_key: 1 }]);
  });

  it('getSessions defaults to 2026', async () => {
    global.fetch = mockFetch([]);
    await getSessions();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('year=2026'));
  });

  it('getDrivers builds correct URL', async () => {
    global.fetch = mockFetch([{ driver_number: 1 }]);
    await getDrivers(9999);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/drivers?session_key=9999');
  });

  it('getLaps builds correct URL with driver_number', async () => {
    global.fetch = mockFetch([]);
    await getLaps(9999, 44);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/laps?session_key=9999&driver_number=44');
  });

  it('getPitStops builds correct URL', async () => {
    global.fetch = mockFetch([{ pit_duration: 2.4 }]);
    const result = await getPitStops(9999);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/pit?session_key=9999');
    expect(result[0].pit_duration).toBe(2.4);
  });

  it('getRaceControl builds correct URL', async () => {
    global.fetch = mockFetch([{ message: 'RETIRED' }]);
    const result = await getRaceControl(9999);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/race_control?session_key=9999');
    expect(result[0].message).toBe('RETIRED');
  });

  it('getStints builds correct URL', async () => {
    global.fetch = mockFetch([]);
    await getStints(9999);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/stints?session_key=9999');
  });

  it('getPosition builds correct URL', async () => {
    global.fetch = mockFetch([]);
    await getPosition(9999);
    expect(fetch).toHaveBeenCalledWith('/openf1/v1/position?session_key=9999');
  });

  it('throws on non-ok response', async () => {
    global.fetch = mockFetch({}, false);
    await expect(getSessions(2026)).rejects.toThrow('OpenF1 API error: 500');
  });

  it('returns empty array when API returns []', async () => {
    global.fetch = mockFetch([]);
    const result = await getSessions(2026);
    expect(result).toEqual([]);
  });
});
