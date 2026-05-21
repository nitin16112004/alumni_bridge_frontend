import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Check, X, MessageSquare } from 'lucide-react';

export default function IncomingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);
  const [error, setError] = useState('');

  const startChat = async (studentId, requestId) => {
    setChatLoading(requestId);
    try {
      await api.post('/chat/conversations', { participantId: studentId });
      navigate('/chat');
    } catch {
      navigate('/chat');
    } finally {
      setChatLoading(null);
    }
  };

  const loadRequests = () => {
    api.get('/mentorship/received').then((r) => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const respond = async (requestId, status) => {
    setResponding(requestId + status);
    setError('');
    try {
      await api.put(`/mentorship/respond/${requestId}`, { status });
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setResponding(null);
    }
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mentorship Requests</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No requests yet</p>
          <p className="text-sm text-gray-400">Students from your college will find you through your mentor profile</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                    {req.studentId?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.studentId?.name}</h3>
                    <p className="text-sm text-gray-500">{req.studentId?.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${statusColors[req.status]}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>

              {req.message && (
                <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">{req.message}</p>
              )}

              {req.studentId?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {req.studentId.skills.map((s) => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  {req.status === 'accepted' && req.studentId?._id && (
                    <button
                      onClick={() => startChat(req.studentId._id, req._id)}
                      disabled={chatLoading === req._id}
                      className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <MessageSquare size={13} />
                      {chatLoading === req._id ? 'Opening...' : 'Message Student'}
                    </button>
                  )}
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => respond(req._id, 'rejected')}
                        disabled={!!responding}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                      >
                        <X size={14} /> Decline
                      </button>
                      <button
                        onClick={() => respond(req._id, 'accepted')}
                        disabled={!!responding}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                      >
                        <Check size={14} /> {responding === req._id + 'accepted' ? 'Accepting...' : 'Accept'}
                      </button>
                    </>
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
