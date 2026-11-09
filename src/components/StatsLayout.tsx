import type { ReactNode } from 'react';
import { AppCenterMessage } from '@common/components/AppCenterMessage';
import { AppLayout } from '@common/components/AppLayout';
import { useAppAccess } from '@common/hooks/useAuth';
import { useFeatures } from '@common/hooks/useFeatures';
import { useView } from '../hooks/useView';
import { navItems } from '../navigation';
import type { View } from '../types/stats';
import { PageHeader } from './PageHeader';

interface StatsLayoutProps {
  title: string;
  children: (view: View) => ReactNode;
}

/** 통계 앱 기능 키 — BE stats_service src/features.py 와 같은 값 */
const STATS_APP = '/statistics';
const FEATURE_VIEW = 'view';

export function StatsLayout({ title, children }: StatsLayoutProps) {
  useAppAccess(STATS_APP);
  const { can, loaded } = useFeatures(STATS_APP);
  const [view, setView] = useView();
  return (
    <AppLayout
      title={title}
      appName="통계"
      sidebarItems={navItems(view)}
      version={__APP_VERSION__}
      contentMaxWidth="1700px"
    >
      {/* 기능 권한(admin 앱 → 앱 상세 → 기능 권한)을 확인한 뒤에만 통계 API 를 부른다 */}
      {!loaded ? (
        <AppCenterMessage>권한 확인 중...</AppCenterMessage>
      ) : !can(FEATURE_VIEW) ? (
        <AppCenterMessage>통계 조회 권한이 없습니다. 관리자에게 문의하세요.</AppCenterMessage>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PageHeader view={view} onViewChange={setView} />
          {children(view)}
        </div>
      )}
    </AppLayout>
  );
}
