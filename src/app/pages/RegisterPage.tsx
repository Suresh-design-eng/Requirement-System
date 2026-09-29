import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { authMode, register } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await register({
      name,
      email,
      password,
    })

    if (!result.success) {
      setErrorMessage(result.message)
      setIsSubmitting(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background via-background to-card/20">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 lg:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Register
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Create your RequirementSys account
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Set up your account to apply for jobs, manage your profile, and access the
              dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="block text-sm font-medium mb-2">Full name</span>
                <div className="relative">
                  <UserRound className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </label>

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
                    placeholder="Use at least 8 characters"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-2">Confirm password</span>
                <div className="relative">
                  <LockKeyhole className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
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
                {isSubmitting ? 'Creating account...' : 'Create Account'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Before you continue</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {authMode === 'remote'
                  ? 'Registration requests will be sent to the configured backend API, so make sure the auth server is running and CORS is enabled for your frontend origin.'
                  : 'This build uses local browser storage when no backend auth URL is configured, so the app remains fully runnable without a separate API service.'}
              </p>
              <p>
                After registering, you will be signed in automatically and redirected to the
                dashboard.
              </p>
              <p>
                You can upload your resume later from the profile area after account creation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
