// 샘플 통계 DTO — 계약 SoT: iRMS_BE/docs/plan/vt-sample-service.md
// 실제 계약은 /api/sample/docs Swagger 기준으로 검증한다.

export interface StatsBucket {
  name: string;
  count: number;
}

/** GET /api/sample/stats/summary */
export interface StatsSummary {
  /** 전체 샘플 수 */
  total_samples: number;
  /** 최근 24시간 등록 수 */
  last_24h: number;
  /** 최근 7일 등록 수 */
  last_7d: number;
  /** 평균 진단율 (정수 %) */
  avg_detect_ratio: number;
  /** 풀 비율 (Black/Gray) */
  pools: StatsBucket[];
}

export interface DailyBucket {
  /** YYYY-MM-DD */
  date: string;
  count: number;
}

/** GET /api/sample/stats/daily?days=N */
export interface DailyStats {
  days: number;
  items: DailyBucket[];
}

/** GET /api/sample/stats/types — format/category 분포 */
export interface TypesStats {
  formats: StatsBucket[];
  categories: StatsBucket[];
}

/** GET /api/sample/stats/locales */
export interface LocalesStats {
  items: StatsBucket[];
}

export interface RatioBucket {
  /** "0-10" ... "90-100" (10구간) */
  range: string;
  count: number;
}

/** GET /api/sample/stats/detection-ratio */
export interface DetectionRatioStats {
  buckets: RatioBucket[];
}

/** GET /api/sample/stats/top-detections?vendor_id=&limit= */
export interface TopDetectionsStats {
  vendor_id: number | null;
  items: Array<StatsBucket & { diag_id: number }>;
}

/** GET /api/sample/meta/filters 중 vendors 항목 (셀렉트용) */
export interface VendorOption {
  id: number;
  name: string;
}
