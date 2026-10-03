import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Flower2 } from 'lucide-react'
import { useAuth } from '../store/auth'
import { toast } from '../store/ui'
import PageTransition from '../components/animations/PageTransition'

type Mode = 'signin' | 'signup' | 'forgot'

export default function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const from = (location.state as { from?: string })?.from

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = 'Enter a valid email address'
    if (mode !== 'forgot' && password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (mode === 'signup') {
      if (name.trim().length < 2) errs.name = 'Tell us your name'
      if (confirm !== password) errs.confirm = 'Passwords do not match'
      if (!terms) errs.terms = 'Please accept the demo terms'
    }
    setErrors(errs)
    if (Object.keys(errs).length) return

    if (mode === 'signin') {
      const res = signIn(email, password)
      if (!res.ok) {
        toast.error('Sign in failed', res.message)
        errs.password = res.message
        setErrors({ ...errs })
        return
      }
      toast.success(res.message)
      navigate(from ?? (res.role === 'admin' ? '/admin/dashboard' : '/account'))
    } else if (mode === 'signup') {
      const res = signUp(name, email, password)
      if (!res.ok) {
        toast.error('Could not create account', res.message)
        setErrors({ email: res.message })
        return
      }
      toast.success(res.message)
      navigate('/account')
    } else {
      setSent(true)
      toast.success('Reset link sent (demo)', 'No email actually goes out in this demo.')
    }
  }

  const titles = {
    signin: { h: 'Welcome back', s: 'Sign in to track orders, sync your wishlist and gift faster.' },
    signup: { h: 'Create your account', s: 'Join MemoriesCatcher — it takes 20 seconds and zero real money.' },
    forgot: { h: 'Forgot password', s: 'Enter your email and we will pretend to send a reset link.' },
  }

  return (
    <PageTransition>
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        {/* left panel */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-600 via-rose-700 to-plum-900 p-10 text-white">
            <Flower2 size={220} className="absolute -bottom-10 -right-10 text-white/10" />
            <p className="eyebrow text-gold-light">MemoriesCatcher Gifting</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
              Every order is a story someone will remember.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              Demo accounts are stored only in this browser. Try <strong>demo@velvette.shop / demo123</strong> —
              or create your own.
            </p>
            <div className="mt-8 space-y-3">
              {['Wishlist that survives refreshes', 'Faster demo checkout', 'Order tracking (demo)'].map((t) => (
                <p key={t} className="flex items-center gap-2.5 text-sm text-white/90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">✓</span> {t}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* form */}
        <div className="mx-auto w-full max-w-md">
          <h1 className="heading-lg text-plum-900">{titles[mode].h}</h1>
          <p className="mt-2 text-sm text-plum-500">{titles[mode].s}</p>

          {sent && mode === 'forgot' ? (
            <div className="card mt-8 p-6 text-center">
              <Mail size={32} className="mx-auto text-mint-deep" />
              <p className="mt-3 font-semibold text-plum-900">Check your inbox (not really)</p>
              <p className="mt-1 text-sm text-plum-500">This demo does not send email. Your password remains <strong>demo123</strong> for the demo account.</p>
              <Link to="/signin" className="btn-primary btn-md mt-5 w-full">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-8" noValidate>
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="auth-name">Full name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
                    <input id="auth-name" className={`input pl-10 ${errors.name ? 'border-rose-400' : ''}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Mehta" />
                  </div>
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
              )}
              <div>
                <label className="label" htmlFor="auth-email">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
                  <input id="auth-email" type="email" className={`input pl-10 ${errors.email ? 'border-rose-400' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              {mode !== 'forgot' && (
                <div>
                  <label className="label" htmlFor="auth-pw">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
                    <input
                      id="auth-pw"
                      type={showPw ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${errors.password ? 'border-rose-400' : ''}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-plum-400 hover:text-plum-700">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="auth-pw2">Confirm password</label>
                  <input id="auth-pw2" type="password" className={`input ${errors.confirm ? 'border-rose-400' : ''}`} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                  {errors.confirm && <p className="field-error">{errors.confirm}</p>}
                  <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-plum-600">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-rose-600" />
                    <span>I agree to the demo <Link to="/terms" className="font-semibold text-rose-600 underline">Terms</Link> and understand this is a frontend-only store.</span>
                  </label>
                  {errors.terms && <p className="field-error">{errors.terms}</p>}
                </div>
              )}
              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-plum-600">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-rose-600" /> Remember me
                  </label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-rose-600 hover:underline">Forgot password?</Link>
                </div>
              )}
              <button type="submit" className="btn-primary btn-lg w-full">
                {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'} <ArrowRight size={16} />
              </button>

              {mode === 'signin' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo@velvette.shop')
                      setPassword('demo123')
                      toast.info('Demo credentials filled', 'Press “Sign in” to continue.')
                    }}
                    className="btn-outline btn-md w-full"
                  >
                    Use demo account
                  </button>
                  <p className="text-center text-sm text-plum-500">
                    New here? <Link to="/signup" className="font-bold text-rose-600 hover:underline">Create an account</Link>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-center text-sm text-plum-500">
                  Already have an account? <Link to="/signin" className="font-bold text-rose-600 hover:underline">Sign in</Link>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
