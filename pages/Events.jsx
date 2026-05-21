import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { CalendarDays, MapPin, Plus, X, Users, CheckCircle, ChevronRight, Clock } from 'lucide-react';

function EventModal({ event, user, onClose, onRegister, registering }) {
  if (!event) return null;
  const isPast = new Date(event.date) < new Date();
  const isRegistered = event.registrations?.some((r) => String(r) === String(user?._id));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 pr-4">{event.title}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays size={15} className="text-blue-500" />
              {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
              {isPast && <span className="text-xs text-red-500 font-medium">(Past)</span>}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={15} className="text-blue-500" /> {event.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={15} className="text-blue-500" /> {event.registrations?.length || 0} registered
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">About this event</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          <p className="text-xs text-gray-400 mb-4">Organized by {event.organizer?.name}</p>

          {user?.role === 'student' && !isPast && (
            isRegistered ? (
              <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-sm font-medium">
                <CheckCircle size={16} /> You're registered
              </div>
            ) : (
              <button
                onClick={() => onRegister(event._id)}
                disabled={registering === event._id}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {registering === event._id ? 'Registering...' : 'Register for Event'}
              </button>
            )
          )}
          {isPast && (
            <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-500">
              This event has already taken place.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const { user } = useSelector((s) => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [registering, setRegistering] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = () => {
    const params = user?.collegeId ? `?collegeId=${user.collegeId}` : '';
    api.get(`/events${params}`).then((r) => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/events', form);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '' });
      loadEvents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const register = async (id) => {
    setRegistering(id);
    try {
      await api.post(`/events/${id}/register`);
      loadEvents();
      setSelectedEvent((prev) => prev ? { ...prev, registrations: [...(prev.registrations || []), user._id] } : prev);
    } catch {
      loadEvents();
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (event) => event.registrations?.some((r) => String(r) === String(user?._id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm">Upcoming alumni and college events</p>
        </div>
        {(user?.role === 'alumni' || user?.entityType === 'college') && user?.isApproved && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Event Title" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Event description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-40" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CalendarDays size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No events scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => {
            const isPast = new Date(event.date) < new Date();
            return (
              <button
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</h3>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0 ml-2 mt-0.5" />
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={12} />
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isPast && <span className="text-red-400">(Past)</span>}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={12} /> {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users size={12} /> {event.registrations?.length || 0} registered
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">By {event.organizer?.name}</span>
                  {user?.role === 'student' && !isPast && (
                    isRegistered(event)
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Registered</span>
                      : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Click to register</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <EventModal
        event={selectedEvent}
        user={user}
        onClose={() => setSelectedEvent(null)}
        onRegister={register}
        registering={registering}
      />
    </div>
  );
}
