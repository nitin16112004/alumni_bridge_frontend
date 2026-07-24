import { ArrowLeft, LayoutDashboard, MapPinned } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { getHomeRoute } from '../utils/routing';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-12">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
          <MapPinned className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">404 · Page not found</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">This bridge doesn’t lead anywhere yet.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">The page may have moved, or the address may be incomplete. You can return to a familiar part of Alumni Bridge.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Button onClick={() => navigate(isAuthenticated ? getHomeRoute(role) : '/login')}>
            <LayoutDashboard className="h-4 w-4" /> {isAuthenticated ? 'Go to dashboard' : 'Go to sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
}
