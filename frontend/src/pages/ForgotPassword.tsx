import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckCircle2Icon, Loader2Icon, MailIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../lib/api';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-28">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-lift sm:p-10">

        <Link to="/auth" className="inline-flex items-center gap-1.5 text-xs font-medium text-forest/50 hover:text-forest">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        <h1 className="font-display mt-5 text-2xl font-semibold text-forest">Forgot Password</h1>
        <p className="mt-1.5 text-sm text-forest/55">Enter your email and we'll send you a reset link.</p>

        {sent ?
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-cream p-6 text-center">
            <CheckCircle2Icon className="h-8 w-8 text-emerald" />
            <p className="text-sm text-forest/70">If that email exists, a reset link has been sent. Check your inbox.</p>
          </div> :

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
              <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-forest/15 bg-white py-3 pl-11 pr-4 text-sm text-forest outline-none placeholder:text-forest/35 focus:border-emerald" />

            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

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
    </main>);

}
