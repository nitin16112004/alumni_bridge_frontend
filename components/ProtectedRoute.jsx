import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RouteLoader from './common/RouteLoader';
import { getHomeRoute } from '../utils/routing';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { initialized, isAuthenticated, role } = useSelector((state) => state.auth);

  if (!initialized) return <RouteLoader label="Restoring your session" />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return children;
}
