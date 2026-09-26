// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./EChart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./EChart')>();
  return { ...actual, EChart: () => <div data-testid="echart" /> };
});

import { RankCard } from './RankCard';

const list = (items: { id: number; name: string; count: number }[], others = 0) => ({
  view: 'week' as const,
  range: { from: '2026-09-20', to: '2026-09-26' },
  computed_at: null,
  items,
  others,
});

const trend = {
  kind: 'source' as const,
  computed_date: '2026-09-27',
  window: null,
  rising: [{ id: 1, name: 'VirusTotal', rank: 1, cur_count: 30, prev_count: 10, growth_pct: 200 }],
  new: [{ id: 2, name: '허니팟', rank: 1, cur_count: 15, prev_count: 0, growth_pct: null }],
};

describe('RankCard', () => {
  it('목록 모드: toApiView 로 부르고 기타를 표시', async () => {
    const fetchList = vi.fn().mockResolvedValue(list([{ id: 1, name: 'A', count: 3 }], 5));
    const fetchTrend = vi.fn();
    render(<RankCard title="source 별 유입" view="month" fetchList={fetchList} fetchTrend={fetchTrend} />);
    expect(await screen.findByTestId('echart')).toBeInTheDocument();
    expect(screen.getByText('기타 5건')).toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith('month');
    expect(fetchTrend).not.toHaveBeenCalled();
  });

  it('빈 목록 문구', async () => {
    render(<RankCard title="t" view="today" fetchList={vi.fn().mockResolvedValue(list([]))} fetchTrend={vi.fn()} />);
    expect(await screen.findByText('해당 기간 데이터가 없습니다')).toBeInTheDocument();
  });

  it('실패 → 다시 시도', async () => {
    const fetchList = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(list([{ id: 1, name: 'A', count: 1 }]));
    render(<RankCard title="t" view="week" fetchList={fetchList} fetchTrend={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }));
    expect(await screen.findByTestId('echart')).toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledTimes(2);
  });

  it('급상승 모드: 급상승 표와 신규 등장 탭', async () => {
    const fetchList = vi.fn();
    render(<RankCard title="t" view="rising" fetchList={fetchList} fetchTrend={vi.fn().mockResolvedValue(trend)} />);
    expect(await screen.findByText('VirusTotal')).toBeInTheDocument();
    expect(screen.getByText('+200%')).toBeInTheDocument();
    expect(screen.getByText('10 → 30')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /신규 등장/ }));
    expect(await screen.findByText('허니팟')).toBeInTheDocument();
    expect(screen.getByText('신규')).toBeInTheDocument();
    expect(fetchList).not.toHaveBeenCalled();
  });

  it('급상승 미집계 문구', async () => {
    const empty = { ...trend, computed_date: null, rising: [], new: [] };
    render(<RankCard title="t" view="rising" fetchList={vi.fn()} fetchTrend={vi.fn().mockResolvedValue(empty)} />);
    expect(await screen.findByText('급상승은 일일 집계 후 표시됩니다')).toBeInTheDocument();
  });

  it('보기 전환 시 다시 부른다', async () => {
    const fetchList = vi.fn().mockResolvedValue(list([{ id: 1, name: 'A', count: 1 }]));
    const { rerender } = render(<RankCard title="t" view="week" fetchList={fetchList} fetchTrend={vi.fn()} />);
    await screen.findByTestId('echart');
    rerender(<RankCard title="t" view="total" fetchList={fetchList} fetchTrend={vi.fn()} />);
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith('total'));
  });
});
