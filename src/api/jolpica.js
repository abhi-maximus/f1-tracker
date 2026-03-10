const BASE = '/jolpica/ergast/f1';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Standings API error: ${res.status}`);
  return res.json();
}

export async function getConstructorStandings(year = 2026) {
  const data = await fetchJson(`${BASE}/${year}/constructorStandings.json`);
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0];
  return list?.ConstructorStandings ?? [];
}

export async function getDriverStandings(year = 2026) {
  const data = await fetchJson(`${BASE}/${year}/driverStandings.json`);
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0];
  return list?.DriverStandings ?? [];
}

// Returns ALL races for the year (schedule)
export async function getFullSchedule(year) {
  const data = await fetchJson(`${BASE}/${year}.json`);
  return data?.MRData?.RaceTable?.Races ?? [];
}

// Returns only completed races for the year
export async function getRaceSchedule(year) {
  const races = await getFullSchedule(year);
  const now = new Date();
  return races.filter((r) => r.date && new Date(r.date) < now);
}

// Returns all constructors that competed in a given year
export async function getConstructors(year) {
  const data = await fetchJson(`${BASE}/${year}/constructors.json`);
  return data?.MRData?.ConstructorTable?.Constructors ?? [];
}

// Returns drivers grouped by constructorId for a given year.
// Uses driverStandings (has constructor info). Falls back to empty if no races yet.
export async function getDriversByConstructor(year) {
  const data = await fetchJson(`${BASE}/${year}/driverStandings.json`);
  const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  const map = {};
  standings.forEach((entry) => {
    const cid = entry.Constructors?.[0]?.constructorId;
    if (!cid) return;
    if (!map[cid]) map[cid] = [];
    map[cid].push({
      driverId: entry.Driver?.driverId ?? '',
      givenName: entry.Driver?.givenName ?? '',
      familyName: entry.Driver?.familyName ?? '',
      permanentNumber: entry.Driver?.permanentNumber ?? '',
    });
  });
  return map;
}

// Returns per-driver results for a specific round
// Each entry: { driverId, permanentNumber, familyName, givenName, constructorId, status, points, position, lapsCompleted }
export async function getRaceResults(year = 2026, round) {
  const data = await fetchJson(`${BASE}/${year}/${round}/results.json`);
  const race = data?.MRData?.RaceTable?.Races?.[0];
  const results = race?.Results ?? [];
  return results.map((r) => ({
    driverId: r.Driver?.driverId ?? '',
    permanentNumber: r.Driver?.permanentNumber ?? '',
    familyName: r.Driver?.familyName ?? '',
    givenName: r.Driver?.givenName ?? '',
    constructorId: r.Constructor?.constructorId ?? '',
    status: r.status ?? '',
    points: Number(r.points ?? 0),
    position: r.positionText === 'R' ? null : Number(r.position),
    lapsCompleted: Number(r.laps ?? 0),
  }));
}
