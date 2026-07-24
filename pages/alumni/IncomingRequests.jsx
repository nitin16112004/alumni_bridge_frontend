import { Check, GraduationCap, MessageCircleMore, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import { addToast } from '../../store/slices/toastSlice';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

const statusTone = { pending: 'amber', accepted: 'green', rejected: 'red' };

export default function IncomingRequests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState('');
  const [chatLoading, setChatLoading] = useState('');
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const { data, setData, loading, error, retry } = useApiResource(async () => {
    try {
      return { hasProfile: true, requests: (await api.get('/mentorship/received')).data };
    } catch (requestError) {
      if (requestError.response?.status === 404) return { hasProfile: false, requests: [] };
      throw requestError;
    }
  }, []);

  const respond = async (requestId, status) => {
    setProcessing(`${requestId}:${status}`);
    setActionError('');
    try {
      const { data: updated } = await api.put(`/mentorship/respond/${requestId}`, { status });
      setData((current) => ({
        ...current,
        requests: current.requests.map((request) => request._id === requestId
          ? { ...request, ...updated, studentId: request.studentId }
          : request),
      }));
      dispatch(addToast({ type: 'mentorship', message: `Mentorship request ${status}.` }));
      setRejectTarget(null);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The mentorship request could not be updated.'));
    } finally {
      setProcessing('');
    }
  };

  const startChat = async (studentId, requestId) => {
    setChatLoading(requestId);
    setActionError('');
    try {
      await api.post('/chat/conversations', { participantId: studentId });
      navigate('/chat');
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The conversation could not be opened.'));
    } finally {
      setChatLoading('');
    }
  };

  const requests = data?.requests || [];

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        eyebrow="Alumni mentorship"
        title="Mentorship requests"
        description="Review each student’s goals before accepting a mentorship connection."
        actions={<Link to="/alumni/mentor" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><GraduationCap className="h-4 w-4" /> Mentor profile</Link>}
      />

      {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</div>}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((item) => <Card key={item} className="p-6"><div className="flex gap-3"><Skeleton className="h-12 w-12" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-52" /></div></div><Skeleton className="mt-4 h-16" /></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : !data?.hasProfile ? (
        <Card><EmptyState icon={GraduationCap} title="Create your mentor profile first" description="Students can only send requests after your mentor profile is published." action={<Link to="/alumni/mentor" className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Create mentor profile</Link>} /></Card>
      ) : requests.length === 0 ? (
        <Card><EmptyState icon={UserCheck} title="No mentorship requests yet" description="When students discover your mentor profile and ask for guidance, their requests will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar name={request.studentId?.name} src={request.studentId?.profilePhoto} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-950">{request.studentId?.name || 'Student'}</h2>
                    <Badge tone={statusTone[request.status]}>{request.status}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{request.studentId?.email}</p>
                  <p className="mt-2 text-xs text-slate-400">Requested {new Date(request.createdAt).toLocaleDateString()}</p>
                  {request.studentId?.skills?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{request.studentId.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>}
                </div>
              </div>

              {request.message && <blockquote className="mt-4 rounded-xl border-l-4 border-indigo-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">“{request.message}”</blockquote>}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                {request.status === 'accepted' && request.studentId?._id && (
                  <Button onClick={() => startChat(request.studentId._id, request._id)} loading={chatLoading === request._id}>
                    <MessageCircleMore className="h-4 w-4" /> Message student
                  </Button>
                )}
                {request.status === 'pending' && (
                  <>
                    <Button variant="danger" onClick={() => setRejectTarget(request)} disabled={Boolean(processing)}>
                      <X className="h-4 w-4" /> Decline
                    </Button>
                    <Button variant="success" onClick={() => respond(request._id, 'accepted')} loading={processing === `${request._id}:accepted`} disabled={Boolean(processing) && processing !== `${request._id}:accepted`}>
                      <Check className="h-4 w-4" /> Accept request
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => respond(rejectTarget._id, 'rejected')}
        title="Decline this mentorship request?"
        description={`This will notify ${rejectTarget?.studentId?.name || 'the student'} that the request was declined. They may send another request later.`}
        confirmLabel="Decline request"
        loading={processing === `${rejectTarget?._id}:rejected`}
      />
    </div>
  );
}
