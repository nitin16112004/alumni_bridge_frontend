import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, registerCollege, clearError } from '../../store/slices/authSlice';
import api from '../../services/api';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [colleges, setColleges] = useState([]);
  const [collegeError, setCollegeError] = useState('');
  const [validationError, setValidationError] = useState('');
  const submittingRef = useRef(false);

  const [form, setForm] = useState({
    entityType: 'student',
    name: '',
    email: '',
    password: '',
    collegeId: '',
    graduationYear: '',
    domain: '',
  });

  useEffect(() => {
    api.get('/colleges')
      .then((r) => setColleges(r.data))
      .catch(() => setCollegeError('Colleges could not be loaded. You can still create a college account.'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || submittingRef.current) return;
    dispatch(clearError());
    setValidationError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name) return setValidationError(form.entityType === 'college' ? 'Institution name is required' : 'Full name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setValidationError('Enter a valid email address');
    if (form.password.length < 6) return setValidationError('Password must be at least 6 characters');

    submittingRef.current = true;
    let result;
    try {
      if (form.entityType === 'college') {
        result = await dispatch(registerCollege({
          name,
          email,
          password: form.password,
          domain: form.domain.trim().toLowerCase(),
        }));
        if (registerCollege.fulfilled.match(result)) navigate('/college/dashboard');
      } else {
        result = await dispatch(registerUser({
          name,
          email,
          password: form.password,
          role: form.entityType,
          collegeId: form.collegeId || undefined,
          graduationYear: form.entityType === 'alumni' ? Number(form.graduationYear) : undefined,
        }));
        if (registerUser.fulfilled.match(result)) {
          navigate(form.entityType === 'alumni' ? '/alumni/dashboard' : '/dashboard');
        }
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Alumni Bridge community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <select
              name="entityType"
              value={form.entityType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="college">College / Institution</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.entityType === 'college' ? 'Institution Name' : 'Full Name'}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={form.entityType === 'college' ? 'e.g. IIT Bombay' : 'John Doe'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {form.entityType === 'college' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain (optional)</label>
              <input
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="iitb.ac.in"
              />
            </div>
          )}

          {(form.entityType === 'student' || form.entityType === 'alumni') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <select
                name="collegeId"
                value={form.collegeId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select your college --</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {collegeError && <p className="text-amber-600 text-xs mt-1">{collegeError}</p>}
            </div>
          )}

          {form.entityType === 'alumni' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2020"
              />
            </div>
          )}

          {(validationError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {validationError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
