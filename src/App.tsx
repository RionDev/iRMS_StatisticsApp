import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppCenterMessage } from '@common/components/AppCenterMessage';
import { LoginPage } from '@common/pages/LoginPage';
import { SignupPage } from '@common/pages/SignupPage';
import { useAuthStore } from '@common/stores/authStore';

const InflowPage = lazy(() => import('./pages/InflowPage').then((m) => ({ default: m.InflowPage })));
const TypePage = lazy(() => import('./pages/TypePage').then((m) => ({ default: m.TypePage })));
const DetectionPage = lazy(() => import('./pages/DetectionPage').then((m) => ({ default: m.DetectionPage })));

function RequireAuth({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    window.location.href = '/statistics/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
    return null;
  }
  return children;
}

function Guard({ children }: { children: React.ReactElement }) {
  return (
    <RequireAuth>
      <Suspense fallback={<AppCenterMessage>통계 화면을 불러오는 중...</AppCenterMessage>}>{children}</Suspense>
    </RequireAuth>
  );
}

/** / → /inflow (쿼리 유지) */
function ToInflow() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/inflow', search }} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage signupUrl="/statistics/signup" defaultRedirect="/statistics/" />} />
      <Route path="/signup" element={<SignupPage loginUrl="/statistics/login" />} />
      <Route path="/" element={<ToInflow />} />
      <Route path="/inflow" element={<Guard><InflowPage /></Guard>} />
      <Route path="/type" element={<Guard><TypePage /></Guard>} />
      <Route path="/detection" element={<Guard><DetectionPage /></Guard>} />
      <Route path="*" element={<Navigate to="/inflow" replace />} />
    </Routes>
  );
}
