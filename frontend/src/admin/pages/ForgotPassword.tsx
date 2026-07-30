import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckCircle2Icon, Loader2Icon, MailIcon } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ApiRequestError } from '../../lib/api';

export function AdminForgotPassword() {
  const { forgotPassword } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest px-4">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald/30 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-lift backdrop-blur-md sm:p-10">

        <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-cream/60 hover:text-white">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        <h1 className="font-display mt-5 text-2xl font-semibold text-white">Forgot Password</h1>
        <p className="mt-1.5 text-sm text-cream/60">Enter your admin email and we'll send you a reset link.</p>

        {sent ?
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 text-center">
            <CheckCircle2Icon className="h-8 w-8 text-emerald-light" />
            <p className="text-sm text-cream/80">If that email exists, a reset link has been sent. Check your inbox.</p>
          </div> :

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

            {error && <p className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">{error}</p>}

            <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">

              {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
          </form>
        }
      </motion.div>
    </div>);

}
