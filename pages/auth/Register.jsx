import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Globe2, Mail, School, UserRound } from 'lucide-react';
import { registerUser, registerCollege, clearError } from '../../store/slices/authSlice';
import api from '../../services/api';
import AuthLayout from '../../components/auth/AuthLayout';
import RoleSelector from '../../components/auth/RoleSelector';
import Alert from '../../components/ui/Alert';
import FormField from '../../components/ui/FormField';
import PasswordField from '../../components/ui/PasswordField';
import SelectField from '../../components/ui/SelectField';
import SubmitButton from '../../components/ui/SubmitButton';

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

  const selectRole = (entityType) => {
    setForm({ ...form, entityType });
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
    <AuthLayout>
      <div className="space-y-7">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-600">Welcome to Alumni Bridge</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Create your account</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Choose the path that fits you and start building meaningful connections.</p>
        </header>

        <RoleSelector value={form.entityType} onChange={selectRole} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={form.entityType === 'college' ? 'Institution name' : 'Full name'}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              icon={UserRound}
              autoComplete="name"
              placeholder={form.entityType === 'college' ? 'e.g. IIT Bombay' : 'Your full name'}
            />
            <FormField
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <PasswordField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />

            {form.entityType === 'college' ? (
              <FormField
                label="Institution domain"
                name="domain"
                value={form.domain}
                onChange={handleChange}
                icon={Globe2}
                autoComplete="url"
                placeholder="yourcollege.edu"
                hint="Optional — helps verify your community."
              />
            ) : (
              <SelectField label="College" name="collegeId" value={form.collegeId} onChange={handleChange} icon={School} autoComplete="organization">
                <option value="">Select your college</option>
                {colleges.map((college) => <option key={college._id} value={college._id}>{college.name}</option>)}
              </SelectField>
            )}

            {form.entityType === 'alumni' && (
              <FormField
                label="Graduation year"
                type="number"
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
                min="1950"
                max={new Date().getFullYear()}
                icon={CalendarDays}
                inputMode="numeric"
                placeholder="2020"
              />
            )}
          </div>

          {collegeError && form.entityType !== 'college' && <p className="text-xs text-amber-700">{collegeError}</p>}
          {(validationError || error) && <Alert>{validationError || error}</Alert>}

          <SubmitButton loading={loading} loadingLabel="Creating account...">Create account</SubmitButton>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
