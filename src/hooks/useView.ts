import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { View } from '../types/stats';
import { parseView } from '../utils/view';

/** 보기는 URL ?view= 에만 둔다. 없거나 잘못된 값은 week 로 replace */
export function useView(): [View, (v: View) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get('view');
  const view = parseView(raw);

  useEffect(() => {
    if (raw !== view) {
      const next = new URLSearchParams(params);
      next.set('view', view);
      setParams(next, { replace: true });
    }
  }, [raw, view, params, setParams]);

  const setView = useCallback(
    (v: View) => {
      const next = new URLSearchParams(params);
      next.set('view', v);
      setParams(next);
    },
    [params, setParams],
  );

  return [view, setView];
}
