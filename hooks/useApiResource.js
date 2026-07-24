import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../services/apiError';

export default function useApiResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestRef = useRef(0);
  const loaderRef = useRef(loader);
  const requestKey = JSON.stringify(dependencies);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const load = useCallback(async () => {
    // Reading the serialized key intentionally binds this loader to its caller's dependencies.
    void requestKey;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await loaderRef.current();
      if (requestId === requestRef.current) setData(result);
    } catch (requestError) {
      if (requestId === requestRef.current) {
        setError(getApiErrorMessage(requestError, 'This content could not be loaded.'));
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [requestKey]);

  useEffect(() => {
    load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  return { data, setData, loading, error, retry: load };
}
