import {
  Building2,
  CheckCircle2,
  CircleUserRound,
  GraduationCap,
  Mail,
  Save,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { updateCurrentEntity } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/common/PageHeader';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';

const fields = ['name', 'bio', 'skills', 'graduationYear', 'profilePhoto'];

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '',
    currentCompany: '',
    currentRole: '',
    graduationYear: '',
    profilePhoto: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { data: profile, setData: setProfile, loading, error, retry } = useApiResource(
    async () => (await api.get(`/users/profile/${user?._id}`)).data,
    [user?._id],
  );

  useEffect(() => {
    const source = profile || user;
    if (!source) return;
    setForm({
      name: source.name || '',
      bio: source.bio || '',
      skills: source.skills?.join(', ') || '',
      currentCompany: source.currentCompany || '',
      currentRole: source.currentRole || '',
      graduationYear: source.graduationYear || '',
      profilePhoto: source.profilePhoto || '',
    });
  }, [profile, user]);

  const completion = useMemo(() => {
    const values = {
      ...profile,
      name: form.name,
      bio: form.bio,
      skills: form.skills.split(',').filter((item) => item.trim()),
      graduationYear: form.graduationYear,
      profilePhoto: form.profilePhoto,
    };
    const complete = fields.filter((field) => Array.isArray(values[field]) ? values[field].length : Boolean(values[field])).length;
    return Math.round((complete / fields.length) * 100);
  }, [form, profile]);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setFormError('Full name is required.');
    if (form.profilePhoto.trim()) {
      try {
        const parsed = new URL(form.profilePhoto.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      } catch {
        return setFormError('Profile photo must be a complete http:// or https:// URL.');
      }
    }
    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim(),
      skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
      currentCompany: form.currentCompany.trim(),
      currentRole: form.currentRole.trim(),
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      profilePhoto: form.profilePhoto.trim(),
    };
    setSaving(true);
    setFormError('');
    try {
      const { data: updated } = await api.put('/users/profile', payload);
      setProfile((current) => ({ ...current, ...updated, collegeId: current?.collegeId }));
      dispatch(updateCurrentEntity(updated));
      dispatch(addToast({ type: 'info', message: 'Profile updated.' }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Your profile could not be updated.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container max-w-6xl"><div className="grid gap-6 xl:grid-cols-[360px_1fr]"><Card className="p-6"><Skeleton className="h-72" /></Card><Card className="p-6"><Skeleton className="h-[520px]" /></Card></div></div>;
  if (error) return <div className="page-container max-w-5xl"><Card><ErrorState message={error} onRetry={retry} /></Card></div>;

  const current = profile || user;

  return (
    <div className="page-container max-w-6xl">
      <PageHeader eyebrow="Your account" title="Profile" description="Keep the details other students and alumni use to understand your background up to date." />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-[#111b44] to-indigo-700" />
            <div className="-mt-10 p-6 text-center">
              <Avatar name={form.name} src={form.profilePhoto} size="xl" className="mx-auto ring-4 ring-white" />
              <h2 className="mt-4 text-xl font-extrabold text-slate-950">{form.name || current?.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{current?.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge tone={current?.role === 'alumni' ? 'purple' : 'blue'}>{current?.role}</Badge>
                <Badge tone={current?.isApproved ? 'green' : 'amber'}>{current?.isApproved ? <><CheckCircle2 className="h-3 w-3" /> Verified</> : 'Approval pending'}</Badge>
              </div>
              {current?.collegeId?.name && <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"><School className="h-4 w-4" /> {current.collegeId.name}</p>}
              {form.currentRole && <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500"><Building2 className="h-4 w-4" /> {form.currentRole}{form.currentCompany ? ` at ${form.currentCompany}` : ''}</p>}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div><h3 className="text-sm font-extrabold text-slate-950">Profile strength</h3><p className="mt-1 text-xs text-slate-500">A complete profile helps build trust.</p></div>
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${completion}%` }} /></div>
            <p className="mt-2 text-xs font-bold text-slate-700">{completion}% complete</p>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><ShieldCheck className="h-4 w-4 text-indigo-600" /> Protected account fields</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">Role, college, approval status, email, and password are never submitted by this profile form.</p>
          </Card>
        </aside>

        <Card className="p-5 sm:p-7">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Full name</span><div className="relative"><CircleUserRound className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input name="name" value={form.name} onChange={update} required className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div></label>
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input value={current?.email || ''} disabled className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm text-slate-500" /></div></label>
            </div>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Bio</span><textarea name="bio" value={form.bio} onChange={update} rows="5" maxLength="1500" placeholder="Share your background, interests, and what you hope to contribute…" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Graduation year</span><div className="relative"><GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input type="number" name="graduationYear" value={form.graduationYear} onChange={update} min="1950" max={new Date().getFullYear() + 10} className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div></label>
              <label><span className="mb-2 block text-sm font-bold text-slate-700">Profile photo URL</span><input type="url" name="profilePhoto" value={form.profilePhoto} onChange={update} placeholder="https://…" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
            </div>
            {current?.role === 'alumni' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="mb-2 block text-sm font-bold text-slate-700">Current role</span><input name="currentRole" value={form.currentRole} onChange={update} placeholder="Product Designer" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
                <label><span className="mb-2 block text-sm font-bold text-slate-700">Current company</span><input name="currentCompany" value={form.currentCompany} onChange={update} placeholder="Company name" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
              </div>
            )}
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Skills</span><input name="skills" value={form.skills} onChange={update} placeholder="React, Python, Communication" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><span className="mt-2 block text-xs text-slate-400">Separate skills with commas.</span></label>
            {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</div>}
            <Button type="submit" size="lg" loading={saving}><Save className="h-4 w-4" /> Save profile</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
