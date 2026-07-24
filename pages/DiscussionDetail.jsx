import { ArrowLeft, MessageCircleMore, Send, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { addToast } from '../store/slices/toastSlice';
import useApiResource from '../hooks/useApiResource';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';

export default function DiscussionDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [actionError, setActionError] = useState('');
  const { data: discussion, setData: setDiscussion, loading, error, retry } = useApiResource(
    async () => (await api.get(`/discussions/${id}`)).data,
    [id],
  );

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setActionError('');
    try {
      const { data: created } = await api.post(`/discussions/${id}/comments`, { content: comment.trim() });
      setDiscussion((current) => ({ ...current, comments: [...(current.comments || []), created] }));
      setComment('');
      dispatch(addToast({ type: 'info', message: 'Comment posted.' }));
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The comment could not be posted.'));
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async () => {
    setVoting(true);
    setActionError('');
    try {
      const { data } = await api.put(`/discussions/${id}/upvote`);
      setDiscussion((current) => ({ ...current, upvoteCount: data.upvotes }));
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The vote could not be updated.'));
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="page-container max-w-4xl"><Skeleton className="h-5 w-36" /><Card className="mt-5 p-7"><Skeleton className="h-8 w-3/4" /><Skeleton className="mt-5 h-32" /></Card></div>;
  if (error || !discussion) return <div className="page-container max-w-4xl"><Card><ErrorState title="Discussion unavailable" message={error || 'This discussion could not be found.'} onRetry={retry} /></Card></div>;

  return (
    <div className="page-container max-w-4xl">
      <Link to="/discussions" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Back to discussions</Link>
      <Card className="mt-5 p-5 sm:p-8">
        <div className="flex items-start gap-3">
          <Avatar name={discussion.authorId?.name} src={discussion.authorId?.profilePhoto} size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-800">{discussion.authorId?.name || 'Community member'}</p>{discussion.authorId?.role && <Badge tone={discussion.authorId.role === 'alumni' ? 'purple' : 'blue'}>{discussion.authorId.role}</Badge>}</div>
            <p className="mt-1 text-xs text-slate-400">{new Date(discussion.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{discussion.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{discussion.content}</p>
        {discussion.tags?.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{discussion.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>}
        <div className="mt-6 border-t border-slate-100 pt-4"><Button variant="ghost" onClick={vote} loading={voting}><ThumbsUp className="h-4 w-4" /> {discussion.upvoteCount ?? discussion.upvotes?.length ?? 0} upvotes</Button></div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-extrabold text-slate-950">Comments ({discussion.comments?.length || 0})</h2></div>
        {discussion.comments?.length ? (
          <div className="divide-y divide-slate-100">
            {discussion.comments.map((item, index) => (
              <div key={item._id || `${item.createdAt || 'comment'}-${index}`} className="flex items-start gap-3 p-5">
                <Avatar name={item.authorId?.name} src={item.authorId?.profilePhoto} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-800">{item.authorId?.name || 'Community member'}</p>{item.authorId?.role && <Badge>{item.authorId.role}</Badge>}</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.content}</p>
                  {item.createdAt && <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState compact icon={MessageCircleMore} title="No comments yet" description="Add a thoughtful response to move the conversation forward." />}
        {user?.isApproved && (
          <form onSubmit={addComment} className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <label htmlFor="discussion-comment" className="mb-2 block text-sm font-bold text-slate-700">Add a comment</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <textarea id="discussion-comment" value={comment} onChange={(event) => { setComment(event.target.value); setActionError(''); }} rows="2" maxLength="1200" placeholder="Share a useful perspective…" className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <Button type="submit" loading={submitting} disabled={!comment.trim()} className="self-end"><Send className="h-4 w-4" /> Post</Button>
            </div>
            {actionError && <p className="mt-2 text-sm text-red-600" role="alert">{actionError}</p>}
          </form>
        )}
      </Card>
    </div>
  );
}
