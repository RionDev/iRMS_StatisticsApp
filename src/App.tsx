import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@common/pages/LoginPage';
import { SignupPage } from '@common/pages/SignupPage';
import { AppCenterMessage } from '@common/components/AppCenterMessage';
import { AppLayout } from '@common/components/AppLayout';
import { useAuthStore } from '@common/stores/authStore';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    window.location.href = '/statistics/login?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return children;
}

function PlaceholderPage() {
  return (
    <AppLayout appName="통계" sidebarItems={[]} version={__APP_VERSION__}>
      <AppCenterMessage>아직 서비스 하지 않습니다.</AppCenterMessage>
    </AppLayout>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage signupUrl="/statistics/signup" defaultRedirect="/statistics/" />} />
      <Route path="/signup" element={<SignupPage loginUrl="/statistics/login" />} />
      <Route path="/" element={<RequireAuth><PlaceholderPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
