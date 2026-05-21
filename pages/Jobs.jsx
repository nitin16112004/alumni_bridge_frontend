import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Briefcase, Plus, X, ExternalLink, Building2, Clock, Tag, ChevronRight } from 'lucide-react';

function JobModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <Building2 size={14} /> {job.company}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${job.type === 'internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              {job.type === 'internship' ? 'Internship' : 'Full-time'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
              <Clock size={11} /> Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center gap-1.5">
                <Tag size={13} /> Required Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-4">Posted by {job.postedBy?.name}</p>

          {job.applyLink ? (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Apply Now <ExternalLink size={15} />
            </a>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-500">
              No direct apply link — contact the poster via chat or discussions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { user } = useSelector((s) => s.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({ title: '', company: '', description: '', type: 'job', skills: '', applyLink: '' });

  const loadJobs = () => {
    const params = filter ? `?type=${filter}` : '';
    api.get(`/jobs${params}`).then((r) => setJobs(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, [filter]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/jobs', { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) });
      setShowForm(false);
      setForm({ title: '', company: '', description: '', type: 'job', skills: '', applyLink: '' });
      loadJobs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs & Internships</h1>
          <p className="text-gray-500 text-sm">Opportunities posted by alumni</p>
        </div>
        {user?.role === 'alumni' && user?.isApproved && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Post Job'}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'job', 'internship'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${filter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t === '' ? 'All' : t === 'job' ? 'Jobs' : 'Internships'}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Job Title" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required placeholder="Company" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Job description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="job">Full-time Job</option>
              <option value="internship">Internship</option>
            </select>
            <input value={form.applyLink} onChange={(e) => setForm({ ...form, applyLink: e.target.value })} placeholder="Apply link (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Required skills (comma-separated)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-24" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Briefcase size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No listings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <button
              key={job._id}
              onClick={() => setSelectedJob(job)}
              className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                    <Building2 size={13} /> {job.company}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.type === 'internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {job.type === 'internship' ? 'Internship' : 'Full-time'}
                    </span>
                    {job.skills?.slice(0, 3).map((s) => (
                      <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {job.applyLink && (
                    <span className="text-xs text-blue-600 font-medium">Apply</span>
                  )}
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2 line-clamp-1">{job.description}</p>
              <p className="text-xs text-gray-400 mt-2">Posted by {job.postedBy?.name} · {new Date(job.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      )}

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
