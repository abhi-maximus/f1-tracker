import { useState, useEffect } from 'react';
import { getConstructorStandings, getDriverStandings } from '../api/jolpica';

export function useStandings(year) {
  const [constructorPoints, setConstructorPoints] = useState({});
  const [driverPoints, setDriverPoints] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!year) return;
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const [constructors, drivers] = await Promise.all([
          getConstructorStandings(year).catch(() => []),
          getDriverStandings(year).catch(() => []),
        ]);
        if (cancelled) return;

        const cp = {};
        constructors.forEach((entry) => {
          const teamId = entry.Constructor?.constructorId;
          if (teamId) {
            cp[teamId] = {
              points: Number(entry.points ?? 0),
              position: Number(entry.position ?? 99),
              wins: Number(entry.wins ?? 0),
            };
          }
        });

        const dp = {};
        drivers.forEach((entry) => {
          const teamId = entry.Constructors?.[0]?.constructorId;
          const driverId = entry.Driver?.driverId;
          if (driverId) {
            dp[driverId] = {
              points: Number(entry.points ?? 0),
              position: Number(entry.position ?? 99),
              wins: Number(entry.wins ?? 0),
              familyName: entry.Driver?.familyName ?? '',
              givenName: entry.Driver?.givenName ?? '',
              permanentNumber: entry.Driver?.permanentNumber ?? '',
              teamId,
            };
          }
        });

        if (!cancelled) {
          setConstructorPoints(cp);
          setDriverPoints(dp);
        }
      } catch {
        // standings are supplemental — fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [year]);

  function getTeamDriverStandings(teamId) {
    return Object.values(driverPoints)
      .filter((d) => d.teamId === teamId)
      .sort((a, b) => a.position - b.position);
  }

  return { constructorPoints, driverPoints, getTeamDriverStandings, loading };
}
