import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Polling generik. fetchFn dipanggil sekali langsung, lalu tiap `intervalMs`.
 * Interval nge-pause pas tab nggak aktif (visibilitychange) biar gak boros request.
 */
export function usePolling(fetchFn, intervalMs = 4000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const savedFetch = useRef(fetchFn);
  savedFetch.current = fetchFn;

  const run = useCallback(async () => {
    try {
      const result = await savedFetch.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    let timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        run();
      }
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return { data, error, loading, refetch: run };
}
