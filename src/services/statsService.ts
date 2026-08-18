// 샘플 통계 API 레이어 — sample-service `/api/sample/stats/*` 조회.
// 계약 SoT: /api/sample/docs Swagger. UI 단독 개발 시 VITE_USE_MOCK=1 사용.

import apiClient from '@common/services/apiClient';
import type {
  DailyStats,
  DetectionRatioStats,
  LocalesStats,
  StatsSummary,
  TopDetectionsStats,
  TypesStats,
  VendorOption,
} from '../types/stats';
import * as mock from './mock/mockStatsService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === '1';

export async function getStatsSummary(): Promise<StatsSummary> {
  if (USE_MOCK) return mock.getStatsSummary();
  const res = await apiClient.get<StatsSummary>('/api/sample/stats/summary');
  return res.data;
}

export async function getDailyStats(days: number): Promise<DailyStats> {
  if (USE_MOCK) return mock.getDailyStats(days);
  const res = await apiClient.get<DailyStats>('/api/sample/stats/daily', { params: { days } });
  return res.data;
}

export async function getTypesStats(): Promise<TypesStats> {
  if (USE_MOCK) return mock.getTypesStats();
  const res = await apiClient.get<TypesStats>('/api/sample/stats/types');
  return res.data;
}

export async function getLocalesStats(): Promise<LocalesStats> {
  if (USE_MOCK) return mock.getLocalesStats();
  const res = await apiClient.get<LocalesStats>('/api/sample/stats/locales');
  return res.data;
}

export async function getDetectionRatioStats(): Promise<DetectionRatioStats> {
  if (USE_MOCK) return mock.getDetectionRatioStats();
  const res = await apiClient.get<DetectionRatioStats>('/api/sample/stats/detection-ratio');
  return res.data;
}

export async function getTopDetections(
  vendorId: number,
  limit = 20,
): Promise<TopDetectionsStats> {
  if (USE_MOCK) return mock.getTopDetections(vendorId, limit);
  const res = await apiClient.get<TopDetectionsStats>('/api/sample/stats/top-detections', {
    params: { vendor_id: vendorId, limit },
  });
  return res.data;
}

/** 벤더 셀렉트 옵션 — sample-service 필터 사전에서 vendors 만 사용 */
export async function getVendors(): Promise<VendorOption[]> {
  if (USE_MOCK) return mock.getVendors();
  const res = await apiClient.get<{ vendors: VendorOption[] }>('/api/sample/meta/filters');
  return res.data.vendors;
}
