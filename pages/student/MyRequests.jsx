import { ArrowRight, Clock3, MessageCircleMore, RotateCcw, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

const statusTone = { pending: 'amber', accepted: 'green', rejected: 'red' };

export default function MyRequests() {
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const { data: requests = [], loading, error, retry } = useApiResource(
    async () => (await api.get('/mentorship/sent')).data,
    [],
  );

  const startChat = async (mentorUserId, requestId) => {
    setChatLoading(requestId);
    setActionError('');
    try {
      await api.post('/chat/conversations', { participantId: mentorUserId });
      navigate('/chat');
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The conversation could not be opened.'));
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        eyebrow="Mentorship"
        title="Your mentorship requests"
        description="Track every introduction and continue conversations after a mentor accepts."
        actions={<Link to="/mentors" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">Find mentors <ArrowRight className="h-4 w-4" /></Link>}
      />

      {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</div>}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((item) => <Card key={item} className="p-5"><div className="flex gap-3"><Skeleton className="h-12 w-12" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-28" /></div></div><Skeleton className="mt-4 h-14" /></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : requests.length === 0 ? (
        <Card>
          <EmptyState icon={UserCheck} title="You haven’t requested mentorship yet" description="Browse alumni profiles and send a thoughtful introduction when you find the right match." action={<Link to="/mentors" className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Browse mentors</Link>} />
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const mentor = request.mentorId;
            const mentorUser = mentor?.userId;
            return (
              <Card key={request._id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Avatar name={mentorUser?.name} src={mentorUser?.profilePhoto} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-950">{mentorUser?.name || 'Alumni mentor'}</h2>
                      <Badge tone={statusTone[request.status]}>{request.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{mentor?.role || 'Mentor'}{mentor?.company ? ` at ${mentor.company}` : ''}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Sent {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {request.status === 'accepted' && mentorUser?._id && (
                      <Button onClick={() => startChat(mentorUser._id, request._id)} loading={chatLoading === request._id}>
                        <MessageCircleMore className="h-4 w-4" /> Message mentor
                      </Button>
                    )}
                    {request.status === 'rejected' && mentor?._id && (
                      <Link to={`/mentors/${mentor._id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                        <RotateCcw className="h-4 w-4" /> Request again
                      </Link>
                    )}
                  </div>
                </div>
                {request.message && (
                  <blockquote className="mt-4 rounded-xl border-l-4 border-indigo-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">“{request.message}”</blockquote>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
