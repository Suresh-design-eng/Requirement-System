import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import requirementSystemLogo from '../../assets/requirement-system-logo.png'
import {
  ArrowRight,
  Briefcase,
  CheckSquare,
  ChevronDown,
  FileUser,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

type NavigationItem = {
  name: string
  path: string
  icon: LucideIcon
  adminOnly?: boolean
}

const appNavigation: NavigationItem[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const adminNavigation: NavigationItem[] = [
  ...appNavigation,
  { name: 'Candidates', path: '/users', icon: Users, adminOnly: true },
]

const candidateNavigation: NavigationItem[] = [
  ...appNavigation,
  { name: 'Applications', path: '/applications', icon: CheckSquare },
  { name: 'Resume', path: '/resume', icon: FileUser },
]

const publicNavigation: NavigationItem[] = [
  { name: 'Home', path: '/', icon: Home },
]

const guestAuthOptions = [
  {
    label: 'Admin Login',
    to: '/admin-login',
    description: 'Sign in as admin',
    icon: ShieldCheck,
    className: 'text-foreground hover:bg-accent/10',
  },
  {
    label: 'Candidate Login',
    to: '/candidate-login',
    description: 'Sign in as candidate',
    icon: UserRound,
    className: 'text-foreground hover:bg-accent/10',
  },
]

export default function TopNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isDarkMode, logout, toggleDarkMode } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginMenuOpen, setLoginMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [themeTransition, setThemeTransition] = useState<{
    active: boolean
    nextMode: boolean
    scale: number
    x: number
    y: number
  } | null>(null)
  const loginMenuRef = useRef<HTMLDivElement>(null)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const themeToggleRef = useRef<HTMLButtonElement>(null)
  const transitionTimeoutsRef = useRef<number[]>([])

  const navigation = currentUser
    ? currentUser.role === 'admin'
      ? adminNavigation
      : candidateNavigation
    : publicNavigation
  const isHomeLanding = !currentUser && location.pathname === '/'
  const currentRoleLabel =
    currentUser?.role === 'admin' ? 'Admin' : currentUser ? 'Candidate' : ''
  const landingTheme = {
    nav: 'border-white/[0.12] bg-[#050816]/68 shadow-[0_18px_52px_rgba(0,0,0,0.34)]',
    navScrolled:
      'bg-[#050816]/86 shadow-[0_22px_62px_rgba(0,0,0,0.5),0_0_38px_rgba(107,33,242,0.16)]',
    brandIcon:
      'border border-white/[0.12] bg-[linear-gradient(135deg,#6B21F2,#388BF6)] shadow-[0_14px_32px_rgba(56,139,246,0.28)]',
    brandTitle: 'text-white',
    brandSubtitle: 'text-[#A1A1AA]',
    navLink: 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
    ghostLink: 'text-slate-300 hover:text-white',
    toggle:
      'border-white/[0.12] bg-white/[0.06] text-slate-100 shadow-[0_12px_28px_rgba(0,0,0,0.26)] hover:border-[#06B6D4]/45 hover:bg-white/[0.1] hover:shadow-[0_0_28px_rgba(6,182,212,0.16)]',
    mobileTrigger:
      'border-white/[0.12] bg-white/[0.07] text-slate-100 shadow-[0_10px_24px_rgba(0,0,0,0.28)]',
    mobilePanel: 'border-white/[0.12] bg-[#050816]/94 shadow-[0_24px_70px_rgba(0,0,0,0.46)]',
    mobileItem:
      'border-white/[0.12] bg-white/[0.06] text-slate-100 shadow-[0_12px_26px_rgba(0,0,0,0.24)] hover:border-[#06B6D4]/45 hover:bg-white/[0.1] hover:text-white',
  }

  useEffect(() => {
    setMobileMenuOpen(false)
    setLoginMenuOpen(false)
    setSettingsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isHomeLanding || typeof window === 'undefined') {
      setIsScrolled(false)
      return
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomeLanding])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!loginMenuRef.current?.contains(event.target as Node)) {
        setLoginMenuOpen(false)
      }

      if (!settingsMenuRef.current?.contains(event.target as Node)) {
        setSettingsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    return () => {
      transitionTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId))
    }
  }, [])

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const resetSessionAndReturnHome = () => {
    setMobileMenuOpen(false)
    setLoginMenuOpen(false)
    setSettingsMenuOpen(false)
    logout()
    navigate('/', { replace: true })
  }

  const handleSwitchRole = () => {
    resetSessionAndReturnHome()
  }

  const handleLogout = () => {
    resetSessionAndReturnHome()
  }

  const handleAnimatedThemeToggle = () => {
    if (themeTransition) {
      return
    }

    const button = themeToggleRef.current

    if (!button || typeof window === 'undefined') {
      toggleDarkMode()
      return
    }

    transitionTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId))
    transitionTimeoutsRef.current = []

    const rect = button.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const maxHorizontal = Math.max(x, window.innerWidth - x)
    const maxVertical = Math.max(y, window.innerHeight - y)
    const scale = Math.hypot(maxHorizontal, maxVertical) / 18 + 3

    setThemeTransition({
      active: false,
      nextMode: !isDarkMode,
      scale,
      x,
      y,
    })

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setThemeTransition(currentValue =>
          currentValue
            ? {
                ...currentValue,
                active: true,
              }
            : null
        )
      })
    })

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        toggleDarkMode()
      }, 360)
    )

    transitionTimeoutsRef.current.push(
      window.setTimeout(() => {
        setThemeTransition(null)
      }, 980)
    )
  }

  return (
    <>
      <AnimatePresence>
        {themeTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
          >
            <div
              className="absolute inset-0 transition-[opacity,backdrop-filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: themeTransition.active ? 1 : 0,
                backdropFilter: themeTransition.active ? 'blur(18px)' : 'blur(0px)',
                background: themeTransition.nextMode
                  ? 'rgba(11,15,26,0.42)'
                  : 'rgba(248,250,252,0.52)',
              }}
            />
            <div
              className="absolute h-9 w-9 rounded-full will-change-transform transition-[transform,opacity,filter] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: themeTransition.x,
                top: themeTransition.y,
                opacity: themeTransition.active ? 1 : 0.75,
                filter: themeTransition.active ? 'blur(14px)' : 'blur(4px)',
                transform: `translate(-50%, -50%) scale(${
                  themeTransition.active ? themeTransition.scale : 0.35
                })`,
                background: themeTransition.nextMode
                  ? 'radial-gradient(circle, rgba(196,181,253,0.62) 0%, rgba(96,165,250,0.38) 28%, rgba(11,15,26,0.98) 72%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(191,219,254,0.74) 32%, rgba(245,247,251,0.98) 72%)',
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: themeTransition.active ? 1 : 0,
                background: themeTransition.nextMode
                  ? 'radial-gradient(circle at 50% 16%, rgba(139,92,246,0.16), transparent 32%)'
                  : 'radial-gradient(circle at 50% 16%, rgba(96,165,250,0.14), transparent 32%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed z-50 overflow-visible backdrop-blur-2xl transition-all duration-500 ease-out ${
          isHomeLanding
            ? `left-3 right-3 top-3 rounded-[24px] border ${landingTheme.nav} ${
                isScrolled ? landingTheme.navScrolled : ''
              }`
            : 'left-0 right-0 top-0 border-b border-border bg-background/80'
        }`}
      >
        <div
          className={`mx-auto ${
            isHomeLanding ? 'max-w-7xl px-3 sm:px-4' : 'max-w-[1600px] px-4 sm:px-6 lg:px-10'
          }`}
        >
          <div className={`flex items-center gap-3 ${isHomeLanding ? 'h-16 lg:h-[72px]' : 'h-20'}`}>
            <Link
              to="/"
              className="group flex min-w-0 shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4]"
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={requirementSystemLogo}
                alt="Requirement System"
                className="block w-[160px] max-w-[calc(100vw-48px)] object-contain mix-blend-screen sm:w-[195px] lg:w-[220px]"
                style={{
                  height: 'auto',
                  maxWidth: 'calc(100vw - 48px)',
                  objectFit: 'contain',
                }}
              />
            </Link>

            <div className="hidden min-w-0 flex-1 lg:flex">
              <div className="mx-auto flex w-full max-w-full items-center justify-center overflow-x-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {!isHomeLanding && (
                  <div className="flex min-w-max items-center gap-1.5 xl:gap-2">
                    {navigation.map(item => {
                      const Icon = item.icon
                      const isActive = isActivePath(item.path)

                      return (
                        <Link key={item.path} to={item.path} className="shrink-0">
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative rounded-lg px-3 py-2 transition-colors xl:px-3.5 ${
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 whitespace-nowrap xl:gap-2">
                              <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                              <span className="text-xs font-medium xl:text-sm">{item.name}</span>
                            </div>
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 -z-10 rounded-lg bg-primary/10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              {currentUser && (
                <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Role
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {currentRoleLabel}
                  </span>
                </div>
              )}

              {!currentUser &&
                (isHomeLanding ? (
                  <>
                    <Link
                      to="/login"
                      className={`hidden min-h-11 items-center rounded-full px-3 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4] lg:inline-flex ${landingTheme.ghostLink}`}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/login"
                      className="group relative hidden min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#6B21F2_0%,#388BF6_62%,#06B6D4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(56,139,246,0.3),0_0_28px_rgba(107,33,242,0.2)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(56,139,246,0.4),0_0_36px_rgba(107,33,242,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4] lg:inline-flex"
                    >
                      <span className="absolute inset-0 bg-white/14 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="relative">Get Started</span>
                      <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </>
                ) : (
                  <div ref={loginMenuRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSettingsMenuOpen(false)
                        setLoginMenuOpen(previousValue => !previousValue)
                      }}
                      className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-accent/10"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${loginMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {loginMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/10"
                        >
                          {guestAuthOptions.map(option => {
                            const Icon = option.icon

                            return (
                              <Link
                                key={option.label}
                                to={option.to}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors ${option.className}`}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold">{option.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

              {currentUser && (
                <div ref={settingsMenuRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setLoginMenuOpen(false)
                      setSettingsMenuOpen(previousValue => !previousValue)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-accent/10"
                  >
                    <Settings className="w-4 h-4 text-primary" />
                    <span>Settings</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${settingsMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {settingsMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/10"
                      >
                        <div className="border-b border-border px-4 py-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Current Role
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {currentRoleLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSwitchRole}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-foreground transition-colors hover:bg-accent/10"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <RefreshCcw className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Switch Role</p>
                            <p className="text-xs text-muted-foreground">Go to Home and sign in again</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                            <LogOut className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Logout</p>
                            <p className="text-xs text-muted-foreground">Return to Home</p>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <motion.button
                ref={themeToggleRef}
                whileHover={themeTransition ? undefined : { scale: 1.04 }}
                whileTap={themeTransition ? undefined : { scale: 0.94 }}
                type="button"
                disabled={Boolean(themeTransition)}
                onClick={handleAnimatedThemeToggle}
                className={`rounded-xl border p-2.5 transition-[background-color,border-color,box-shadow,color] duration-500 ease-in-out ${
                  isHomeLanding
                    ? landingTheme.toggle
                    : 'border-border bg-card text-foreground hover:bg-accent/10'
                } ${themeTransition ? 'cursor-default opacity-90' : ''}`}
              >
                <span className="sr-only">Toggle dark mode</span>
                {isDarkMode ? (
                  <Sun
                    className={`h-5 w-5 transition-transform duration-500 ${
                      isHomeLanding ? 'text-amber-300' : 'text-secondary'
                    }`}
                  />
                ) : (
                  <Moon
                    className={`h-5 w-5 transition-transform duration-500 ${
                      isHomeLanding ? 'text-[#6366F1]' : 'text-primary'
                    }`}
                  />
                )}
              </motion.button>

              {!isHomeLanding && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(previousValue => !previousValue)}
                  className="rounded-lg border p-2.5 lg:hidden border-border bg-card"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed z-40 backdrop-blur-2xl lg:hidden ${
          isHomeLanding
            ? `left-3 right-3 top-[5.25rem] rounded-[20px] border ${landingTheme.mobilePanel}`
            : 'left-0 right-0 top-20 border-b border-border bg-background/95'
        }`}
      >
          <div className="max-w-[1600px] mx-auto space-y-2 px-6 py-4">
            {!isHomeLanding && navigation.map(item => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.path)

                  return (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  )
                })}

            <div
              className={`mt-4 space-y-2 border-t pt-4 ${
                isHomeLanding ? 'border-white/10' : 'border-border'
              }`}
            >
              {isHomeLanding ? (
                <div className="grid gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center rounded-[14px] border border-white/[0.12] bg-white/[0.06] px-4 py-3 font-semibold text-slate-100 transition-colors hover:bg-white/[0.1]"
                    >
                      Sign in
                    </motion.div>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#6B21F2_0%,#388BF6_62%,#06B6D4_100%)] px-4 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(56,139,246,0.3)]"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </div>
              ) : currentUser ? (
                <>
                  <div className="rounded-lg border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Current Role
                    </p>
                    <p className="mt-1 text-sm font-semibold">{currentRoleLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchRole}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent/10"
                  >
                    <RefreshCcw className="w-5 h-5 text-primary" />
                    <span className="font-medium">Switch Role</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                guestAuthOptions.map(option => {
                  const Icon = option.icon

                  return (
                    <Link
                      key={option.label}
                      to={option.to}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/10"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
