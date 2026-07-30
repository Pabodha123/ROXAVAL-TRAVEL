import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ApiRequestError } from '../../lib/api';

const ADMIN_ROLES = ['admin', 'superadmin'];

export function AdminLogin() {
  const { login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      if (!ADMIN_ROLES.includes(loggedInUser.role)) {
        await logout();
        throw new ApiRequestError('This account does not have admin access.', 403);
      }
      const from = (location.state as { from?: Location })?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest px-4">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-lift backdrop-blur-md sm:p-10">

        <div className="flex flex-col items-center text-center">
          <img src="/roxaval-icon.png" alt="" className="h-14 w-14 object-contain" />
          <h1 className="font-display mt-4 text-2xl font-semibold text-white">Admin Sign In</h1>
          <p className="mt-1.5 text-sm text-cream/60">Roxaval Travels management console</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/50">Email</label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-cream/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@roxavaltravels.com"
                className="w-full rounded-full border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-cream/30 focus:border-gold" />

            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cream/50">Password</label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-cream/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-full border border-white/15 bg-white/10 py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-cream/30 focus:border-gold" />

              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-white">
                {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/admin/forgot-password" className="text-xs font-medium text-gold-light hover:underline">Forgot password?</Link>
          </div>

          {error &&
          <p className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">{error}</p>
          }

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">

            {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </motion.div>
    </div>);

}
