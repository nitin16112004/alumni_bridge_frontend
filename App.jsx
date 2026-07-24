import { lazy, Suspense, useEffect, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { store } from './store';
import { logout, restoreSession } from './store/slices/authSlice';
import { SocketProvider } from './components/providers/SocketProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import RouteLoader from './components/common/RouteLoader';
import ToastContainer from './components/ToastContainer';
import NotFound from './pages/NotFound';
import { getHomeRoute } from './utils/routing';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MentorList = lazy(() => import('./pages/student/MentorList'));
const MentorProfile = lazy(() => import('./pages/student/MentorProfile'));
const MyRequests = lazy(() => import('./pages/student/MyRequests'));
const AiAssistant = lazy(() => import('./pages/student/AiAssistant'));
const AlumniDashboard = lazy(() => import('./pages/alumni/Dashboard'));
const ManageMentor = lazy(() => import('./pages/alumni/ManageMentor'));
const IncomingRequests = lazy(() => import('./pages/alumni/IncomingRequests'));
const CollegeDashboard = lazy(() => import('./pages/college/Dashboard'));
const ApprovalQueue = lazy(() => import('./pages/college/ApprovalQueue'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const Discussions = lazy(() => import('./pages/Discussions'));
const DiscussionDetail = lazy(() => import('./pages/DiscussionDetail'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Events = lazy(() => import('./pages/Events'));
const Profile = lazy(() => import('./pages/Profile'));

function SessionBootstrap({ children }) {
  const dispatch = useDispatch();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    const expire = () => dispatch(logout());
    window.addEventListener('alumni-bridge:session-expired', expire);
    return () => window.removeEventListener('alumni-bridge:session-expired', expire);
  }, [dispatch]);

  return children;
}

function HomeRedirect() {
  const { initialized, isAuthenticated, role } = useSelector((state) => state.auth);
  if (!initialized) return <RouteLoader label="Restoring your session" />;
  return <Navigate to={isAuthenticated ? getHomeRoute(role) : '/login'} replace />;
}

function PublicOnlyRoute({ children }) {
  const location = useLocation();
  const { initialized, isAuthenticated, role } = useSelector((state) => state.auth);
  if (!initialized) return <RouteLoader label="Restoring your session" />;
  if (isAuthenticated) {
    const requested = location.state?.from;
    return <Navigate to={requested || getHomeRoute(role)} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute allowedRoles={['student']}><MentorList /></ProtectedRoute>} />
          <Route path="/mentors/:id" element={<ProtectedRoute allowedRoles={['student']}><MentorProfile /></ProtectedRoute>} />
          <Route path="/mentorship" element={<ProtectedRoute allowedRoles={['student']}><MyRequests /></ProtectedRoute>} />

          <Route path="/alumni/dashboard" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniDashboard /></ProtectedRoute>} />
          <Route path="/alumni/mentor" element={<ProtectedRoute allowedRoles={['alumni']}><ManageMentor /></ProtectedRoute>} />
          <Route path="/alumni/requests" element={<ProtectedRoute allowedRoles={['alumni']}><IncomingRequests /></ProtectedRoute>} />

          <Route path="/college/dashboard" element={<ProtectedRoute allowedRoles={['college']}><CollegeDashboard /></ProtectedRoute>} />
          <Route path="/college/approvals" element={<ProtectedRoute allowedRoles={['college']}><ApprovalQueue /></ProtectedRoute>} />

          <Route path="/chat" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><ChatPage /></ProtectedRoute>} />
          <Route path="/discussions" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><Discussions /></ProtectedRoute>} />
          <Route path="/discussions/:id" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><DiscussionDetail /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><Jobs /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute allowedRoles={['student', 'alumni', 'college']}><Events /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><AiAssistant /></ProtectedRoute>} />
          <Route path="/ai" element={<Navigate to="/ai-assistant" replace />} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SessionBootstrap>
          <SocketProvider>
            <ToastContainer />
            <AppRoutes />
          </SocketProvider>
        </SessionBootstrap>
      </BrowserRouter>
    </Provider>
  );
}
