import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon, LockIcon, Loader2Icon, MailIcon, PhoneIcon, UserIcon, CakeIcon, IdCardIcon, ChevronDownIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../lib/api';
import { BackButton } from '../components/ui/BackButton';
import { COUNTRY_DIAL_CODES, isoToFlag } from '../data/countryCodes';

type Tab = 'login' | 'register';

const inputClass = 'w-full rounded-full border border-forest/15 bg-white py-3 pl-11 pr-4 text-sm text-forest outline-none placeholder:text-forest/35 focus:border-emerald';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9\s\-()]{6,20}$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]{5,15}$/;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function calculateAge(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+94');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  const redirectAfterAuth = (role: string) => {
    if (role === 'admin' || role === 'superadmin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const validateLogin = (): string | null => {
    if (!loginEmail.trim()) return t('validation.emailRequired');
    if (!EMAIL_REGEX.test(loginEmail.trim())) return t('validation.emailInvalid');
    if (!loginPassword) return t('validation.passwordRequired');
    return null;
  };

  const validateRegister = (): string | null => {
    if (!fullName.trim()) return t('validation.fullNameRequired');
    if (fullName.trim().length < 2) return t('validation.fullNameTooShort');
    if (!regEmail.trim()) return t('validation.emailRequired');
    if (!EMAIL_REGEX.test(regEmail.trim())) return t('validation.emailInvalid');
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) return t('validation.phoneInvalid');
    if (dateOfBirth) {
      if (new Date(dateOfBirth) > new Date()) return t('validation.dobFuture');
      if (calculateAge(dateOfBirth) < 18) return t('validation.dobMinAge');
    }
    if (passportNumber.trim() && !PASSPORT_REGEX.test(passportNumber.trim())) return t('validation.passportInvalid');
    if (!regPassword) return t('validation.passwordRequired');
    if (!PASSWORD_STRENGTH_REGEX.test(regPassword)) return t('validation.passwordWeak');
    if (regPassword !== confirmPassword) return t('validation.passwordsDontMatch');
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t('loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateRegister();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: phone.trim() ? `${dialCode} ${phone.trim()}` : undefined,
        dateOfBirth: dateOfBirth || undefined,
        passportNumber: passportNumber.trim() || undefined,
      });
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
              <div className="flex items-center gap-2 rounded-full border border-forest/15 bg-white pl-1.5 pr-4 focus-within:border-emerald">
                <div className="relative shrink-0">
                  <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label={t('countryCodeLabel')}
                  className="appearance-none rounded-full bg-transparent py-3 pl-3 pr-6 text-sm text-forest outline-none">

                    {COUNTRY_DIAL_CODES.map((c) =>
                    <option key={c.iso2} value={c.dial}>{isoToFlag(c.iso2)} {c.dial}</option>
                    )}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest/30" />
                </div>
                <div className="h-5 w-px shrink-0 bg-forest/10" />
                <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-forest/35" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} className="w-full bg-transparent py-3 text-sm text-forest outline-none placeholder:text-forest/35" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CakeIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} placeholder={t('dateOfBirthPlaceholder')} className={`${inputClass} text-forest/80`} />
                </div>
                <div className="relative">
                  <IdCardIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                  <input type="text" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} placeholder={t('passportNumberPlaceholder')} className={inputClass} />
                </div>
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
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/35" />
                <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                className={inputClass} />

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
