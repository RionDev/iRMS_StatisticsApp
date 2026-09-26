# iRMS Statistics App

통계 앱. **샘플 통계 대시보드**를 제공한다.
데이터는 stats_service(BE)의 `/api/stats/sample/*` 를 조회한다.

## 책임

샘플 통계 대시보드 3페이지(유입 · 파일 타입 · 진단)를 stats_service `/api/stats/sample/*` 로 렌더링한다.
엔드포인트 목록은 아래 계약 SoT 문서 참조.

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
- mock: UI 단독 개발 시에만 `.env`의 `VITE_USE_MOCK=1`로 `services/mock/` 사용
- 계약 SoT: `iRMS_FE/docs/superpowers/specs/2026-09-26-stats-service-api-design.md` (stats_service `/api/stats/sample/*`, Swagger `/api/stats/docs`).
  화면 설계: `iRMS_FE/docs/superpowers/specs/2026-09-27-statistics-app-redesign-design.md`
- 페이지 3개(`/inflow` · `/type` · `/detection`). 보기는 URL `?view=`(today|day|week|month|total|rising)만 쓴다 — store 금지. `useView()` 로 읽고 쓴다
- `rising` 은 FE 전용 보기다. API 에는 `toApiView()`(rising → week)로 보낸다. 급상승이 없는 카드는 주간 값 + "주간 기준" 배지
- TOP-N 수평 막대형 통계는 `RankCard` 로 만든다(목록/급상승 모드 내장). 카드 상태 표시는 `StatBody`
- 카드 데이터는 `useStat(fetcher, deps)` 로 부른다. 공통 apiClient 는 alert 를 띄우지 않는다 — 실패 UI 는 카드가 보여 준다
- 테스트: 순수 함수·서비스는 node, 컴포넌트는 파일 첫 줄 `// @vitest-environment jsdom` + `EChart` vi.mock

## 샘플 검색 연동

샘플 검색/상세 화면은 sample 앱(`/sample/`) 담당 — 이 앱은 통계 대시보드만 다룬다.
