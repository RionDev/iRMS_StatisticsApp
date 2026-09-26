import type { ReactNode } from 'react';
import { Button } from '@common/components/Button';
import type { StatState } from '../hooks/useStat';
import { ChartState } from './ChartCard';

interface StatBodyProps<T> {
  state: StatState<T>;
  height: number;
  isEmpty?: (data: T) => boolean;
  emptyText?: string;
  children: (data: T) => ReactNode;
}

/** 카드 본문 상태 — 로딩 · 실패(다시 시도) · 빈 상태 · 정상. 높이를 유지한다 */
export function StatBody<T>({ state, height, isEmpty, emptyText = '해당 기간 데이터가 없습니다', children }: StatBodyProps<T>) {
  if (state.loading) return <ChartState height={height}>로딩 중...</ChartState>;
  if (state.failed || state.data === null) {
    return (
      <ChartState height={height}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          통계를 불러오지 못했습니다
          <Button variant="secondary" onClick={state.reload}>
            다시 시도
          </Button>
        </span>
      </ChartState>
    );
  }
  if (isEmpty?.(state.data)) return <ChartState height={height}>{emptyText}</ChartState>;
  return <>{children(state.data)}</>;
}
