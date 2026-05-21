import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, MessageSquare, Briefcase, CalendarDays, BookOpen, CheckCircle, Clock, ArrowRight, Bell, Users } from 'lucide-react';

export default function AlumniDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, jobs: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/mentorship/received').catch(() => ({ data: [] })),
      api.get('/jobs').catch(() => ({ data: [] })),
    ]).then(([requests, jobs]) => {
      setStats({
        pending: requests.data.filter((r) => r.status === 'pending').length,
        accepted: requests.data.filter((r) => r.status === 'accepted').length,
        jobs: jobs.data.filter((j) => j.postedBy?._id === user?._id || j.postedBy === user?._id).length,
      });
    });
  }, [user]);

  const cards = [
    { to: '/alumni/mentor', icon: UserCheck, label: 'Mentor Profile', desc: 'Manage your mentorship availability', color: 'from-blue-500 to-blue-600' },
    { to: '/alumni/requests', icon: MessageSquare, label: 'Mentorship Requests', desc: 'Review incoming student requests', color: 'from-purple-500 to-purple-600', badge: stats.pending },
    { to: '/jobs', icon: Briefcase, label: 'Post a Job', desc: 'Share opportunities with students', color: 'from-green-500 to-green-600' },
    { to: '/events', icon: CalendarDays, label: 'Create Event', desc: 'Organize alumni events', color: 'from-orange-500 to-orange-600' },
    { to: '/discussions', icon: BookOpen, label: 'Discussions', desc: 'Engage with the community', color: 'from-teal-500 to-teal-600' },
    { to: '/chat', icon: MessageSquare, label: 'Chat', desc: 'Connect with students and peers', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1">
            {user?.isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                <CheckCircle size={16} /> Verified Alumni
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                <Clock size={16} /> Awaiting college verification
              </span>
            )}
          </p>
        </div>
        <Link to="/profile" className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
            {user?.name?.[0]}
          </div>
          {user?.name}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: Bell, color: 'text-amber-600 bg-amber-50', to: '/alumni/requests' },
          { label: 'Active Mentees', value: stats.accepted, icon: Users, color: 'text-green-600 bg-green-50', to: '/alumni/requests' },
          { label: 'Jobs Posted', value: stats.jobs, icon: Briefcase, color: 'text-blue-600 bg-blue-50', to: '/jobs' },
        ].map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-xl font-bold mb-1">Give back to your alma mater</h2>
        <p className="text-blue-100 text-sm">Your experience can guide the next generation of students from your college.</p>
        <Link to="/alumni/mentor" className="mt-4 inline-flex items-center gap-2 bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Set up mentor profile <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ to, icon: Icon, label, desc, color, badge }) => (
          <Link key={to + label} to={to} className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all relative overflow-hidden">
            <div className={`w-12 h-12 bg-linear-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative`}>
              <Icon size={22} className="text-white" />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
            <ArrowRight size={16} className="absolute bottom-5 right-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
