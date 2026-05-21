import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, CheckSquare, CalendarDays, MessageSquare, ArrowRight, Clock } from 'lucide-react';

export default function CollegeDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    api.get('/colleges/pending').then((r) => setPending(r.data.length)).catch(() => {});
  }, []);

  const cards = [
    { to: '/college/approvals', icon: CheckSquare, label: 'User Approvals', desc: 'Review and approve student/alumni registrations', color: 'bg-blue-500', badge: pending },
    { to: '/events', icon: CalendarDays, label: 'Events', desc: 'Create and manage college events', color: 'bg-orange-500' },
    { to: '/discussions', icon: MessageSquare, label: 'Discussions', desc: 'Monitor community discussions', color: 'bg-teal-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">College Administration Dashboard</p>
        </div>
      </div>

      {pending > 0 && (
        <Link to="/college/approvals" className="block bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-3 text-amber-800">
            <Clock size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-medium">{pending} registration{pending !== 1 ? 's' : ''} awaiting approval</p>
              <p className="text-amber-700 text-sm mt-0.5">Review and approve pending student and alumni accounts.</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-amber-500" />
          </div>
        </Link>
      )}

      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-xl font-bold mb-1">Manage your alumni network</h2>
        <p className="text-blue-100 text-sm">Approve students and alumni, monitor discussions, and foster connections.</p>
        <Link to="/college/approvals" className="mt-4 inline-flex items-center gap-2 bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Review pending approvals <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map(({ to, icon: Icon, label, desc, color, badge }) => (
          <Link key={to} to={to} className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all relative overflow-hidden">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative`}>
              <Icon size={24} className="text-white" />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
            <ArrowRight size={16} className="absolute bottom-5 right-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Users size={16} className="text-blue-500" /> Quick Stats
        </h2>
        <p className="text-gray-500 text-sm">
          {pending > 0 ? (
            <span className="text-amber-600">{pending} pending verification{pending !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-green-600">All registrations reviewed ✓</span>
          )}
        </p>
      </div>
    </div>
  );
}
