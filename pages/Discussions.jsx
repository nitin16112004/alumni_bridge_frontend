import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { MessageSquare, ThumbsUp, Plus, X } from 'lucide-react';

export default function Discussions() {
  const { user } = useSelector((s) => s.auth);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  const loadDiscussions = () => {
    const params = user?.collegeId ? `?collegeId=${user.collegeId}` : '';
    api.get(`/discussions${params}`).then((r) => setDiscussions(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadDiscussions(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/discussions', { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
      setShowForm(false);
      setForm({ title: '', content: '', tags: '' });
      loadDiscussions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post discussion');
    } finally {
      setSubmitting(false);
    }
  };

  const upvote = async (id) => {
    try {
      await api.put(`/discussions/${id}/upvote`);
      loadDiscussions();
    } catch {
      // silently ignore upvote failures
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussions</h1>
          <p className="text-gray-500 text-sm">Community conversations from your college</p>
        </div>
        {user?.isApproved && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'New Post'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Discussion title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={4}
            placeholder="Share your thoughts..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (comma-separated): career, advice, tech"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No discussions yet</p>
          <p className="text-sm text-gray-400">Be the first to start a conversation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <div key={d._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group">
              <Link to={`/discussions/${d._id}`} className="block p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {d.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{d.content}</p>
                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {d.tags.map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{d.authorId?.name}</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {d.comments?.length || 0}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); upvote(d._id); }}
                  className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                >
                  <ThumbsUp size={18} />
                  <span className="text-xs font-medium">{d.upvotes?.length || 0}</span>
                </button>
              </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
