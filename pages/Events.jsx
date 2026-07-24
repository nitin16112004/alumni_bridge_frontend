import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  School,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { addToast } from '../store/slices/toastSlice';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/common/PageHeader';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const emptyForm = { title: '', description: '', date: '', location: '' };

function organizerName(event) {
  return event.organizer?.name || event.organizer?.institutionName || 'Alumni Bridge community';
}

export default function Events() {
  const dispatch = useDispatch();
  const { user, currentEntity, role } = useSelector((state) => state.auth);
  const collegeId = role === 'college'
    ? currentEntity?._id
    : typeof user?.collegeId === 'object' ? user.collegeId?._id : user?.collegeId;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: events = [], setData: setEvents, loading, error, retry } = useApiResource(
    async () => (await api.get('/events', { params: collegeId ? { collegeId } : {} })).data,
    [collegeId],
  );

  const now = new Date();
  const upcoming = (events || []).filter((event) => new Date(event.date) >= now);
  const past = (events || []).filter((event) => new Date(event.date) < now).reverse();
  const canCreate = role === 'alumni' && user?.isApproved;
  const isRegistered = (event) => event.registrations?.some((registration) => String(registration?._id || registration) === String(user?._id));

  const submit = async (event) => {
    event.preventDefault();
    if (new Date(form.date) <= new Date()) {
      setFormError('Choose a future date and time.');
      return;
    }
    if (form.description.trim().length < 20) {
      setFormError('Add a description of at least 20 characters.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const { data: created } = await api.post('/events', {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        location: form.location.trim(),
      });
      setEvents((current) => [...current, { ...created, organizer: user, registrations: [] }].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setForm(emptyForm);
      setEditorOpen(false);
      dispatch(addToast({ type: 'event', message: 'Event created.' }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'The event could not be created.'));
    } finally {
      setSubmitting(false);
    }
  };

  const register = async (event) => {
    setRegistering(event._id);
    setActionError('');
    try {
      await api.post(`/events/${event._id}/register`);
      const registrations = [...(event.registrations || []), user._id];
      setEvents((current) => current.map((item) => item._id === event._id ? { ...item, registrations } : item));
      setSelectedEvent((current) => current?._id === event._id ? { ...current, registrations } : current);
      dispatch(addToast({ type: 'event', message: 'You’re registered for the event.' }));
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Event registration failed.'));
    } finally {
      setRegistering('');
    }
  };

  const eventCards = (items, isPast = false) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((event) => (
        <button key={event._id} type="button" onClick={() => { setSelectedEvent(event); setActionError(''); }} className="group rounded-2xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <Card className={`h-full overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md ${isPast ? 'opacity-80' : ''}`}>
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <span className="text-[9px] font-bold uppercase">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                  <span className="text-base font-extrabold">{new Date(event.date).getDate()}</span>
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {isPast && <Badge>Past</Badge>}
                  {!isPast && role === 'student' && isRegistered(event) && <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Registered</Badge>}
                </div>
              </div>
              <h3 className="mt-4 line-clamp-2 text-base font-extrabold text-slate-950 group-hover:text-blue-700">{event.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{event.description}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-slate-400" /> {new Date(event.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {event.location || 'Location to be announced'}</p>
                <p className="flex items-center gap-2"><UsersRound className="h-3.5 w-3.5 text-slate-400" /> {event.registrations?.length || 0} registered</p>
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-container max-w-7xl">
      <PageHeader
        eyebrow="Community calendar"
        title="Events"
        description="Discover upcoming gatherings, learning sessions, and alumni conversations from your institution."
        actions={canCreate && <Button onClick={() => { setFormError(''); setEditorOpen(true); }}><Plus className="h-4 w-4" /> Create event</Button>}
      />

      {role === 'college' && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50/70 p-4">
          <div className="flex items-start gap-3">
            <School className="mt-0.5 h-5 w-5 text-indigo-600" />
            <p className="text-sm leading-6 text-indigo-800">College event creation is not exposed because the current backend controller requires a User organizer. Institution events already associated with your college remain available here.</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <Card key={item} className="p-5"><Skeleton className="h-12 w-12" /><Skeleton className="mt-4 h-5 w-2/3" /><Skeleton className="mt-3 h-14" /></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : events.length === 0 ? (
        <Card><EmptyState icon={CalendarDays} title="No events scheduled" description="Community events associated with your college will appear here." action={canCreate && <Button onClick={() => setEditorOpen(true)}><Plus className="h-4 w-4" /> Create the first event</Button>} /></Card>
      ) : (
        <div className="space-y-9">
          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-950">Upcoming events</h2><Badge tone="blue">{upcoming.length}</Badge></div>
            {upcoming.length ? eventCards(upcoming) : <Card><EmptyState compact icon={CalendarDays} title="Nothing upcoming" description="Past events remain available below." /></Card>}
          </section>
          {past.length > 0 && <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-950">Past events</h2><Badge>{past.length}</Badge></div>{eventCards(past, true)}</section>}
        </div>
      )}

      <Modal open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title} description={selectedEvent ? `Organized by ${organizerName(selectedEvent)}` : ''}>
        {selectedEvent && (
          <div>
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600" /> {new Date(selectedEvent.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {selectedEvent.location || 'Location to be announced'}</p>
              <p className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-blue-600" /> {selectedEvent.registrations?.length || 0} registered</p>
            </div>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">{selectedEvent.description}</p>
            <div className="mt-6 flex items-center gap-3"><Avatar name={organizerName(selectedEvent)} src={selectedEvent.organizer?.profilePhoto} size="md" /><div><p className="text-sm font-bold text-slate-800">{organizerName(selectedEvent)}</p><p className="text-xs text-slate-500">Event organizer</p></div></div>
            {actionError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</div>}
            {role === 'student' && new Date(selectedEvent.date) >= new Date() && (
              isRegistered(selectedEvent)
                ? <div className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> You’re registered</div>
                : <Button className="mt-6 w-full" onClick={() => register(selectedEvent)} loading={registering === selectedEvent._id}>Register for event</Button>
            )}
            {new Date(selectedEvent.date) < new Date() && <div className="mt-6 rounded-xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-500">This event has already taken place.</div>}
          </div>
        )}
      </Modal>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title="Create an event" description="Events are visible to members associated with your college.">
        <form onSubmit={submit} className="space-y-4">
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Event title</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Description</span><textarea required rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Date and time</span><input required type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Room, campus, or online" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          </div>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</div>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>Create event</Button></div>
        </form>
      </Modal>
    </div>
  );
}
