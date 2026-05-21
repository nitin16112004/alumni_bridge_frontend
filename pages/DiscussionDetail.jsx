import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ArrowLeft, Send, ThumbsUp } from 'lucide-react';

export default function DiscussionDetail() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [discussion, setDiscussion] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const loadDiscussion = () => api.get(`/discussions/${id}`).then((r) => setDiscussion(r.data)).catch(() => {});
  useEffect(() => { loadDiscussion(); }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setCommentError('');
    try {
      await api.post(`/discussions/${id}/comments`, { content: comment });
      setComment('');
      loadDiscussion();
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!discussion) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/discussions" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Discussions
      </Link>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{discussion.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>{discussion.authorId?.name}</span>
          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-700 leading-relaxed">{discussion.content}</p>
        {discussion.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {discussion.tags.map((t) => (
              <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-gray-500 text-sm">
          <ThumbsUp size={14} /> <span>{discussion.upvotes?.length || 0} upvotes</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Comments ({discussion.comments?.length || 0})</h2>
        <div className="space-y-4 mb-6">
          {discussion.comments?.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                {c.authorId?.name?.[0] || '?'}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-gray-800">{c.authorId?.name}</p>
                <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        {user?.isApproved && (
          <form onSubmit={addComment} className="space-y-2">
            <div className="flex gap-3">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" disabled={submitting || !comment.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
            {commentError && <p className="text-red-500 text-xs">{commentError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
