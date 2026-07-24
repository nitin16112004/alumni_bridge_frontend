import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Filter,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

const emptyForm = { title: '', company: '', description: '', type: 'job', skills: '', applyLink: '' };

function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

export default function Jobs() {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const debouncedSkill = useDebouncedValue(skill);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: jobs = [], setData: setJobs, loading, error, retry } = useApiResource(
    async () => (await api.get('/jobs', { params: { ...(type ? { type } : {}), ...(debouncedSkill.trim() ? { skill: debouncedSkill.trim() } : {}) } })).data,
    [type, debouncedSkill],
  );

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs || [];
    return (jobs || []).filter((job) => `${job.title} ${job.company}`.toLowerCase().includes(query));
  }, [jobs, search]);

  const owns = (job) => role === 'alumni' && String(job.postedBy?._id || job.postedBy) === String(user?._id);
  const canPost = role === 'alumni' && user?.isApproved;

  const openEditor = (job = null) => {
    setEditingJob(job);
    setForm(job ? {
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      type: job.type || 'job',
      skills: job.skills?.join(', ') || '',
      applyLink: job.applyLink || '',
    } : emptyForm);
    setFormError('');
    setEditorOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const applyLink = form.applyLink.trim();
    if (applyLink && !safeExternalUrl(applyLink)) {
      setFormError('Apply link must be a complete http:// or https:// URL.');
      return;
    }
    if (form.description.trim().length < 20) {
      setFormError('Add a description of at least 20 characters.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      type: form.type,
      skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
      applyLink: applyLink || undefined,
    };
    setSubmitting(true);
    setFormError('');
    try {
      const { data: saved } = editingJob
        ? await api.put(`/jobs/${editingJob._id}`, payload)
        : await api.post('/jobs', payload);
      setJobs((current) => editingJob
        ? current.map((job) => job._id === editingJob._id ? { ...job, ...saved, postedBy: job.postedBy } : job)
        : [{ ...saved, postedBy: user }, ...current]);
      setEditorOpen(false);
      dispatch(addToast({ type: 'info', message: editingJob ? 'Opportunity updated.' : 'Opportunity posted.' }));
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'The opportunity could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  const removeJob = async () => {
    setDeleting(true);
    try {
      await api.delete(`/jobs/${deleteTarget._id}`);
      setJobs((current) => current.filter((job) => job._id !== deleteTarget._id));
      if (selectedJob?._id === deleteTarget._id) setSelectedJob(null);
      dispatch(addToast({ type: 'info', message: 'Opportunity deleted.' }));
      setDeleteTarget(null);
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'The opportunity could not be deleted.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container max-w-7xl">
      <PageHeader
        eyebrow="Career opportunities"
        title="Jobs and internships"
        description="Explore roles shared by alumni, or contribute an opportunity from your own network."
        actions={canPost && <Button onClick={() => openEditor()}><Plus className="h-4 w-4" /> Post opportunity</Button>}
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_1fr]">
          <label className="relative">
            <span className="sr-only">Search jobs</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or company" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </label>
          <label className="relative">
            <span className="sr-only">Opportunity type</span>
            <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
              <option value="">All opportunity types</option>
              <option value="job">Full-time jobs</option>
              <option value="internship">Internships</option>
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Filter by skill</span>
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Filter by required skill" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </label>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <Card key={item} className="p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-1/2" /><Skeleton className="mt-5 h-16" /><Skeleton className="mt-5 h-8 w-3/4" /></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : visibleJobs.length === 0 ? (
        <Card><EmptyState icon={BriefcaseBusiness} title="No opportunities found" description="Try broader filters, or check again when alumni share new roles." action={canPost && <Button onClick={() => openEditor()}><Plus className="h-4 w-4" /> Post the first opportunity</Button>} /></Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">{visibleJobs.length} opportunit{visibleJobs.length === 1 ? 'y' : 'ies'}</p>
            <p className="hidden text-xs text-slate-400 sm:block">The current backend returns one unpaginated result set.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleJobs.map((job) => (
              <Card key={job._id} className="flex min-w-0 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BriefcaseBusiness className="h-5 w-5" /></span>
                  <div className="flex items-center gap-1">
                    {owns(job) && <Button size="icon" variant="ghost" aria-label={`Edit ${job.title}`} onClick={() => openEditor(job)}><Pencil className="h-4 w-4" /></Button>}
                    {owns(job) && <Button size="icon" variant="ghost" aria-label={`Delete ${job.title}`} onClick={() => setDeleteTarget(job)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedJob(job)} className="mt-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                  <h2 className="line-clamp-2 text-base font-extrabold text-slate-950">{job.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Building2 className="h-3.5 w-3.5" /> {job.company}</p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
                </button>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge tone={job.type === 'internship' ? 'purple' : 'green'}>{job.type === 'internship' ? 'Internship' : 'Full-time'}</Badge>
                  {job.skills?.slice(0, 3).map((item) => <Badge key={item}>{item}</Badge>)}
                </div>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={job.postedBy?.name} src={job.postedBy?.profilePhoto} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">{job.postedBy?.name || 'Alumni member'}</p>
                      <p className="text-[11px] text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedJob(job)} className="ml-auto text-xs font-bold text-blue-600">Details →</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal open={Boolean(selectedJob)} onClose={() => setSelectedJob(null)} title={selectedJob?.title} description={selectedJob?.company}>
        {selectedJob && (
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={selectedJob.type === 'internship' ? 'purple' : 'green'}>{selectedJob.type}</Badge>
              <Badge>Posted {new Date(selectedJob.createdAt).toLocaleDateString()}</Badge>
            </div>
            <h3 className="mt-6 text-sm font-extrabold text-slate-950">About the opportunity</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{selectedJob.description}</p>
            {selectedJob.skills?.length > 0 && <div className="mt-6"><h3 className="text-sm font-extrabold text-slate-950">Required skills</h3><div className="mt-3 flex flex-wrap gap-2">{selectedJob.skills.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}</div></div>}
            {safeExternalUrl(selectedJob.applyLink) ? (
              <a href={safeExternalUrl(selectedJob.applyLink)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">Apply on external site <ExternalLink className="h-4 w-4" /></a>
            ) : (
              <div className="mt-7 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No verified external application link was provided. Contact the poster through the community.</div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editingJob ? 'Edit opportunity' : 'Post an opportunity'} description="Only your own listings can be edited or deleted.">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Title</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Company</span><input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          </div>
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Description</span><textarea required rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"><option value="job">Full-time job</option><option value="internship">Internship</option></select></label>
            <label><span className="mb-2 block text-sm font-bold text-slate-700">Apply link</span><input type="url" value={form.applyLink} onChange={(event) => setForm({ ...form, applyLink: event.target.value })} placeholder="https://…" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          </div>
          <label><span className="mb-2 block text-sm font-bold text-slate-700">Required skills</span><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="React, Node.js, Communication" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</div>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" loading={submitting}>{editingJob ? 'Save changes' : 'Post opportunity'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={removeJob} title="Delete this opportunity?" description={`“${deleteTarget?.title || 'This listing'}” will be removed from Alumni Bridge.`} confirmLabel="Delete opportunity" loading={deleting} />
    </div>
  );
}
