import { describe, expect, it } from 'vitest';
import * as mock from './mockStatsService';

describe('mockStatsService — stats_service 응답 모양', () => {
  it('summary / meta', async () => {
    const s = await mock.getSummary('week');
    expect(s.view).toBe('week');
    expect(s.range).not.toBeNull();
    expect(s.registered).toBeGreaterThan(0);
    expect(s.black_ratio).toBeGreaterThan(0);
    expect((await mock.getSummary('total')).range).toBeNull();
    const m = await mock.getMeta();
    expect(m.hourly_last_ok).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });
  it('inflow 계열', async () => {
    expect((await mock.getInflow('week')).items).toHaveLength(7);
    expect((await mock.getInflow('total')).items[0].date).toMatch(/^\d{4}-\d{2}$/);
    expect((await mock.getInflowToday()).items).toHaveLength(24);
    const h = await mock.getInflowHeatmap('week');
    expect(h.cells).toHaveLength(7);
    expect(h.cells[0]).toHaveLength(24);
  });
  it('분포는 limit 이하 + others', async () => {
    const src = await mock.getSource('week', 3);
    expect(src.items.length).toBeLessThanOrEqual(3);
    expect(src.others).toBeGreaterThanOrEqual(0);
    const loc = await mock.getLocale('week', 5);
    expect(loc.items[0].full_name).toBeTypeOf('string');
    expect((await mock.getSize('week')).items.map((i) => i.id)).toEqual([0, 1, 2, 3, 4]);
    expect((await mock.getDiag('week')).vendor).toBeNull();
    expect((await mock.getDiag('week', 2)).vendor?.id).toBe(2);
    const pe = await mock.getPe('week', 10);
    expect(pe.category.length).toBeGreaterThan(0);
  });
  it('벤더 · 진단율', async () => {
    expect((await mock.getVendorDetection('week')).items).toHaveLength(5);
    const r = await mock.getRatio('week');
    expect(r.buckets).toHaveLength(10);
    expect(r.buckets[0].range).toBe('0-10');
  });
  it('trend', async () => {
    const t = await mock.getTrend('diag', { vendor: 1, limit: 5 });
    expect(t.kind).toBe('diag');
    expect(t.window?.cur.from).toBeTypeOf('string');
    expect(t.rising.length).toBeLessThanOrEqual(5);
    expect(t.rising[0].rank).toBe(1);
    expect(t.new.every((i) => i.growth_pct === null && i.prev_count === 0)).toBe(true);
  });
});
