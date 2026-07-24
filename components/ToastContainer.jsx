import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../store/slices/toastSlice';
import { MessageSquare, Bell, X, CheckCircle2, CircleAlert, BriefcaseBusiness, CalendarDays } from 'lucide-react';

const icons = {
  message: MessageSquare,
  mentorship: Bell,
  approval: Bell,
  event: CalendarDays,
  job: BriefcaseBusiness,
  success: CheckCircle2,
  error: CircleAlert,
  info: Bell,
};

const colors = {
  message: 'bg-blue-600',
  mentorship: 'bg-purple-600',
  approval: 'bg-green-600',
  event: 'bg-indigo-600',
  job: 'bg-violet-600',
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-gray-700',
};

function Toast({ toast }) {
  const dispatch = useDispatch();
  const Icon = icons[toast.type] || Bell;
  const bg = colors[toast.type] || colors.info;

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <div role="status" className={`flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl px-4 py-3 text-white shadow-xl ${bg} animate-slide-in`}>
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
        className="p-0.5 hover:bg-white/20 rounded transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { items } = useSelector((s) => s.toast);
  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex flex-col gap-2">
      {items.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
}
