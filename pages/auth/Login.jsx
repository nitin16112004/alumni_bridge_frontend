import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail } from 'lucide-react';
import { login, clearError } from '../../store/slices/authSlice';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import FormField from '../../components/ui/FormField';
import PasswordField from '../../components/ui/PasswordField';
import SubmitButton from '../../components/ui/SubmitButton';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    dispatch(clearError());
    const result = await dispatch(login({ ...form, email: form.email.trim().toLowerCase() }));
    if (login.fulfilled.match(result)) {
      const role = result.payload.role;
      if (role === 'college') navigate('/college/dashboard');
      else if (role === 'alumni') navigate('/alumni/dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Sign in to your community</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Pick up where you left off with the people and opportunities that matter.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
            placeholder="Your password"
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">Forgot password?</Link>
          </div>

          {error && <Alert>{error}</Alert>}
          <SubmitButton loading={loading} loadingLabel="Signing in...">Sign in</SubmitButton>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
