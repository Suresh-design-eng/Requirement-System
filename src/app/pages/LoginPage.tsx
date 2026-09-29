import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { demoCredentials } from '../services/auth'

export type LoginType = 'admin' | 'candidate'

interface LoginPageProps {
  defaultLoginType?: LoginType
}

function getRedirectTarget(state: unknown) {
  if (
    state &&
    typeof state === 'object' &&
    'from' in state &&
    typeof (state as { from?: unknown }).from === 'string'
  ) {
    return (state as { from: string }).from
  }

  return '/dashboard'
}

function getLoginType(state: unknown): LoginType | null {
  if (
    state &&
    typeof state === 'object' &&
    'loginType' in state &&
    (((state as { loginType?: unknown }).loginType === 'admin') ||
      (state as { loginType?: unknown }).loginType === 'candidate')
  ) {
    return (state as { loginType: LoginType }).loginType
  }

  return null
}

export default function LoginPage({ defaultLoginType }: LoginPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { authMode, login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectTarget = getRedirectTarget(location.state)
  const loginType = defaultLoginType ?? getLoginType(location.state)
  const selectedDemoAccount =
    loginType === 'admin' ? demoCredentials[0] : loginType === 'candidate' ? demoCredentials[1] : null
  const loginLabel =
    loginType === 'admin' ? 'Admin Login' : loginType === 'candidate' ? 'Candidate Login' : 'Sign In'
  const loginHeadline =
    loginType === 'admin'
      ? 'Admin access to RequirementSys'
      : loginType === 'candidate'
        ? 'Candidate access to RequirementSys'
        : 'Welcome back to RequirementSys'
  const loginDescription =
    loginType === 'admin'
      ? 'Sign in to manage requirements, review applications, and keep your hiring workflow moving.'
      : loginType === 'candidate'
        ? 'Sign in to explore jobs, track applications, and manage your candidate profile.'
        : 'Sign in to manage requirements, track applications, and keep your hiring workflow moving.'

  useEffect(() => {
    if (authMode !== 'local' || !selectedDemoAccount) {
      return
    }

    setEmail(selectedDemoAccount.email)
    setPassword(selectedDemoAccount.password)
  }, [authMode, selectedDemoAccount])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const result = await login(email, password)

    if (!result.success) {
      setErrorMessage(result.message)
      setIsSubmitting(false)
      return
    }

    navigate(redirectTarget, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background via-background to-card/20">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 lg:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              {loginLabel}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {loginHeadline}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {loginDescription}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="block text-sm font-medium mb-2">Email address</span>
                <div className="relative">
                  <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2">Password</span>
                <div className="relative">
                  <LockKeyhole className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </label>

              {errorMessage && (
                <div className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-sm text-muted-foreground mt-6">
              Use the login option that matches your role to continue to the dashboard.
            </p>
            {loginType !== 'admin' && (
              <p className="mt-3 text-sm text-muted-foreground">
                New candidate?{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Authentication Mode</h2>
              <p className="text-muted-foreground leading-relaxed">
                {authMode === 'remote'
                  ? 'Remote API mode is active. Login requests will be sent to the configured backend endpoint.'
                  : 'Local mode is active. Authentication is stored in browser storage so the project works out of the box without a backend.'}
              </p>
            </div>

            {authMode === 'local' && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h2 className="text-2xl font-semibold mb-4">Demo Accounts</h2>
                <div className="space-y-4">
                  {demoCredentials.map(account => (
                    <div
                      key={account.email}
                      className="p-4 rounded-2xl bg-muted/40 border border-border"
                    >
                      <p className="text-sm font-semibold text-primary mb-2">{account.role}</p>
                      <p className="text-sm text-muted-foreground">Email: {account.email}</p>
                      <p className="text-sm text-muted-foreground">Password: {account.password}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
