import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  MessageCircle,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markAllRead,
  markNotificationRead,
} from '../../store/slices/notificationSlice';
import { isSafeInternalPath } from '../../utils/routing';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import Skeleton from '../ui/Skeleton';

const icons = {
  approval: UserCheck,
  mentorship: UsersRound,
  message: MessageCircle,
  job: BriefcaseBusiness,
  event: CalendarDays,
};

function relativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Just now';
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const [unit, divisor] = ranges.find(([, size]) => Math.abs(seconds) >= size) || ['second', 1];
  return formatter.format(Math.round(seconds / divisor), unit);
}

export default function NotificationPanel({ open, onClose, anchorRef }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const { items, loading, error } = useSelector((state) => state.notifications);
  const unread = items.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (open && items.length === 0 && !loading) dispatch(fetchNotifications());
  }, [dispatch, items.length, loading, open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target) && !anchorRef?.current?.contains(event.target)) {
        onClose();
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
        anchorRef?.current?.focus();
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [anchorRef, onClose, open]);

  const openNotification = (notification) => {
    if (notification._id && !notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    if (isSafeInternalPath(notification.link)) navigate(notification.link);
    else if (notification.conversationId) navigate('/chat');
    onClose();
  };

  if (!open) return null;

  return (
    <section
      ref={panelRef}
      aria-label="Notifications"
      className="fixed inset-x-3 top-[4.75rem] z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[390px]"
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-950">Notifications</h2>
          <p className="text-xs text-slate-500">{unread ? `${unread} unread` : 'You’re all caught up'}</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => dispatch(markAllRead())}>
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Mark all read
          </Button>
        )}
      </header>

      <div className="max-h-[min(68vh,520px)] overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}
          </div>
        ) : error && items.length === 0 ? (
          <ErrorState compact message={error} onRetry={() => dispatch(fetchNotifications())} />
        ) : items.length === 0 ? (
          <EmptyState compact icon={Bell} title="No notifications yet" description="Updates about mentorship, messages, jobs, and events will appear here." />
        ) : (
          items.map((notification) => {
            const Icon = icons[notification.type] || CircleAlert;
            const actionable = isSafeInternalPath(notification.link) || notification.conversationId;
            return (
              <button
                type="button"
                key={notification._id || notification.eventKey}
                onClick={() => openNotification(notification)}
                disabled={!actionable && !notification._id}
                className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 hover:bg-slate-50 disabled:cursor-default ${notification.isRead ? 'bg-white' : 'bg-blue-50/65'}`}
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-5 text-slate-700">{notification.message}</span>
                  <span className="mt-1 block text-xs text-slate-400">{relativeTime(notification.createdAt)}</span>
                </span>
                {!notification.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
