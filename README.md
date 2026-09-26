# iRMS Statistics App

iRMS 통계 앱. 악성 샘플(photon-db) 통계 대시보드를 제공한다.

## 기능

3페이지 × 보기 6개(오늘 · 일간 · 주간 · 월간 · 전체 · 급상승) 구성이다.

- 유입: 일일 유입, source, locale
- 파일 타입: file_format 드릴다운, PE 세부, compiler·library, file_size
- 진단: 진단명, 벤더별 탐지율, detect_ratio 구간, label, tag

데이터 출처는 stats_service(`/api/stats/sample/*`). 차트는 ECharts, 라이트/다크 테마는 공통 theme 토큰과 연동된다.

dev DB 최근 날짜 데이터: `iRMS_DB/docker/README.md` "통계 개발 데이터" 참조.

## 기술 스택

React 18 + TypeScript, Vite, ECharts, Zustand/Axios (common 제공), Vitest + RTL

## 라우트

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/statistics/inflow` | InflowPage | 유입 통계 |
| `/statistics/type` | TypePage | 파일 타입 통계 |
| `/statistics/detection` | DetectionPage | 진단 통계 |

## 연동 BE API

Base `/api/stats/sample/*` (stats_service, 게이트웨이 경유). 계약 SoT:
`docs/superpowers/specs/2026-09-26-stats-service-api-design.md` → Swagger `/api/stats/docs`.

> UI 단독 개발 시에만 `.env`의 `VITE_USE_MOCK=1`로 mock 데이터를 사용한다.

## 개발

```bash
npm install
npm run dev
```

기본 포트: 3004, 경로: `/statistics/`

## 사전 준비

```bash
git submodule update --init --recursive
```
