import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon, LockIcon, Loader2Icon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../lib/api';
import { BackButton } from '../components/ui/BackButton';

type Tab = 'login' | 'register';

const inputClass = 'w-full rounded-full border border-forest/15 bg-white py-3 pl-11 pr-4 text-sm text-forest outline-none placeholder:text-forest/35 focus:border-emerald';

export function Auth() {
  const { t } = useTranslation('auth');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');

  const redirectAfterAuth = (role: string) => {
    if (role === 'admin' || role === 'superadmin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(loginEmail, loginPassword);
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t('loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await register({ fullName, email: regEmail, password: regPassword, phone: phone || undefined });
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t('registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-28">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-lift sm:p-10">

        <BackButton className="mb-5" />

        <div className="flex flex-col items-center text-center">
          <img src="/roxaval-icon.png" alt="" className="h-12 w-12 object-contain" />
          <h1 className="font-display mt-4 text-2xl font-semibold text-forest">
            {tab === 'login' ? t('welcomeBack') : t('createAccount')}
          </h1>
          <p className="mt-1.5 text-sm text-forest/55">
            {tab === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="relative mt-7 grid grid-cols-2 rounded-full bg-cream p-1">
          {(['login', 'register'] as Tab[]).map((tabKey) =>
          <button
            key={tabKey}
            type="button"
            onClick={() => {
              setTab(tabKey);
              setError(null);
            }}
            className={`relative z-10 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            tab === tabKey ? 'text-white' : 'text-forest/60 hover:text-forest'}`
            }>

              {tabKey === 'login' ? t('login') : t('register')}
            </button>
          )}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-forest"
            style={{ left: tab === 'login' ? 4 : 'calc(50% + 0px)' }} />

        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ?
          <motion.form
            key="login"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleLogin}
            className="mt-6 space-y-4">

              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder={t('emailPlaceholder')} className={inputClass} />
              </div>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className={`${inputClass} pr-11`} />

                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/35 hover:text-forest">
                  {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link to="/auth/forgot-password" className="text-xs font-medium text-emerald hover:underline">{t('forgotPassword')}</Link>
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

              <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">

                {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {t('signIn')}
              </button>
            </motion.form> :


          <motion.form
            key="register"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleRegister}
            className="mt-6 space-y-4">

              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('fullNamePlaceholder')} className={inputClass} />
              </div>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder={t('emailPlaceholder')} className={inputClass} />
              </div>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} className={inputClass} />
              </div>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder={t('passwordMinPlaceholder')}
                className={`${inputClass} pr-11`} />

                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/35 hover:text-forest">
                  {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                </button>
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

              <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">

                {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {t('createAccountButton')}
              </button>
            </motion.form>
          }
        </AnimatePresence>
      </motion.div>
    </main>);

}
