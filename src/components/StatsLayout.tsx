import type { ReactNode } from 'react';
import { AppLayout } from '@common/components/AppLayout';
import { useAppAccess } from '@common/hooks/useAuth';
import { useView } from '../hooks/useView';
import { navItems } from '../navigation';
import type { View } from '../types/stats';
import { PageHeader } from './PageHeader';

interface StatsLayoutProps {
  title: string;
  children: (view: View) => ReactNode;
}

export function StatsLayout({ title, children }: StatsLayoutProps) {
  useAppAccess('/statistics');
  const [view, setView] = useView();
  return (
    <AppLayout
      title={title}
      appName="통계"
      sidebarItems={navItems(view)}
      version={__APP_VERSION__}
      contentMaxWidth="1700px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PageHeader view={view} onViewChange={setView} />
        {children(view)}
      </div>
    </AppLayout>
  );
}
