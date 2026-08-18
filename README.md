# iRMS Statistics App

iRMS 통계 앱. 악성 샘플(photon-db) 통계 대시보드를 제공한다.

## 기능

- KPI 카드: 전체 샘플 수, 최근 24시간/7일 등록 수, 평균 진단율, Black 풀 비율
- 일별 등록 추이 (7일/30일/90일/1년)
- 파일 포맷/카테고리 분포, 로케일 분포(TOP 10), 진단율 히스토그램
- 벤더별 TOP 진단명 (벤더 셀렉트)

차트는 ECharts, 라이트/다크 테마는 공통 theme 토큰과 연동된다.

## 기술 스택

React 18 + TypeScript, Vite, ECharts, Zustand/Axios (common 제공), Vitest + RTL

## 라우트

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/statistics/` | SampleStatsPage | 샘플 통계 대시보드 |

## 연동 BE API

Base `/api/sample/stats/*` (sample-service, 게이트웨이 경유). 계약 SoT:
`iRMS_BE/docs/plan/vt-sample-service.md` → 구현 후 `/api/sample/docs` Swagger.

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
