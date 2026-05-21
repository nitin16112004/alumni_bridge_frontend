import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MessageSquare, RotateCcw } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(null);

  useEffect(() => {
    api.get('/mentorship/sent')
      .then((r) => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startChat = async (mentorUserId, requestId) => {
    setChatLoading(requestId);
    try {
      await api.post('/chat/conversations', { participantId: mentorUserId });
      navigate('/chat');
    } catch {
      navigate('/chat');
    } finally {
      setChatLoading(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Mentorship Requests</h1>
        <Link to="/mentors" className="text-sm text-blue-600 hover:underline">Browse mentors →</Link>
      </div>
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium">No requests yet</p>
          <Link to="/mentors" className="text-blue-600 hover:underline text-sm mt-2 block">Find a mentor →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {req.mentorId?.userId?.name || 'Mentor'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {req.mentorId?.role} @ {req.mentorId?.company}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${statusColors[req.status]}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>

              {req.message && (
                <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">{req.message}</p>
              )}

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  {req.status === 'accepted' && req.mentorId?.userId?._id && (
                    <button
                      onClick={() => startChat(req.mentorId.userId._id, req._id)}
                      disabled={chatLoading === req._id}
                      className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <MessageSquare size={13} />
                      {chatLoading === req._id ? 'Opening...' : 'Message Mentor'}
                    </button>
                  )}
                  {req.status === 'rejected' && (
                    <Link
                      to={`/mentors/${req.mentorId?._id}`}
                      className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RotateCcw size={13} /> Send Again
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
