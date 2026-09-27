import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, LogIn, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '../../store/auth'
import { toast } from '../../store/ui'

export default function AdminLogin() {
  const { isAdmin, adminSignIn } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAdmin) {
    navigate('/admin/dashboard')
    return null
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = adminSignIn(email, password)
    if (res.ok) {
      toast.success('Welcome, admin', 'Demo console unlocked.')
      navigate('/admin/dashboard')
    } else {
      setError(res.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-plum-900 via-plum-800 to-rose-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-plum-900 shadow-glow">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream">Velvette Admin</h1>
          <p className="mt-1 text-sm text-cream/60">Demo console · no real store data</p>
        </div>

        <form onSubmit={submit} className="mt-8 rounded-3xl bg-white p-7 shadow-lift">
          {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="ad-email">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
                <input id="ad-email" type="email" className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@velvette.shop" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="ad-pw">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
                <input id="ad-pw" type="password" className="input pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary btn-lg mt-6 w-full">
            <LogIn size={17} /> Sign in to console
          </button>
          <button
            type="button"
            onClick={() => { setEmail('admin@velvette.shop'); setPassword('admin123') }}
            className="btn-outline btn-md mt-3 w-full"
          >
            Fill demo credentials
          </button>
          <p className="mt-4 text-center text-xs text-plum-400">
            Demo credentials: <strong>admin@velvette.shop / admin123</strong>
          </p>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-semibold text-gold-light hover:underline">← Back to storefront</Link>
        </p>
      </div>
    </div>
  )
}
