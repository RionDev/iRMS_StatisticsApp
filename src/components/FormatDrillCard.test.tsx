// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let lastClick: ((p: { name: string; dataIndex: number; data: unknown }) => void) | undefined;
vi.mock('./EChart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./EChart')>();
  return {
    ...actual,
    EChart: ({ onClick }: { onClick?: typeof lastClick }) => {
      if (onClick) lastClick = onClick;
      return <div data-testid="echart" />;
    },
  };
});
vi.mock('../services/statsService', () => ({
  getFormat: vi.fn(),
  getFormatCategory: vi.fn(),
  getFormatSpectype: vi.fn(),
  getTrend: vi.fn(),
}));

import * as svc from '../services/statsService';
import { FormatDrillCard } from './FormatDrillCard';

const dist = (items: { id: number; name: string; count: number }[]) => ({ view: 'week' as const, range: null, computed_at: null, items, others: 0 });

describe('FormatDrillCard', () => {
  beforeEach(() => {
    lastClick = undefined;
    vi.clearAllMocks();
    vi.mocked(svc.getFormat).mockResolvedValue(dist([{ id: 1, name: 'PE32', count: 9 }, { id: 7, name: 'ELF', count: 2 }]));
    vi.mocked(svc.getFormatCategory).mockResolvedValue(dist([{ id: 3, name: 'Packer', count: 4 }]));
    vi.mocked(svc.getFormatSpectype).mockResolvedValue(dist([{ id: 4, name: 'UPX', count: 4 }]));
    vi.mocked(svc.getTrend).mockResolvedValue({ kind: 'format', computed_date: '2026-09-27', window: null, rising: [], new: [] });
  });

  it('막대 클릭 → 그 포맷의 category·spectype 을 부르고 경로를 표시', async () => {
    render(<FormatDrillCard view="week" />);
    expect(await screen.findByText('포맷을 선택하면 세부 분포가 열립니다')).toBeInTheDocument();
    await waitFor(() => expect(lastClick).toBeDefined());
    lastClick!({ name: 'PE32', dataIndex: 1, data: { value: 9, id: 1 } });
    await waitFor(() => expect(svc.getFormatCategory).toHaveBeenCalledWith(1, 'week'));
    expect(svc.getFormatSpectype).toHaveBeenCalledWith(1, 'week', 10);
    expect(await screen.findByText('› PE32')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '전체 포맷' }));
    expect(await screen.findByText('포맷을 선택하면 세부 분포가 열립니다')).toBeInTheDocument();
  });

  it('급상승 모드: 선택 상자로 고르면 category·spectype 급상승', async () => {
    render(<FormatDrillCard view="rising" />);
    const select = await screen.findByRole('combobox', { name: '포맷' });
    await waitFor(() => expect(screen.getByRole('option', { name: 'ELF' })).toBeInTheDocument());
    fireEvent.change(select, { target: { value: '7' } });
    await waitFor(() => expect(svc.getTrend).toHaveBeenCalledWith('category', { format: 7, limit: 20 }));
    expect(svc.getTrend).toHaveBeenCalledWith('spectype', { format: 7, limit: 20 });
    expect(svc.getTrend).toHaveBeenCalledWith('format', { limit: 20 });
  });
});
