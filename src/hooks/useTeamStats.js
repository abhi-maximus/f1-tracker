import { useState, useEffect } from 'react';
import { getSessions, getPitStops } from '../api/openf1';
import { getRaceSchedule, getRaceResults } from '../api/jolpica';

// No static map needed — team IDs ARE the Jolpica constructorIds.
// We just check the constructorId exists in aggregated (handles any unknown team).


export function classifyStatus(status) {
  const s = status.toLowerCase();
  if (s === 'finished') return 'finished';
  if (s.match(/^\+\d+ laps?$/)) return 'finished';
  if (s === 'did not start' || s === 'dns') return 'dns';
  if (s === 'did not qualify' || s === 'dnq') return 'dns';
  if (s === 'lapped') return 'finished';
  if (s.includes('collision') || s.includes('accident') || s.includes('spun off') || s.includes('contact')) return 'crash';
  if (s.includes('engine') || s.includes('power unit') || s.includes('mgu') || s.includes('electrical')) return 'engine';
  return 'dnf';
}

function initStats(teams) {
  return teams.reduce((acc, team) => {
    acc[team.id] = {
      teamId: team.id,
      races: 0,
      dnfs: 0,
      crashes: 0,
      engineFailures: 0,
      pitStops: [],
      avgPitTime: null,
      reliabilityScore: 100,
      dnfHistory: [],
    };
    return acc;
  }, {});
}

function buildDriverTeamMap(teams) {
  const map = {};
  teams.forEach((team) => {
    (team.driverNumbers ?? []).forEach((num) => {
      if (num) map[String(num)] = team.id;
    });
  });
  return map;
}

function calcReliability(dnfs, totalDriverStarts) {
  if (totalDriverStarts === 0) return 100;
  return Math.round(((totalDriverStarts - dnfs) / totalDriverStarts) * 100);
}

async function safeGet(fn, ...args) {
  try { return await fn(...args); }
  catch { return []; }
}

export function useTeamStats(year, teams) {
  const [stats, setStats] = useState({});
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!year || !teams || teams.length === 0) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [completedRaces, openf1Sessions] = await Promise.all([
          getRaceSchedule(year),
          safeGet(getSessions, year),
        ]);
        if (cancelled) return;

        const completedSessions = openf1Sessions.filter(
          (s) => s.date_end && new Date(s.date_end) < new Date()
        );

        if (!cancelled) setSessions(completedRaces);

        const driverTeamMap = buildDriverTeamMap(teams);
        const aggregated = initStats(teams);
        const driverStarts = Object.fromEntries(teams.map((t) => [t.id, 0]));

        // ── PHASE 1: DNFs + timeline from Jolpica ────────────────────────────
        for (const race of completedRaces) {
          if (cancelled) return;

          const results = await safeGet(getRaceResults, year, race.round);

          // Collect per-team incidents for this race
          const raceIncidentsByTeam = {};

          results.forEach((r) => {
            const teamId = r.constructorId;
            if (!teamId || !aggregated[teamId]) return;

            const type = classifyStatus(r.status);

            if (type !== 'dns') {
              driverStarts[teamId] = (driverStarts[teamId] ?? 0) + 1;
            }

            if (type === 'finished' || type === 'dns') return;

            aggregated[teamId].dnfs += 1;
            if (type === 'crash')  aggregated[teamId].crashes += 1;
            if (type === 'engine') aggregated[teamId].engineFailures += 1;

            if (!raceIncidentsByTeam[teamId]) raceIncidentsByTeam[teamId] = [];
            raceIncidentsByTeam[teamId].push({
              driverName: `${r.givenName} ${r.familyName}`,
              driverNumber: r.permanentNumber,
              status: r.status,
              lapsCompleted: r.lapsCompleted,
              type,
            });
          });

          // Count races per team
          const teamsInRace = new Set(
            results
              .filter((r) => classifyStatus(r.status) !== 'dns' && aggregated[r.constructorId])
              .map((r) => r.constructorId)
          );
          teamsInRace.forEach((id) => { aggregated[id].races += 1; });

          // Attach timeline entry for teams that had incidents
          Object.entries(raceIncidentsByTeam).forEach(([teamId, incidents]) => {
            aggregated[teamId].dnfHistory.push({
              round: Number(race.round),
              raceName: race.raceName,
              circuit: race.Circuit?.Location?.locality ?? race.Circuit?.circuitName ?? '',
              date: race.date,
              incidents,
            });
          });
        }

        // ── PHASE 2: Pit times from OpenF1 ───────────────────────────────────
        for (const session of completedSessions) {
          if (cancelled) return;
          const pits = await safeGet(getPitStops, session.session_key);
          pits.forEach((pit) => {
            const teamId = driverTeamMap[String(pit.driver_number)];
            if (teamId && pit.pit_duration && pit.pit_duration < 120) {
              aggregated[teamId].pitStops.push(pit.pit_duration);
            }
          });
        }

        // ── PHASE 3: Post-process ─────────────────────────────────────────────
        Object.keys(aggregated).forEach((id) => {
          const s = aggregated[id];
          if (s.pitStops.length > 0) {
            const avg = s.pitStops.reduce((a, b) => a + b, 0) / s.pitStops.length;
            s.avgPitTime = avg.toFixed(1);
          }
          s.reliabilityScore = calcReliability(s.dnfs, driverStarts[id] ?? 0);
        });

        if (!cancelled) {
          setStats(aggregated);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [year, teams]);

  return { stats, sessions, loading, error, lastUpdated };
}
