import { useCallback, useEffect, useState } from 'react';

export interface StatState<T> {
  data: T | null;
  loading: boolean;
  failed: boolean;
  reload: () => void;
}

/** 카드 데이터 호출 — deps 가 바뀌면 다시 부르고, 늦게 온 이전 응답은 버린다 */
export function useStat<T>(fetcher: () => Promise<T>, deps: unknown[]): StatState<T> {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<Omit<StatState<T>, 'reload'>>({ data: null, loading: true, failed: false });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, failed: false });
    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, failed: false });
      })
      .catch(() => {
        if (active) setState({ data: null, loading: false, failed: true });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
