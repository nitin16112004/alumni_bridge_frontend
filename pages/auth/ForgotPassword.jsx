import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import FormField from '../../components/ui/FormField';
import PasswordField from '../../components/ui/PasswordField';
import SubmitButton from '../../components/ui/SubmitButton';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: form.email.trim().toLowerCase() });
      setStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send the reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setError('Passwords do not match');
    if (form.newPassword.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        email: form.email.trim().toLowerCase(),
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setSuccess('Password reset successfully. You can now sign in.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset your password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-600">Account recovery</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Reset your password</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {step === 1 ? 'We’ll send a one-time code to your account email.' : `Enter the code sent to ${form.email}.`}
          </p>
        </header>

        {success ? (
          <div className="space-y-4">
            <Alert variant="success">{success}</Alert>
            <Link to="/login" className="flex h-[52px] items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">Back to sign in</Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-5">
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
            {error && <Alert>{error}</Alert>}
            <SubmitButton loading={loading} loadingLabel="Sending code...">Send reset code</SubmitButton>
            <Link to="/login" className="block text-center text-sm font-semibold text-slate-500 transition hover:text-blue-600">Back to sign in</Link>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            <FormField
              label="One-time code"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              required
              maxLength={6}
              icon={KeyRound}
              inputMode="numeric"
              placeholder="Enter the 6-digit code"
              className="tracking-[0.3em]"
            />
            <PasswordField
              label="New password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
            <PasswordField
              label="Confirm password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
            {error && <Alert>{error}</Alert>}
            <SubmitButton loading={loading} loadingLabel="Resetting password...">Reset password</SubmitButton>
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="block w-full text-center text-sm font-semibold text-slate-500 transition hover:text-blue-600">Use a different email</button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
