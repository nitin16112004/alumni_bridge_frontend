import { MessageCircleMore, Plus, Search, Tag, ThumbsUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { addToast } from '../store/slices/toastSlice';
import useApiResource from '../hooks/useApiResource';
import useDebouncedValue from '../hooks/useDebouncedValue';
import PageHeader from '../components/common/PageHeader';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const emptyForm = { title: '', content: '', tags: '' };

export default function Discussions() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const collegeId = typeof user?.collegeId === 'object' ? user.collegeId?._id : user?.collegeId;
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const debouncedTag = useDebouncedValue(tag);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState('');

  const { data: discussions = [], setData: setDiscussions, loading, error, retry } = useApiResource(
    async () => (await api.get('/discussions', { params: { ...(collegeId ? { collegeId } : {}), ...(debouncedTag.trim() ? { tag: debouncedTag.trim() } : {}) } })).data,
    [collegeId, debouncedTag],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return discussions || [];
    return (discussions || []).filter((discussion) => `${discussion.title} ${discussion.content} ${discussion.authorId?.name}`.toLowerCase().includes(query));
  }, [discussions, search]);

  const createDiscussion = async (event) => {
    event.preventDefault();
    if (form.title.trim().length < 5) return setFormError('Title must be at least 5 characters.');
    if (form.content.trim().length < 20) return setFormError('Post content must be at least 20 characters.');
    setSubmitting(true);
    setFormError('');
    try {
      const { data: created } = await api.post('/discussions', {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setDiscussions((current) => [created, ...current]);
      setForm(emptyForm);
      setComposerOpen(false);
      dispatch(addToast({ type: 'info', message: 'Discussion published.' }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'The discussion could not be published.'));
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (discussion) => {
    setVoting(discussion._id);
    try {
      const { data } = await api.put(`/discussions/${discussion._id}/upvote`);
      setDiscussions((current) => current.map((item) => item._id === discussion._id ? { ...item, upvoteCount: data.upvotes } : item));
    } catch (requestError) {
      dispatch(addToast({ type: 'info', message: getApiErrorMessage(requestError, 'The vote could not be updated.') }));
    } finally {
      setVoting('');
    }
  };

  return (
    <div className="page-container max-w-6xl">
      <PageHeader
        eyebrow="Community"
        title="Discussions"
        description="Ask thoughtful questions, share practical experience, and learn in public with your alumni community."
        actions={user?.isApproved && <Button onClick={() => setComposerOpen(true)}><Plus className="h-4 w-4" /> Start discussion</Button>}
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
          <label className="relative"><span className="sr-only">Search discussions</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, content, or author" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label className="relative"><span className="sr-only">Filter by tag</span><Tag className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Exact tag filter" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">{[0, 1, 2, 3].map((item) => <Card key={item} className="p-5"><div className="flex gap-3"><Skeleton className="h-10 w-10" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></div><Skeleton className="mt-4 h-20" /></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : visible.length === 0 ? (
        <Card><EmptyState icon={MessageCircleMore} title="No discussions found" description="Try another search or tag, or start a useful conversation for your community." action={user?.isApproved && <Button onClick={() => setComposerOpen(true)}><Plus className="h-4 w-4" /> Start discussion</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {visible.map((discussion) => (
            <Card key={discussion._id} className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Avatar name={discussion.authorId?.name} src={discussion.authorId?.profilePhoto} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{discussion.authorId?.name || 'Community member'}</p>
                    {discussion.authorId?.role && <Badge tone={discussion.authorId.role === 'alumni' ? 'purple' : 'blue'}>{discussion.authorId.role}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{new Date(discussion.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Link to={`/discussions/${discussion._id}`} className="mt-4 block rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                <h2 className="text-lg font-extrabold text-slate-950 transition hover:text-blue-700">{discussion.title}</h2>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{discussion.content}</p>
              </Link>
              {discussion.tags?.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{discussion.tags.map((item) => <Badge key={item}>{item}</Badge>)}</div>}
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                <Button variant="ghost" size="sm" onClick={() => vote(discussion)} loading={voting === discussion._id}>
                  <ThumbsUp className="h-4 w-4" /> {discussion.upvoteCount ?? discussion.upvotes?.length ?? 0}
                </Button>
                <Link to={`/discussions/${discussion._id}`} className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100">
                  <MessageCircleMore className="h-4 w-4" /> {discussion.comments?.length || 0} comments
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={composerOpen} onClose={() => setComposerOpen(false)} title="Start a discussion" description="Use a clear title and enough context for the community to respond well.">
        <form onSubmit={createDiscussion} className="space-y-4">
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Title</span><input required value={form.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); setFormError(''); }} maxLength="160" placeholder="What would you like to discuss?" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Context</span><textarea required rows="7" value={form.content} onChange={(event) => { setForm({ ...form, content: event.target.value }); setFormError(''); }} placeholder="Share the background, your question, and what a useful answer would include…" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Tags</span><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="careers, interviews, engineering" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><span className="mt-2 block text-xs text-slate-400">Separate tags with commas.</span></label>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</div>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>Publish discussion</Button></div>
        </form>
      </Modal>
    </div>
  );
}
