import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, X, GraduationCap, Users } from 'lucide-react';

export default function ApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetch = () => {
    api.get('/colleges/pending').then((r) => setPending(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handle = async (userId, action) => {
    setProcessing(userId);
    try {
      await api.put(`/colleges/${action}/${userId}`);
      fetch();
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-500 text-sm">
          {pending.length} {pending.length === 1 ? 'person' : 'people'} awaiting verification
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">All caught up!</p>
          <p className="text-sm text-gray-400">No pending registrations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((u) => (
            <div key={u._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-lg shrink-0">
                {u.name?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{u.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'alumni' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'alumni' ? (
                      <span className="flex items-center gap-1"><GraduationCap size={10} /> Alumni</span>
                    ) : 'Student'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{u.email}</p>
                {u.graduationYear && (
                  <p className="text-xs text-gray-400 mt-0.5">Class of {u.graduationYear}</p>
                )}
                <p className="text-xs text-gray-400">Registered {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handle(u._id, 'reject')}
                  disabled={processing === u._id}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                  <X size={14} /> Reject
                </button>
                <button
                  onClick={() => handle(u._id, 'approve')}
                  disabled={processing === u._id}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                >
                  <Check size={14} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
