// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./EChart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./EChart')>();
  return { ...actual, EChart: () => <div data-testid="echart" /> };
});
vi.mock('../services/statsService', () => ({
  getInflow: vi.fn(),
  getInflowToday: vi.fn(),
  getInflowHeatmap: vi.fn(),
}));

import * as svc from '../services/statsService';
import { InflowCard } from './InflowCard';

const env = (view: string) => ({ view, range: null, computed_at: null });

describe('InflowCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(svc.getInflow).mockImplementation(async (v) => ({
      ...env(v),
      items: v === 'total'
        ? [{ date: '2026-07', count: 1, black: 1, gray: 0 }, { date: '2026-09', count: 2, black: 1, gray: 1 }]
        : [{ date: '2026-09-26', count: 3, black: 2, gray: 1 }],
    }) as never);
    vi.mocked(svc.getInflowToday).mockResolvedValue({ ...env('today'), items: [{ hour: 0, count: 1 }] } as never);
    vi.mocked(svc.getInflowHeatmap).mockResolvedValue({ ...env('week'), cells: [[1]] } as never);
  });

  it('today → 시간별만', async () => {
    render(<InflowCard view="today" />);
    await screen.findByTestId('echart');
    expect(svc.getInflowToday).toHaveBeenCalled();
    expect(svc.getInflow).not.toHaveBeenCalled();
  });

  it('week → 일별 + 히트맵', async () => {
    render(<InflowCard view="week" />);
    await waitFor(() => expect(screen.getAllByTestId('echart')).toHaveLength(2));
    expect(svc.getInflow).toHaveBeenCalledWith('week');
    expect(svc.getInflowHeatmap).toHaveBeenCalledWith('week');
  });

  it('rising → 주간 데이터 + 주간 기준 배지', async () => {
    render(<InflowCard view="rising" />);
    expect(await screen.findByText('주간 기준')).toBeInTheDocument();
    await waitFor(() => expect(svc.getInflow).toHaveBeenCalledWith('week'));
  });

  it('day → 어제 합계', async () => {
    render(<InflowCard view="day" />);
    expect(await screen.findByText('합계 3건')).toBeInTheDocument();
    expect(svc.getInflow).toHaveBeenCalledWith('day');
  });

  it('total → 월별', async () => {
    render(<InflowCard view="total" />);
    await screen.findByTestId('echart');
    expect(svc.getInflow).toHaveBeenCalledWith('total');
    expect(svc.getInflowHeatmap).not.toHaveBeenCalled();
  });

  it('today → 24 시간 모두 0건이면 빈 상태', async () => {
    vi.mocked(svc.getInflowToday).mockResolvedValue({
      ...env('today'),
      items: Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 })),
    } as never);
    render(<InflowCard view="today" />);
    expect(await screen.findByText('해당 기간 데이터가 없습니다')).toBeInTheDocument();
    expect(screen.queryByTestId('echart')).toBeNull();
  });

  it('week → 유입이 모두 0건이면 빈 상태, 히트맵도 렌더하지 않는다', async () => {
    vi.mocked(svc.getInflow).mockResolvedValue({
      ...env('week'),
      items: [{ date: '2026-09-26', count: 0, black: 0, gray: 0 }],
    } as never);
    render(<InflowCard view="week" />);
    expect(await screen.findByText('해당 기간 데이터가 없습니다')).toBeInTheDocument();
    expect(screen.queryByTestId('echart')).toBeNull();
  });
});
