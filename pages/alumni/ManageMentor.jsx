import { BriefcaseBusiness, CheckCircle2, Eye, GraduationCap, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import { addToast } from '../../store/slices/toastSlice';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

const initialForm = {
  expertise: '',
  company: '',
  role: '',
  yearsOfExperience: '',
  bio: '',
  availability: true,
};

export default function ManageMentor() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: mentor, setData: setMentor, loading, error, retry } = useApiResource(async () => {
    try {
      return (await api.get('/mentors/me')).data;
    } catch (requestError) {
      if (requestError.response?.status === 404) return null;
      throw requestError;
    }
  }, []);

  useEffect(() => {
    if (!mentor) return;
    setForm({
      expertise: mentor.expertise?.join(', ') || '',
      company: mentor.company || '',
      role: mentor.role || '',
      yearsOfExperience: mentor.yearsOfExperience ?? '',
      bio: mentor.bio || '',
      availability: Boolean(mentor.availability),
    });
  }, [mentor]);

  const update = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: value }));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const expertise = form.expertise.split(',').map((item) => item.trim()).filter(Boolean);
    if (!form.role.trim() || !form.company.trim()) {
      setFormError('Current role and company are required.');
      return;
    }
    if (Number(form.yearsOfExperience) < 0) {
      setFormError('Years of experience cannot be negative.');
      return;
    }
    setSaving(true);
    setFormError('');
    const payload = {
      expertise,
      company: form.company.trim(),
      role: form.role.trim(),
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      bio: form.bio.trim(),
      availability: form.availability,
    };
    try {
      const response = mentor
        ? await api.put(`/mentors/${mentor._id}`, payload)
        : await api.post('/mentors', payload);
      setMentor(response.data);
      dispatch(addToast({ type: 'mentorship', message: mentor ? 'Mentor profile updated.' : 'Mentor profile published.' }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'The mentor profile could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><Card className="p-6"><Skeleton className="h-[520px]" /></Card><Card className="p-6"><Skeleton className="h-72" /></Card></div></div>;
  }

  if (error) {
    return <div className="page-container"><Card><ErrorState message={error} onRetry={retry} /></Card></div>;
  }

  const tags = form.expertise.split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Alumni mentorship"
        title={mentor ? 'Manage your mentor profile' : 'Create your mentor profile'}
        description="Help students understand where your experience is most useful before they request mentorship."
      >
        <div className="mt-3"><Badge tone={form.availability ? 'green' : 'slate'}>{form.availability ? 'Accepting requests' : 'Not accepting requests'}</Badge></div>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Current role</span>
                <input name="role" value={form.role} onChange={update} required placeholder="e.g. Product Engineer" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Company</span>
                <input name="company" value={form.company} onChange={update} required placeholder="e.g. Microsoft" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Years of experience</span>
              <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={update} min="0" max="60" inputMode="numeric" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Expertise areas</span>
              <input name="expertise" value={form.expertise} onChange={update} placeholder="System design, Data science, Product strategy" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <span className="mt-2 block text-xs text-slate-400">Separate each area with a comma. These become searchable tags.</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Mentorship bio</span>
              <textarea name="bio" value={form.bio} onChange={update} rows="6" maxLength="1500" placeholder="Share your background, the questions you enjoy helping with, and what a student can expect…" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <span className="mt-2 block text-right text-xs text-slate-400">{form.bio.length}/1500</span>
            </label>
            <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-bold text-slate-800">Available for new requests</span>
                <span className="mt-0.5 block text-xs text-slate-500">Students can send mentorship requests while this is on.</span>
              </span>
              <input type="checkbox" name="availability" checked={form.availability} onChange={update} className="h-5 w-5 accent-blue-600" />
            </label>
            {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</div>}
            <Button type="submit" size="lg" loading={saving}><Save className="h-4 w-4" /> {mentor ? 'Save changes' : 'Publish mentor profile'}</Button>
          </form>
        </Card>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400"><Eye className="h-3.5 w-3.5" /> Student preview</div>
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-[#111b44] to-indigo-700" />
            <div className="-mt-8 p-5">
              <Avatar name={user?.name} src={user?.profilePhoto} size="xl" className="ring-4 ring-white" />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-950">{user?.name}</h2>
                <Badge tone={form.availability ? 'green' : 'slate'}>{form.availability ? 'Available' : 'Unavailable'}</Badge>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><BriefcaseBusiness className="h-4 w-4 text-slate-400" /> {form.role || 'Your current role'}{form.company ? ` at ${form.company}` : ''}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><GraduationCap className="h-4 w-4 text-slate-400" /> {form.yearsOfExperience || 0} years experience</p>
              <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-500">{form.bio || 'Your mentorship bio preview will appear here.'}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{tags.length ? tags.slice(0, 6).map((tag) => <Badge key={tag} tone="blue">{tag}</Badge>) : <Badge><Sparkles className="h-3 w-3" /> Add expertise</Badge>}</div>
            </div>
          </Card>
          {mentor && <p className="mt-3 flex items-center gap-2 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Your mentor profile is published.</p>}
        </aside>
      </div>
    </div>
  );
}
