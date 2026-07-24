import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MessageCircleMore,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import { addToast } from '../../store/slices/toastSlice';
import useApiResource from '../../hooks/useApiResource';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const { data, setData, loading, error, retry } = useApiResource(async () => {
    const [mentor, requests] = await Promise.all([
      api.get(`/mentors/${id}`),
      api.get('/mentorship/sent'),
    ]);
    const existingRequest = requests.data.find(
      (request) => String(request.mentorId?._id || request.mentorId) === String(id),
    ) || null;
    return { mentor: mentor.data, existingRequest };
  }, [id]);

  const mentor = data?.mentor;
  const existingRequest = data?.existingRequest;

  const sendRequest = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setActionError('Add a short introduction and what you would like guidance on.');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      const { data: request } = await api.post('/mentorship/request', { mentorId: id, message: trimmedMessage });
      setData((current) => ({ ...current, existingRequest: request }));
      setMessage('');
      dispatch(addToast({ type: 'mentorship', message: 'Mentorship request sent.' }));
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The mentorship request could not be sent.'));
    } finally {
      setSubmitting(false);
    }
  };

  const startChat = async () => {
    if (!mentor?.userId?._id) return;
    setStartingChat(true);
    setActionError('');
    try {
      await api.post('/chat/conversations', { participantId: mentor.userId._id });
      navigate('/chat');
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'The conversation could not be opened.'));
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-5xl">
        <Skeleton className="h-6 w-32" />
        <Card className="mt-6 p-6 sm:p-8">
          <div className="flex gap-5"><Skeleton className="h-20 w-20 rounded-2xl" /><div className="flex-1 space-y-3"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64" /><Skeleton className="h-4 w-40" /></div></div>
          <Skeleton className="mt-8 h-28" />
        </Card>
      </div>
    );
  }

  if (error || !mentor) {
    return <div className="page-container max-w-4xl"><Card><ErrorState title="Mentor profile unavailable" message={error || 'This mentor profile could not be found.'} onRetry={retry} /></Card></div>;
  }

  const requestPanel = () => {
    if (!mentor.availability && !existingRequest) {
      return (
        <Card className="border-slate-200 bg-slate-100/60 p-5">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Not accepting new requests right now</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">You can revisit this profile later when the mentor’s availability changes.</p>
            </div>
          </div>
        </Card>
      );
    }

    if (existingRequest?.status === 'accepted') {
      return (
        <Card className="border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-extrabold text-emerald-950">You’re connected</h2>
                <p className="mt-1 text-sm leading-6 text-emerald-700">Your request was accepted. Continue the relationship in Messages.</p>
              </div>
            </div>
            <Button onClick={startChat} loading={startingChat}><MessageCircleMore className="h-4 w-4" /> Message mentor</Button>
          </div>
          {actionError && <p className="mt-3 text-sm text-red-600" role="alert">{actionError}</p>}
        </Card>
      );
    }

    if (existingRequest?.status === 'pending') {
      return (
        <Card className="border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-extrabold text-amber-950">Request awaiting a response</h2>
              <p className="mt-1 text-sm leading-6 text-amber-700">You sent this request on {new Date(existingRequest.createdAt).toLocaleDateString()}.</p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">Request mentorship</h2>
            <p className="mt-1 text-sm text-slate-500">A specific introduction helps mentors respond meaningfully.</p>
          </div>
          {existingRequest?.status === 'rejected' && <Badge tone="slate"><RotateCcw className="h-3 w-3" /> Previous request declined</Badge>}
        </div>
        <form onSubmit={sendRequest} className="mt-5">
          <label htmlFor="request-message" className="mb-2 block text-sm font-bold text-slate-700">Introduction and guidance goal</label>
          <textarea
            id="request-message"
            value={message}
            onChange={(event) => { setMessage(event.target.value); setActionError(''); }}
            rows={5}
            maxLength={1000}
            placeholder="Share a little about yourself, your goal, and where this mentor’s experience could help…"
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">{message.length}/1000</p>
            <Button type="submit" loading={submitting}><Send className="h-4 w-4" /> Send request</Button>
          </div>
          {actionError && <p className="mt-3 text-sm text-red-600" role="alert">{actionError}</p>}
        </form>
      </Card>
    );
  };

  return (
    <div className="page-container max-w-5xl">
      <Link to="/mentors" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Back to mentors</Link>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={mentor.userId?.name} src={mentor.userId?.profilePhoto} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">{mentor.userId?.name || 'Alumni mentor'}</h1>
                <Badge tone={mentor.availability ? 'green' : 'slate'}>{mentor.availability ? 'Available' : 'Unavailable'}</Badge>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600"><Building2 className="h-4 w-4 text-slate-400" /> {mentor.role || 'Mentor'}{mentor.company ? ` at ${mentor.company}` : ''}</p>
              {mentor.collegeId?.name && <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><GraduationCap className="h-4 w-4 text-slate-400" /> {mentor.collegeId.name}</p>}
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4 text-slate-400" /> {mentor.yearsOfExperience || 0} years of experience</p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-extrabold text-slate-950">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{mentor.bio || mentor.userId?.bio || 'This mentor has not added a biography yet.'}</p>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-extrabold text-slate-950">Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertise?.length ? mentor.expertise.map((item) => <Badge key={item} tone="blue">{item}</Badge>) : <p className="text-sm text-slate-500">No expertise areas listed.</p>}
            </div>
          </div>

          {mentor.userId?.skills?.length > 0 && (
            <div className="mt-7">
              <h2 className="text-sm font-extrabold text-slate-950">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">{mentor.userId.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>
            </div>
          )}
        </Card>

        <aside>{requestPanel()}</aside>
      </div>
    </div>
  );
}
