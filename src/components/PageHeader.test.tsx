// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/statsService', () => ({
  getSummary: vi.fn(),
  getMeta: vi.fn(),
  getTrend: vi.fn(),
}));

import * as svc from '../services/statsService';
import { PageHeader } from './PageHeader';

const summary = (view: string, registered: number) => ({
  view,
  range: view === 'total' ? null : { from: '2026-09-20', to: '2026-09-26' },
  computed_at: null,
  total_samples: registered,
  registered,
  black_ratio: 0.5,
  undetected: 1,
  all_detected: 2,
  none_detected: 3,
});

describe('PageHeader', () => {
  beforeEach(() => {
    vi.mocked(svc.getSummary).mockImplementation(async (v) => summary(v, v === 'total' ? 9999 : 120) as never);
    vi.mocked(svc.getMeta).mockResolvedValue({
      hourly_last_ok: '2026-09-27T10:05:00',
      daily_last_ok: null,
      last_failed: { job: 'daily', finished_at: '2026-09-27T05:20:00', message: 'x' },
      lookups_loaded_at: null,
    });
    vi.mocked(svc.getTrend).mockResolvedValue({
      kind: 'source',
      computed_date: '2026-09-27',
      window: { cur: { from: '2026-09-20', to: '2026-09-26' }, prev: { from: '2026-09-13', to: '2026-09-19' } },
      rising: [],
      new: [],
    });
  });

  it('주간: 기간 문구, 전체 샘플은 total 값, 집계 시각과 실패 문구', async () => {
    render(<PageHeader view="week" onViewChange={() => undefined} />);
    expect(await screen.findByText('2026-09-20 ~ 09-26')).toBeInTheDocument();
    expect(await screen.findByText('9,999')).toBeInTheDocument();
    expect(await screen.findByText('120')).toBeInTheDocument();
    expect(await screen.findByText('10:05 집계')).toBeInTheDocument();
    expect(await screen.findByText(/최근 집계 실패: daily/)).toBeInTheDocument();
    expect(svc.getTrend).not.toHaveBeenCalled();
  });

  it('급상승: week 로 KPI 를 부르고 창 문구를 보여 준다', async () => {
    render(<PageHeader view="rising" onViewChange={() => undefined} />);
    expect(await screen.findByText('이번 주 09-20~09-26 · 전주 09-13~09-19')).toBeInTheDocument();
    await waitFor(() => expect(svc.getSummary).toHaveBeenCalledWith('week'));
    expect(svc.getTrend).toHaveBeenCalledWith('source', { limit: 1 });
  });

  it('meta 실패 시 집계 줄만 숨긴다', async () => {
    vi.mocked(svc.getMeta).mockRejectedValue(new Error('x'));
    render(<PageHeader view="week" onViewChange={() => undefined} />);
    expect(await screen.findByText('120')).toBeInTheDocument();
    expect(screen.queryByText(/집계/)).toBeNull();
  });
});
