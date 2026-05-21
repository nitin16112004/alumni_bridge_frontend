import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, MessageSquare, Briefcase, CalendarDays, Bot, BookOpen, CheckCircle, Clock, ArrowRight, Star, TrendingUp } from 'lucide-react';

const quickCards = [
  { to: '/mentors', icon: Users, label: 'Find Mentors', desc: 'Discover alumni who can guide your career', color: 'from-blue-500 to-blue-600' },
  { to: '/chat', icon: MessageSquare, label: 'Messages', desc: 'Chat with your mentors and peers', color: 'from-purple-500 to-purple-600' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs & Internships', desc: 'Opportunities posted by alumni', color: 'from-green-500 to-green-600' },
  { to: '/events', icon: CalendarDays, label: 'Events', desc: 'Upcoming college and alumni events', color: 'from-orange-500 to-orange-600' },
  { to: '/ai', icon: Bot, label: 'AI Assistant', desc: 'Get personalized career guidance', color: 'from-pink-500 to-pink-600' },
  { to: '/discussions', icon: BookOpen, label: 'Discussions', desc: 'Join community conversations', color: 'from-teal-500 to-teal-600' },
];

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({ mentors: 0, requests: 0, jobs: 0, events: 0 });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const collegeParam = user?.collegeId ? `?collegeId=${user.collegeId}` : '';
    Promise.all([
      api.get(`/mentors${collegeParam}`).catch(() => ({ data: [] })),
      api.get('/mentorship/sent').catch(() => ({ data: [] })),
      api.get('/jobs').catch(() => ({ data: [] })),
      api.get(`/events${collegeParam}`).catch(() => ({ data: [] })),
    ]).then(([mentors, requests, jobs, events]) => {
      setStats({
        mentors: mentors.data.length,
        requests: requests.data.length,
        jobs: jobs.data.length,
        events: events.data.length,
      });
      setRecentRequests(requests.data.slice(0, 3));
    });
  }, [user]);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                <CheckCircle size={16} /> Account verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                <Clock size={16} /> Pending college approval
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

      {!user?.isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-amber-800 text-sm flex items-start gap-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Account pending approval</p>
            <p className="text-amber-700 mt-0.5">Your college admin will review your registration. Some features are limited until approved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Mentors', value: stats.mentors, icon: Star, color: 'text-blue-600 bg-blue-50' },
          { label: 'My Requests', value: stats.requests, icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
          { label: 'Job Listings', value: stats.jobs, icon: Briefcase, color: 'text-green-600 bg-green-50' },
          { label: 'Upcoming Events', value: stats.events, icon: CalendarDays, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {quickCards.map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all relative overflow-hidden"
          >
            <div className={`w-12 h-12 bg-linear-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={22} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
            <ArrowRight size={16} className="absolute bottom-5 right-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Recent Requests
            </h2>
            <Link to="/mentorship" className="text-blue-600 text-xs hover:underline">View all →</Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No requests yet</p>
              <Link to="/mentors" className="text-blue-600 text-sm hover:underline mt-1 block">Find a mentor →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{req.mentorId?.userId?.name || 'Mentor'}</p>
                    <p className="text-xs text-gray-400">{req.mentorId?.role} @ {req.mentorId?.company}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <Bot size={28} className="mb-3 text-blue-200" />
          <h2 className="font-bold text-lg mb-1">Try the AI Career Assistant</h2>
          <p className="text-blue-100 text-sm mb-4">
            Get personalized career advice, skill roadmaps, and interview tips powered by AI.
          </p>
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Chat with AI <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
