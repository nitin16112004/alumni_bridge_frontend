import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications, markAllRead } from '../store/slices/notificationSlice';
import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hoverTimer = useRef(null);

  const unread = items.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const openNotifs = () => {
    clearTimeout(hoverTimer.current);
    setShowNotifs(true);
  };

  const closeNotifs = () => {
    hoverTimer.current = setTimeout(() => setShowNotifs(false), 200);
  };

  const role = user?.entityType === 'college' ? 'college' : user?.role;

  const navLinks = {
    student: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/mentors', label: 'Mentors' },
      { to: '/chat', label: 'Chat' },
      { to: '/discussions', label: 'Discussions' },
      { to: '/jobs', label: 'Jobs' },
      { to: '/events', label: 'Events' },
      { to: '/ai', label: 'AI Assistant' },
    ],
    alumni: [
      { to: '/alumni/dashboard', label: 'Dashboard' },
      { to: '/alumni/mentor', label: 'Mentor Profile' },
      { to: '/alumni/requests', label: 'Requests' },
      { to: '/chat', label: 'Chat' },
      { to: '/discussions', label: 'Discussions' },
      { to: '/jobs', label: 'Jobs' },
      { to: '/events', label: 'Events' },
    ],
    college: [
      { to: '/college/dashboard', label: 'Dashboard' },
      { to: '/college/approvals', label: 'Approvals' },
    ],
  };

  const links = navLinks[role] || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AB</span>
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">Alumni Bridge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div
              className="relative"
              onMouseEnter={openNotifs}
              onMouseLeave={closeNotifs}
            >
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <div className="p-3 border-b flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    {unread > 0 && (
                      <button
                        onClick={() => dispatch(markAllRead())}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {items.length === 0 ? (
                      <p className="text-sm text-gray-400 p-4 text-center">No notifications yet</p>
                    ) : (
                      items.slice(0, 10).map((n, i) => (
                        <div
                          key={i}
                          className={`px-4 py-3 border-b last:border-0 text-sm ${!n.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <p className="text-gray-800">{n.message}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user && (
            <Link to="/profile" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
              <User size={20} />
            </Link>
          )}

          {user && (
            <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-md">
              <LogOut size={20} />
            </button>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-gray-700 hover:text-blue-600"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
