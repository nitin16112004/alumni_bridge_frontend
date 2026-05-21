import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Building2, Clock, Send, MessageSquare, CheckCircle, RotateCcw } from 'lucide-react';

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const loads = [api.get(`/mentors/${id}`)];
    if (user?.role === 'student') loads.push(api.get('/mentorship/sent'));
    Promise.all(loads.map((p) => p.catch(() => null)))
      .then(([mentorRes, requestsRes]) => {
        if (mentorRes) setMentor(mentorRes.data);
        if (requestsRes) {
          const match = requestsRes.data.find(
            (r) => String(r.mentorId?._id) === id || String(r.mentorId) === id
          );
          setExistingRequest(match || null);
        }
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const sendRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/mentorship/request', { mentorId: id, message });
      setExistingRequest({ status: 'pending', message });
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const startChat = async () => {
    if (!mentor?.userId?._id) return;
    setStartingChat(true);
    try {
      await api.post('/chat/conversations', { participantId: mentor.userId._id });
      navigate('/chat');
    } catch {
      navigate('/chat');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  if (!mentor) return <div className="text-center py-16 text-gray-500">Mentor not found</div>;

  const renderRequestSection = () => {
    if (!user || user.role !== 'student' || !mentor.availability) return null;

    if (existingRequest?.status === 'accepted') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <h2 className="font-semibold text-gray-900">You're connected with {mentor.userId?.name}!</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">Your mentorship request was accepted. Start a conversation now.</p>
          <button
            onClick={startChat}
            disabled={startingChat}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <MessageSquare size={15} /> {startingChat ? 'Opening chat...' : 'Message Mentor'}
          </button>
        </div>
      );
    }

    if (existingRequest?.status === 'pending') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium">Request pending review</p>
            <p className="mt-1 text-amber-700">{mentor.userId?.name} hasn't responded yet. Check back later.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Request Mentorship</h2>
          {existingRequest?.status === 'rejected' && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <RotateCcw size={12} /> Previous request declined — send a new one
            </span>
          )}
        </div>
        <form onSubmit={sendRequest}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Introduce yourself and explain what you'd like guidance on..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-3xl shrink-0">
            {mentor.userId?.name?.[0] || 'M'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{mentor.userId?.name}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              <Building2 size={14} />
              <span>{mentor.role} at {mentor.company}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              <Clock size={14} />
              <span>{mentor.yearsOfExperience} years of experience</span>
            </div>
            {mentor.collegeId && (
              <p className="text-xs text-gray-400 mt-1">{mentor.collegeId.name}</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${mentor.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {mentor.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {mentor.bio && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{mentor.bio}</p>
          </div>
        )}

        {mentor.expertise?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-800 mb-2">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {mentor.userId?.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-800 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.userId.skills.map((s) => (
                <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {renderRequestSection()}
    </div>
  );
}
