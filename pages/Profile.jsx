import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { updateUser } from '../store/slices/authSlice';
import { User, Save, CheckCircle, GraduationCap, Building2 } from 'lucide-react';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    currentCompany: user?.currentCompany || '',
    currentRole: user?.currentRole || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await api.put('/users/profile', {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      dispatch(updateUser(data));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {user?.name?.[0] || <User size={32} />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize">{user?.role}</span>
              {user?.isApproved && (
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
              {user?.currentRole && (
                <span className="text-xs text-gray-500 flex items-center gap-1"><Building2 size={11} /> {user.currentRole}</span>
              )}
              {user?.graduationYear && (
                <span className="text-xs text-gray-500 flex items-center gap-1"><GraduationCap size={11} /> Class of {user.graduationYear}</span>
              )}
            </div>
          </div>
        </div>
        {user?.bio && (
          <p className="text-gray-600 text-sm mt-4 border-t border-gray-100 pt-4">{user.bio}</p>
        )}
        {user?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.skills.map((s) => (
              <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">Edit Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell the community about yourself..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
        {user?.role === 'alumni' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
              <input name="currentRole" value={form.currentRole} onChange={handleChange} placeholder="Software Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
              <input name="currentCompany" value={form.currentCompany} onChange={handleChange} placeholder="Google" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="JavaScript, React, Python" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
