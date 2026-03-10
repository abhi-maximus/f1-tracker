import { useState, useEffect } from 'react';
import { getFullSchedule } from '../api/jolpica';

export function useRaces(year) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRaces([]);
    getFullSchedule(year)
      .then(setRaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year]);

  return { races, loading, error };
}
