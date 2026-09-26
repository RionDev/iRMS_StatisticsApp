import type { ReactNode } from 'react';
import type { SidebarItem } from '@common/components/AppLayout';
import type { View } from './types/stats';

const icon = (children: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const inflowIcon = icon(<polyline points="3 17 9 11 13 15 21 7" />);
const typeIcon = icon(
  <>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="4" y1="10" x2="20" y2="10" />
  </>,
);
const detectionIcon = icon(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="16" y1="16" x2="21" y2="21" />
  </>,
);

/** 사이드바 — 현재 보기를 쿼리로 붙여 페이지를 옮겨도 기간이 유지된다 (NavLink 활성 판정은 경로만 본다) */
export function navItems(view: View): SidebarItem[] {
  const q = `?view=${view}`;
  return [
    { label: '유입', to: `/inflow${q}`, icon: inflowIcon },
    { label: '파일 타입', to: `/type${q}`, icon: typeIcon },
    { label: '진단', to: `/detection${q}`, icon: detectionIcon },
  ];
}
