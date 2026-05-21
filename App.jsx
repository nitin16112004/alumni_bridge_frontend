import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { useSelector } from 'react-redux';
import { useSocket } from './hooks/useSocket';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/Dashboard';
import MentorList from './pages/student/MentorList';
import MentorProfile from './pages/student/MentorProfile';
import MyRequests from './pages/student/MyRequests';
import AiAssistant from './pages/student/AiAssistant';
import AlumniDashboard from './pages/alumni/Dashboard';
import ManageMentor from './pages/alumni/ManageMentor';
import IncomingRequests from './pages/alumni/IncomingRequests';
import CollegeDashboard from './pages/college/Dashboard';
import ApprovalQueue from './pages/college/ApprovalQueue';
import ChatPage from './pages/ChatPage';
import Discussions from './pages/Discussions';
import DiscussionDetail from './pages/DiscussionDetail';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Profile from './pages/Profile';

function AppContent() {
  useSocket();
  const { user } = useSelector((s) => s.auth);
  const isCollege = user?.entityType === 'college';

  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/" element={
          user
            ? <Navigate to={isCollege ? '/college/dashboard' : user.role === 'alumni' ? '/alumni/dashboard' : '/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute allowedRoles={['student']}><MentorList /></ProtectedRoute>} />
        <Route path="/mentors/:id" element={<ProtectedRoute allowedRoles={['student']}><MentorProfile /></ProtectedRoute>} />
        <Route path="/mentorship" element={<ProtectedRoute allowedRoles={['student']}><MyRequests /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute allowedRoles={['student']}><AiAssistant /></ProtectedRoute>} />

        <Route path="/alumni/dashboard" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniDashboard /></ProtectedRoute>} />
        <Route path="/alumni/mentor" element={<ProtectedRoute allowedRoles={['alumni']}><ManageMentor /></ProtectedRoute>} />
        <Route path="/alumni/requests" element={<ProtectedRoute allowedRoles={['alumni']}><IncomingRequests /></ProtectedRoute>} />

        <Route path="/college/dashboard" element={<ProtectedRoute allowedRoles={['college']}><CollegeDashboard /></ProtectedRoute>} />
        <Route path="/college/approvals" element={<ProtectedRoute allowedRoles={['college']}><ApprovalQueue /></ProtectedRoute>} />

        <Route path="/chat" element={<ProtectedRoute allowedRoles={['student', 'alumni']}><ChatPage /></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
        <Route path="/discussions/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
