import { useState, useEffect } from 'react';
import { getQualifyingResults, getRaceResults } from '../api/jolpica';

export function useRaceDetail(year, round) {
  const [qualifying, setQualifying] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year || !round) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getQualifyingResults(year, round).catch(() => []),
      getRaceResults(year, round).catch(() => []),
    ])
      .then(([q, r]) => {
        setQualifying(q);
        setResults(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, round]);

  return { qualifying, results, loading, error };
}
