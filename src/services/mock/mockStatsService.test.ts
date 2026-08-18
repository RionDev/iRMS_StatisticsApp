import { describe, expect, it } from 'vitest';
import {
  getDailyStats,
  getLocalesStats,
  getStatsSummary,
  getTopDetections,
} from './mockStatsService';

describe('mockStatsService API contract', () => {
  it('Swagger와 동일한 summary/daily/locales 필드를 반환한다', async () => {
    const summary = await getStatsSummary();
    const daily = await getDailyStats(7);
    const locales = await getLocalesStats();

    expect(summary.total_samples).toBeGreaterThan(0);
    expect(daily.days).toBe(7);
    expect(daily.items).toHaveLength(7);
    expect(locales.items.length).toBeGreaterThan(0);
  });

  it('TOP 진단명 응답에 vendor_id와 diag_id를 포함한다', async () => {
    const top = await getTopDetections(1, 5);
    expect(top.vendor_id).toBe(1);
    expect(top.items).toHaveLength(5);
    expect(top.items[0].diag_id).toBeTypeOf('number');
  });
});
