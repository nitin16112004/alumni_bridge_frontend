import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleMore,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import { clearNotifications } from '../../store/slices/notificationSlice';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Logo from '../common/Logo';
import NotificationPanel from '../common/NotificationPanel';
import ConnectionStatus from '../common/ConnectionStatus';
import OfflineBanner from '../common/OfflineBanner';

const navigation = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/mentors', label: 'Find mentors', icon: UsersRound },
    { to: '/mentorship', label: 'Mentorship', icon: UserCheck },
    { to: '/chat', label: 'Messages', icon: MessageCircleMore },
    { to: '/discussions', label: 'Discussions', icon: MessagesSquare },
    { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/ai-assistant', label: 'AI career assistant', icon: Bot },
    { to: '/profile', label: 'Profile', icon: CircleUserRound },
  ],
  alumni: [
    { to: '/alumni/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/alumni/mentor', label: 'Mentor profile', icon: GraduationCap },
    { to: '/alumni/requests', label: 'Mentorship requests', icon: UserCheck },
    { to: '/chat', label: 'Messages', icon: MessageCircleMore },
    { to: '/discussions', label: 'Discussions', icon: MessagesSquare },
    { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/ai-assistant', label: 'AI career assistant', icon: Bot },
    { to: '/profile', label: 'Profile', icon: CircleUserRound },
  ],
  college: [
    { to: '/college/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/college/approvals', label: 'Pending approvals', icon: ShieldCheck },
    { to: '/events', label: 'Events', icon: CalendarDays },
  ],
};

function Navigation({ role, collapsed, onNavigate }) {
  return (
    <nav className="mt-6 flex flex-1 flex-col gap-1 px-3" aria-label="Primary navigation">
      {(navigation[role] || []).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900/20 ${isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ role, collapsed, setCollapsed }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-[#111b44] text-white transition-[width] duration-200 lg:flex ${collapsed ? 'w-[84px]' : 'w-[264px]'}`}>
      <div className={`flex h-20 items-center border-b border-white/10 px-5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Logo inverse compact={collapsed} />
      </div>
      <Navigation role={role} collapsed={collapsed} />
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900/20"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <><PanelLeftClose className="h-[18px] w-[18px]" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

export function MobileDrawer({ open, onClose, role, entity }) {
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.button type="button" aria-label="Close navigation" onClick={onClose} className="absolute inset-0 bg-slate-950/55" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            initial={reduceMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex h-full w-[min(86vw,320px)] flex-col bg-[#111b44] text-white shadow-2xl"
          >
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
              <Logo inverse />
              <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={entity?.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{entity?.name}</p>
                  <p className="truncate text-xs text-slate-400">{entity?.email}</p>
                </div>
              </div>
            </div>
            <Navigation role={role} onNavigate={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, currentEntity, entityType } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const unread = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    const close = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    const closeOnEscape = (event) => event.key === 'Escape' && setUserMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} role={role} entity={currentEntity} />

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[264px]'}`}>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden"><Logo compact /></div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Alumni Bridge workspace</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800">{currentEntity?.name}</p>
                <Badge tone={role === 'college' ? 'indigo' : role === 'alumni' ? 'purple' : 'blue'}>{role}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {entityType === 'user' && <div className="hidden sm:block"><ConnectionStatus /></div>}
            {entityType === 'user' && (
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  type="button"
                  aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <Bell className="h-[19px] w-[19px]" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} anchorRef={notificationButtonRef} />
              </div>
            )}

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 pr-2 text-left transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                <Avatar name={currentEntity?.name} src={currentEntity?.profilePhoto || currentEntity?.logo} size="sm" />
                <span className="hidden max-w-32 truncate text-sm font-bold text-slate-800 sm:block">{currentEntity?.name}</span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-slate-900">{currentEntity?.name}</p>
                    <p className="truncate text-xs text-slate-500">{currentEntity?.email}</p>
                  </div>
                  {entityType === 'user' && (
                    <button type="button" onClick={() => { setUserMenuOpen(false); navigate('/profile'); }} className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                      <CircleUserRound className="h-4 w-4" /> Profile
                    </button>
                  )}
                  <button type="button" onClick={handleLogout} className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <OfflineBanner />
        <main id="main-content" className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
