import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

import AppLayout          from '../components/common/AppLayout';
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import PlanSelectionPage  from '../pages/member/PlanSelectionPage';
import OnboardingPage     from '../pages/member/OnboardingPage';
import DashboardPage      from '../pages/member/DashboardPage';
import ActionCenterPage   from '../pages/member/ActionCenterPage';
import NotificationsPage  from '../pages/member/NotificationsPage';
import CheckInPage        from '../pages/member/CheckInPage';
import ProfilePage        from '../pages/member/ProfilePage';
import CoachDashboardPage  from '../pages/coach/CoachDashboardPage';
import MemberDetailPage    from '../pages/coach/MemberDetailPage';
import AdminDashboardPage  from '../pages/admin/AdminDashboardPage';
import PlanManagerPage     from '../pages/admin/PlanManagerPage';
import UserManagerPage     from '../pages/admin/UserManagerPage';
import AppointmentsPage    from '../pages/member/AppointmentsPage';

function RequireAuth({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={48} />
    </Box>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register"        element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />

      {/* Plan selection & onboarding — full screen, no sidebar */}
      <Route path="/plan-selection" element={<RequireAuth><PlanSelectionPage /></RequireAuth>} />
      <Route path="/onboarding"     element={<RequireAuth><OnboardingPage /></RequireAuth>} />

      {/* All authenticated pages with sidebar layout */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/actions"       element={<ActionCenterPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/checkin"       element={<CheckInPage />} />
        <Route path="/appointments"  element={<AppointmentsPage />} />
        <Route path="/profile"       element={<ProfilePage />} />

        <Route path="/coach"                   element={<RequireAuth roles={['coach','admin']}><CoachDashboardPage /></RequireAuth>} />
        <Route path="/coach/members/:memberId" element={<RequireAuth roles={['coach','admin']}><MemberDetailPage /></RequireAuth>} />

        <Route path="/admin"         element={<RequireAuth roles={['admin']}><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/plans"   element={<RequireAuth roles={['admin']}><PlanManagerPage /></RequireAuth>} />
        <Route path="/admin/users"   element={<RequireAuth roles={['admin']}><UserManagerPage /></RequireAuth>} />
      </Route>

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
