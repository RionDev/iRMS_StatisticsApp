import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppCenterMessage } from '@common/components/AppCenterMessage';
import { LoginPage } from '@common/pages/LoginPage';
import { SignupPage } from '@common/pages/SignupPage';
import { useAuthStore } from '@common/stores/authStore';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    window.location.href = '/statistics/login?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage signupUrl="/statistics/signup" defaultRedirect="/statistics/" />} />
      <Route path="/signup" element={<SignupPage loginUrl="/statistics/login" />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Suspense fallback={<AppCenterMessage>통계 화면을 불러오는 중...</AppCenterMessage>}>
              <AppCenterMessage>통계 화면 전환 중입니다.</AppCenterMessage>
            </Suspense>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
