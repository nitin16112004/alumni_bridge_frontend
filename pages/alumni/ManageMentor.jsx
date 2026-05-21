import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ManageMentor() {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    expertise: '',
    company: '',
    role: '',
    yearsOfExperience: '',
    bio: '',
    availability: true,
  });

  useEffect(() => {
    api.get('/mentors/me')
      .then((r) => {
        setMentor(r.data);
        setForm({ ...r.data, expertise: r.data.expertise?.join(', ') || '' });
      })
      .catch((err) => {
        // 404 = no profile yet (expected), anything else is a real error
        if (err.response?.status !== 404) {
          console.error('Failed to load mentor profile:', err.response?.data?.message || err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const payload = {
        ...form,
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: Number(form.yearsOfExperience),
      };
      if (mentor) {
        await api.put(`/mentors/${mentor._id}`, payload);
        setSuccess('Mentor profile updated!');
      } else {
        const { data } = await api.post('/mentors', payload);
        setMentor(data);
        setSuccess('Mentor profile created!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{mentor ? 'Edit Mentor Profile' : 'Create Mentor Profile'}</h1>
      <p className="text-gray-500 text-sm mb-6">Students from your college will discover you based on this profile.</p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">{success}</div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
            <input name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Software Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Google" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expertise (comma-separated)</label>
          <input name="expertise" value={form.expertise} onChange={handleChange} placeholder="Machine Learning, System Design, Web Dev" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell students about your background and how you can help..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="availability" name="availability" checked={form.availability} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
          <label htmlFor="availability" className="text-sm text-gray-700">Available for new mentorship requests</label>
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : mentor ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
