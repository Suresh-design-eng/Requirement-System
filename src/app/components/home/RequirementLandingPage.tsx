import {
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { useApp } from '../../context/AppContext'
import heroBackgroundImage from './assets/landing-hero-background.png'
import LandingPageExtensions from './LandingPageExtensions'

const premiumEase = [0.22, 1, 0.36, 1] as const

export default function RequirementLandingPage() {
  const { currentUser } = useApp()
  const reduceMotion = useReducedMotion()
  const primaryCtaTarget = currentUser ? '/dashboard' : '/login'

  return (
    <div className="relative -mt-20 overflow-hidden bg-[#050816] font-inter text-[#F8FAFC]">
      <section
        id="top"
        className="relative isolate flex min-h-[calc(100vh+5rem)] items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-10 lg:pt-40"
      >
        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { scale: 1.015, opacity: 0.96 }}
          animate={reduceMotion ? undefined : { scale: 1.035, opacity: 1 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroBackgroundImage})`,
            filter: 'brightness(1.16) contrast(1.12) saturate(1.06)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,0.74)_0%,rgba(5,8,22,0.48)_42%,rgba(5,8,22,0.3)_68%,rgba(5,8,22,0.66)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.22)_0%,rgba(5,8,22,0.04)_42%,rgba(5,8,22,0.82)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:84px_84px] opacity-25 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.58),transparent_86%)]" />

        <div
          aria-hidden="true"
          className="animate-landing-aurora pointer-events-none absolute -left-32 top-14 h-80 w-80 rounded-full bg-[#6B21F2]/18 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-landing-aurora-delayed pointer-events-none absolute right-[-7rem] top-24 h-96 w-96 rounded-full bg-[#388BF6]/16 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-20 left-1/4 h-32 w-[52rem] rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.16),rgba(107,33,242,0.14),transparent)] blur-2xl"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.86, ease: premiumEase }}
            className="flex max-w-4xl flex-col items-center"
          >
            <h1 className="max-w-4xl font-sora text-5xl font-semibold leading-[1.03] text-white sm:text-6xl lg:text-7xl">
              Upgrade your{' '}
              <span className="bg-[linear-gradient(135deg,#FFFFFF_0%,#A78BFA_28%,#388BF6_62%,#06B6D4_100%)] bg-clip-text text-transparent">
                hiring experience
              </span>
            </h1>

            <div className="mt-10 flex items-center justify-center">
              <Link
                to={primaryCtaTarget}
                className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full bg-[linear-gradient(135deg,#6B21F2_0%,#388BF6_58%,#06B6D4_100%)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_20px_56px_rgba(56,139,246,0.34),0_0_42px_rgba(107,33,242,0.24)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(56,139,246,0.44),0_0_54px_rgba(107,33,242,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4]"
              >
                <span className="absolute inset-0 bg-white/14 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative">Get Started</span>
                <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingPageExtensions primaryCtaTarget={primaryCtaTarget} />
    </div>
  )
}
