import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getConstructorStandings, getDriverStandings, getFullSchedule,
  getRaceSchedule, getConstructors, getDriversByConstructor, getRaceResults,
  getQualifyingResults,
} from './jolpica';

function mockFetch(data) {
  return vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(data) });
}

function mockFetchFail(status = 404) {
  return vi.fn().mockResolvedValue({ ok: false, status, json: () => Promise.resolve({}) });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('getConstructorStandings', () => {
  it('returns parsed standings', async () => {
    global.fetch = mockFetch({
      MRData: { StandingsTable: { StandingsLists: [{ ConstructorStandings: [{ position: '1', points: '100', Constructor: { constructorId: 'ferrari' } }] }] } },
    });
    const result = await getConstructorStandings(2026);
    expect(result).toHaveLength(1);
    expect(result[0].Constructor.constructorId).toBe('ferrari');
  });

  it('returns [] when StandingsLists is empty', async () => {
    global.fetch = mockFetch({ MRData: { StandingsTable: { StandingsLists: [] } } });
    const result = await getConstructorStandings(2026);
    expect(result).toEqual([]);
  });

  it('throws on non-ok response', async () => {
    global.fetch = mockFetchFail(500);
    await expect(getConstructorStandings(2026)).rejects.toThrow('Standings API error: 500');
  });
});

describe('getDriverStandings', () => {
  it('returns driver standings array', async () => {
    global.fetch = mockFetch({
      MRData: { StandingsTable: { StandingsLists: [{ DriverStandings: [{ position: '1', points: '50', Driver: { driverId: 'leclerc' }, Constructors: [{ constructorId: 'ferrari' }] }] }] } },
    });
    const result = await getDriverStandings(2026);
    expect(result[0].Driver.driverId).toBe('leclerc');
  });

  it('returns [] on missing data', async () => {
    global.fetch = mockFetch({ MRData: {} });
    const result = await getDriverStandings(2026);
    expect(result).toEqual([]);
  });
});

describe('getFullSchedule', () => {
  it('returns [] when RaceTable.Races is missing', async () => {
    global.fetch = mockFetch({ MRData: {} });
    const result = await getFullSchedule(2026);
    expect(result).toEqual([]);
  });

  it('returns all races regardless of date', async () => {
    const races = [
      { round: '1', date: '2026-01-01', raceName: 'Race A' },
      { round: '2', date: '2099-12-31', raceName: 'Future Race' },
    ];
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: races } } });
    const result = await getFullSchedule(2026);
    expect(result).toHaveLength(2);
  });
});

describe('getRaceSchedule', () => {
  it('filters out future races', async () => {
    const races = [
      { round: '1', date: '2023-03-05', raceName: 'Past Race' },
      { round: '2', date: '2099-12-31', raceName: 'Future Race' },
    ];
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: races } } });
    const result = await getRaceSchedule(2026);
    expect(result).toHaveLength(1);
    expect(result[0].raceName).toBe('Past Race');
  });

  it('returns [] when no completed races', async () => {
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: [{ round: '1', date: '2099-01-01' }] } } });
    const result = await getRaceSchedule(2026);
    expect(result).toEqual([]);
  });

  it('excludes races with no date', async () => {
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: [{ round: '1' }] } } });
    const result = await getRaceSchedule(2026);
    expect(result).toEqual([]);
  });
});

describe('getConstructors', () => {
  it('returns constructors array', async () => {
    global.fetch = mockFetch({ MRData: { ConstructorTable: { Constructors: [{ constructorId: 'mclaren', name: 'McLaren' }] } } });
    const result = await getConstructors(2026);
    expect(result[0].constructorId).toBe('mclaren');
  });

  it('returns [] on missing data', async () => {
    global.fetch = mockFetch({ MRData: {} });
    const result = await getConstructors(2026);
    expect(result).toEqual([]);
  });
});

describe('getDriversByConstructor - empty data', () => {
  it('returns empty map when StandingsLists is missing', async () => {
    global.fetch = mockFetch({ MRData: {} });
    const result = await getDriversByConstructor(2026);
    expect(result).toEqual({});
  });
});

describe('getDriversByConstructor', () => {
  it('groups drivers by constructorId', async () => {
    global.fetch = mockFetch({
      MRData: {
        StandingsTable: {
          StandingsLists: [{
            DriverStandings: [
              { Driver: { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', permanentNumber: '4' }, Constructors: [{ constructorId: 'mclaren' }] },
              { Driver: { driverId: 'piastri', givenName: 'Oscar', familyName: 'Piastri', permanentNumber: '81' }, Constructors: [{ constructorId: 'mclaren' }] },
            ],
          }],
        },
      },
    });
    const result = await getDriversByConstructor(2026);
    expect(result.mclaren).toHaveLength(2);
    expect(result.mclaren[0].driverId).toBe('norris');
  });

  it('skips entries with no constructorId', async () => {
    global.fetch = mockFetch({
      MRData: { StandingsTable: { StandingsLists: [{ DriverStandings: [{ Driver: { driverId: 'x' }, Constructors: [] }] }] } },
    });
    const result = await getDriversByConstructor(2026);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('getDriversByConstructor', () => {
  it('uses empty string fallbacks when Driver fields are null', async () => {
    global.fetch = mockFetch({
      MRData: {
        StandingsTable: {
          StandingsLists: [{
            DriverStandings: [{
              Driver: { driverId: null, givenName: null, familyName: null, permanentNumber: null },
              Constructors: [{ constructorId: 'ferrari' }],
            }],
          }],
        },
      },
    });
    const result = await getDriversByConstructor(2026);
    expect(result.ferrari[0].driverId).toBe('');
    expect(result.ferrari[0].givenName).toBe('');
    expect(result.ferrari[0].familyName).toBe('');
    expect(result.ferrari[0].permanentNumber).toBe('');
  });
});

describe('getRaceResults', () => {
  it('maps result fields correctly', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            Results: [{
              Driver: { driverId: 'hamilton', permanentNumber: '44', givenName: 'Lewis', familyName: 'Hamilton' },
              Constructor: { constructorId: 'ferrari' },
              status: 'Finished',
              points: '25',
              position: '1',
              positionText: '1',
              laps: '58',
            }],
          }],
        },
      },
    });
    const result = await getRaceResults(2026, 1);
    expect(result[0]).toMatchObject({
      driverId: 'hamilton',
      permanentNumber: '44',
      familyName: 'Hamilton',
      givenName: 'Lewis',
      constructorId: 'ferrari',
      status: 'Finished',
      points: 25,
      position: 1,
      lapsCompleted: 58,
    });
  });

  it('returns [] when no race data', async () => {
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: [] } } });
    const result = await getRaceResults(2026, 99);
    expect(result).toEqual([]);
  });

  it('uses empty string fallbacks when result fields are null', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            Results: [{
              Driver: { driverId: null, permanentNumber: null, givenName: null, familyName: null },
              Constructor: { constructorId: null },
              status: null, points: null, position: '5', positionText: '5', laps: null,
            }],
          }],
        },
      },
    });
    const result = await getRaceResults(2026, 1);
    expect(result[0].driverId).toBe('');
    expect(result[0].constructorId).toBe('');
    expect(result[0].status).toBe('');
    expect(result[0].points).toBe(0);
    expect(result[0].lapsCompleted).toBe(0);
  });

  it('handles positionText R (retirement)', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            Results: [{
              Driver: { driverId: 'alonso', permanentNumber: '14', givenName: 'Fernando', familyName: 'Alonso' },
              Constructor: { constructorId: 'aston_martin' },
              status: 'Retired', points: '0', position: '18', positionText: 'R', laps: '43',
            }],
          }],
        },
      },
    });
    const result = await getRaceResults(2026, 1);
    expect(result[0].position).toBeNull();
    expect(result[0].lapsCompleted).toBe(43);
  });

  it('includes positionText and time in returned object', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            Results: [{
              Driver: { driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris' },
              Constructor: { constructorId: 'mclaren' },
              status: 'Finished', points: '25', position: '1', positionText: '1', laps: '57',
              Time: { time: '1:30:12.345' },
            }],
          }],
        },
      },
    });
    const result = await getRaceResults(2026, 1);
    expect(result[0].positionText).toBe('1');
    expect(result[0].time).toBe('1:30:12.345');
  });

  it('returns null time when Time field is absent', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            Results: [{
              Driver: { driverId: 'hamilton', permanentNumber: '44', givenName: 'Lewis', familyName: 'Hamilton' },
              Constructor: { constructorId: 'ferrari' },
              status: 'Finished', points: '18', position: '2', positionText: '2', laps: '57',
            }],
          }],
        },
      },
    });
    const result = await getRaceResults(2026, 1);
    expect(result[0].time).toBeNull();
  });
});

describe('getQualifyingResults', () => {
  it('maps qualifying result fields correctly', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            QualifyingResults: [{
              position: '1',
              number: '4',
              Driver: { driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris' },
              Constructor: { constructorId: 'mclaren' },
              Q1: '1:15.001', Q2: '1:14.502', Q3: '1:13.988',
            }],
          }],
        },
      },
    });
    const result = await getQualifyingResults(2026, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      position: 1,
      driverId: 'norris',
      permanentNumber: '4',
      givenName: 'Lando',
      familyName: 'Norris',
      constructorId: 'mclaren',
      q1: '1:15.001',
      q2: '1:14.502',
      q3: '1:13.988',
    });
  });

  it('returns [] when no qualifying data', async () => {
    global.fetch = mockFetch({ MRData: { RaceTable: { Races: [] } } });
    const result = await getQualifyingResults(2026, 99);
    expect(result).toEqual([]);
  });

  it('handles missing Q2 and Q3 (knocked out in Q1)', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            QualifyingResults: [{
              position: '20',
              number: '31',
              Driver: { driverId: 'ocon', permanentNumber: '31', givenName: 'Esteban', familyName: 'Ocon' },
              Constructor: { constructorId: 'haas' },
              Q1: '1:16.500',
            }],
          }],
        },
      },
    });
    const result = await getQualifyingResults(2026, 1);
    expect(result[0].q1).toBe('1:16.500');
    expect(result[0].q2).toBeNull();
    expect(result[0].q3).toBeNull();
  });

  it('uses empty string fallbacks when Driver/Constructor fields are null', async () => {
    global.fetch = mockFetch({
      MRData: {
        RaceTable: {
          Races: [{
            QualifyingResults: [{
              position: '1',
              Driver: { driverId: null, permanentNumber: null, givenName: null, familyName: null },
              Constructor: { constructorId: null },
            }],
          }],
        },
      },
    });
    const result = await getQualifyingResults(2026, 1);
    expect(result[0].driverId).toBe('');
    expect(result[0].constructorId).toBe('');
    expect(result[0].givenName).toBe('');
    expect(result[0].familyName).toBe('');
  });

  it('throws on non-ok response', async () => {
    global.fetch = mockFetchFail(500);
    await expect(getQualifyingResults(2026, 1)).rejects.toThrow('Standings API error: 500');
  });
});
