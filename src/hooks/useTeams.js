import { useState, useEffect } from 'react';
import { getConstructors, getDriversByConstructor } from '../api/jolpica';
import { getTeamTheme } from '../data/teamConfig';

export function useTeams(year) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!year) return;
    let cancelled = false;
    setLoading(true);
    setTeams([]);

    async function load() {
      try {
        const [constructors, driverMap] = await Promise.all([
          getConstructors(year),
          getDriversByConstructor(year).catch(() => ({})),
        ]);
        if (cancelled) return;

        const built = constructors.map((c) => {
          const cid = c.constructorId;
          const theme = getTeamTheme(cid);
          const apiDrivers = driverMap[cid] ?? [];

          return {
            id: cid,
            name: c.name,
            shortName: theme.shortName ?? c.name,
            bgGradient: theme.bgGradient,
            textColor: theme.textColor,
            drivers: apiDrivers.map((d) => `${d.givenName} ${d.familyName}`),
            driverNumbers: apiDrivers.map((d) => Number(d.permanentNumber) || 0),
            constructorId: cid,
          };
        });

        if (!cancelled) {
          setTeams(built);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [year]);

  return { teams, loading };
}
