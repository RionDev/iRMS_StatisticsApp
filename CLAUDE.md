# iRMS Statistics App

통계 앱. 현재는 **샘플 통계 대시보드**(vt_metadata 이식 프로젝트의 StatsPage)를 제공한다.
데이터는 sample-service(BE)의 `/api/sample/stats/*` 를 조회한다.

## 책임

- `GET /api/sample/stats/summary` KPI (전체/24h/7d/평균 진단율/pool 비율)
- `GET /api/sample/stats/daily?days=` 일별 등록 추이
- `GET /api/sample/stats/types` 포맷/카테고리 분포
- `GET /api/sample/stats/locales` 로케일 분포
- `GET /api/sample/stats/detection-ratio` 진단율 히스토그램
- `GET /api/sample/stats/top-detections?vendor_id=&limit=` 벤더별 TOP 진단명
- `GET /api/sample/meta/filters` (vendors 셀렉트 옵션)

## 공통 규칙

- 레이어: `pages / components / services / types` — API 호출은 `services/`에서만
- `@common` alias 사용. 공통 모듈 규칙은 `common/CLAUDE.md`
- 인증: 공통 `LoginPage`/`useAuthStore`/`useAppAccess("/statistics")`

## 고유 규칙

- 독립 실행 시 Vite dev server 포트 3004, 게이트웨이 경로 `/statistics/`
- **차트는 ECharts** (`echarts/core` 모듈러 import — `components/EChart.tsx` 래퍼만 사용).
  FE 앱 중 유일하게 차트 라이브러리를 갖는 앱이다 (2026-08-19 협의로 채택)
- 다크모드: 차트 색상은 반드시 `useThemeStore().theme` 토큰 →
  `EChart.tsx` 의 `baseChartOption`/`axisStyle`/`chartPalette` 헬퍼 경유.
  option 은 `useMemo([data, theme])` 로 재생성해 테마 전환에 반응한다
- **주의**: `/stats/*` 응답 스키마는 BE 계획 문서에 미확정 — `types/stats.ts` 는
  가정 계약이다. BE 2단계 구현 시 Swagger(`/api/sample/docs`) 로 재검증할 것
- mock: UI 단독 개발 시에만 `.env`의 `VITE_USE_MOCK=1`로 `services/mock/` 사용

## BE API 대응

계약 SoT: `iRMS_BE/docs/plan/vt-sample-service.md` (구현 후 Swagger).
샘플 검색/상세 화면은 sample 앱(`/sample/`) 담당 — 이 앱은 통계 대시보드만 다룬다.
