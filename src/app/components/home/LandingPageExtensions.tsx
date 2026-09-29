import {
  ArrowRight,
  Blocks,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { ImageWithFallback } from '../figma/ImageWithFallback'

interface LandingPageExtensionsProps {
  primaryCtaTarget: string
}

const premiumEase = [0.22, 1, 0.36, 1] as const
const revealViewport = { once: true, amount: 0.22 }

const valueCards = [
  {
    icon: LayoutGrid,
    title: 'Structured Planning',
    text: 'Turn complex requirements into clear, actionable workflows that teams can follow with confidence.',
  },
  {
    icon: Users,
    title: 'Seamless Collaboration',
    text: 'Create a connected environment where every stakeholder stays aligned throughout the project lifecycle.',
  },
  {
    icon: CheckCircle2,
    title: 'Confident Delivery',
    text: 'Reduce delays and improve outcomes with a platform built for precision and control.',
  },
] as const

const workflowSteps = [
  {
    title: 'Requirement',
    text: 'Capture the hiring need with a structured brief and shared context.',
  },
  {
    title: 'Job',
    text: 'Translate approved requirements into clear, candidate-ready openings.',
  },
  {
    title: 'Candidate',
    text: 'Centralize profiles, resumes, skills, and application history.',
  },
  {
    title: 'Screening',
    text: 'Move qualified applicants through consistent review checkpoints.',
  },
  {
    title: 'Interview',
    text: 'Coordinate next steps with status, timing, and mode in one place.',
  },
  {
    title: 'Decision',
    text: 'Keep final selection, rejection, and pipeline movement visible.',
  },
] as const

const trustItems = [
  {
    icon: LockKeyhole,
    label: 'Secure Workflow',
  },
  {
    icon: Blocks,
    label: 'Scalable Architecture',
  },
  {
    icon: Building2,
    label: 'Enterprise Ready',
  },
  {
    icon: MonitorSmartphone,
    label: 'Modern Experience',
  },
] as const

const aboutImageSrc =
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80'
const visualImageSrc =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80'

const eyebrowClass =
  'inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.055] px-4 py-2 text-sm font-semibold uppercase text-cyan-100 shadow-[0_0_28px_rgba(6,182,212,0.1)] backdrop-blur-2xl'
const headingClass =
  'font-sora text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl'
const bodyClass = 'text-base leading-8 text-[#A1A1AA] sm:text-lg sm:leading-9'

function fadeUp(delay = 0) {
  return {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.82,
      delay,
      ease: premiumEase,
    },
  }
}

export default function LandingPageExtensions({
  primaryCtaTarget,
}: LandingPageExtensionsProps) {
  const reduceMotion = useReducedMotion()
  const aboutImageRef = useRef<HTMLDivElement | null>(null)
  const visualImageRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress: aboutImageProgress } = useScroll({
    target: aboutImageRef,
    offset: ['start end', 'end start'],
  })
  const aboutImageScale = useTransform(
    aboutImageProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0.98, 1.06]
  )

  const { scrollYProgress: visualImageProgress } = useScroll({
    target: visualImageRef,
    offset: ['start end', 'end start'],
  })
  const visualImageY = useTransform(
    visualImageProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-28, 28]
  )
  const visualImageScale = useTransform(
    visualImageProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1.03, 1.1]
  )

  return (
    <div className="relative isolate overflow-hidden bg-[#050816] font-inter text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(107,33,242,0.18),transparent_28%),radial-gradient(circle_at_88%_24%,rgba(56,139,246,0.16),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(6,182,212,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-45 [mask-image:linear-gradient(to_bottom,transparent,rgba(255,255,255,0.72)_14%,rgba(255,255,255,0.66)_78%,transparent)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-24 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <motion.section
          id="platform"
          initial={{ opacity: 0, y: 38 }}
          whileInView={fadeUp()}
          viewport={revealViewport}
          className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16"
        >
          <div ref={aboutImageRef} className="group relative order-2 lg:order-1">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(56,139,246,0.2),transparent_68%)] blur-3xl"
            />
            <motion.div
              style={{ scale: aboutImageScale }}
              className="relative overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#0A1020]/70 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            >
              <div className="overflow-hidden rounded-[12px]">
                <ImageWithFallback
                  src={aboutImageSrc}
                  alt="Hiring team discussing project requirements around a conference table"
                  className="aspect-[5/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-2 rounded-[12px] bg-[linear-gradient(180deg,rgba(5,8,22,0.04),rgba(5,8,22,0.58))]" />
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <div className={eyebrowClass}>
              <Sparkles className="h-4 w-4 text-[#06B6D4]" />
              About
            </div>

            <h2 className={`${headingClass} mt-6 max-w-2xl`}>
              Built for Smarter Requirement Management
            </h2>

            <p className={`${bodyClass} mt-6 max-w-2xl`}>
              Our platform helps teams manage requirements with greater clarity, stronger
              collaboration, and a refined digital experience designed for modern organizations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#features"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06B6D4]/45 hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4]"
              >
                Explore platform value
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </motion.section>

        <section id="features" className="scroll-mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={fadeUp()}
            viewport={revealViewport}
            className="mx-auto mb-10 max-w-3xl text-center"
          >
            <div className={`${eyebrowClass} mx-auto`}>
              <ClipboardList className="h-4 w-4 text-[#06B6D4]" />
              Platform Value
            </div>
            <h2 className={`${headingClass} mt-6`}>
              Premium workflow support for modern requirement teams
            </h2>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            {valueCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={fadeUp(index * 0.1)}
                  whileHover={reduceMotion ? undefined : { y: -7 }}
                  viewport={revealViewport}
                  className="group relative overflow-hidden rounded-[8px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] p-7 shadow-[0_22px_58px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition-[border-color,box-shadow,background] duration-500 hover:border-[#06B6D4]/45 hover:bg-[linear-gradient(180deg,rgba(107,33,242,0.14),rgba(56,139,246,0.065))] hover:shadow-[0_0_32px_rgba(6,182,212,0.18),0_28px_74px_rgba(0,0,0,0.38)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_36%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[8px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(107,33,242,0.45),rgba(56,139,246,0.18))] text-cyan-100 shadow-[0_0_26px_rgba(107,33,242,0.18)] transition-all duration-500 group-hover:text-white group-hover:shadow-[0_0_34px_rgba(6,182,212,0.34)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-sora text-2xl font-semibold leading-tight text-white">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-[#A1A1AA]">{card.text}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <motion.section
          id="workflow"
          initial={{ opacity: 0, y: 36 }}
          whileInView={fadeUp()}
          viewport={revealViewport}
          className="scroll-mt-32"
        >
          <div className="grid items-end gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className={eyebrowClass}>
                <Briefcase className="h-4 w-4 text-[#06B6D4]" />
                Workflow
              </div>
              <h2 className={`${headingClass} mt-6 max-w-2xl`}>
                A clear path from requirement to final decision
              </h2>
            </div>
            <p className={`${bodyClass} max-w-3xl lg:ml-auto`}>
              The experience follows the product workflow already in the app: Requirement, Job,
              Candidate, Application, Screening, Shortlist, Interview, Decision, and Analytics.
            </p>
          </div>

          <div className="relative mt-12">
            <div className="absolute bottom-0 left-6 top-0 w-px bg-[linear-gradient(180deg,transparent,rgba(6,182,212,0.42),rgba(107,33,242,0.36),transparent)] lg:left-0 lg:right-0 lg:top-6 lg:h-px lg:w-auto" />
            <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              {workflowSteps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={fadeUp(index * 0.08)}
                  viewport={revealViewport}
                  className="relative rounded-[8px] border border-white/[0.12] bg-[#0A1020]/68 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-[#6B21F2]/50 hover:shadow-[0_0_34px_rgba(107,33,242,0.2),0_24px_60px_rgba(0,0,0,0.34)]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.14] bg-[linear-gradient(135deg,#6B21F2,#388BF6)] text-sm font-semibold text-white shadow-[0_0_28px_rgba(107,33,242,0.28)]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-sora text-lg font-semibold leading-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#A1A1AA]">{step.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 38 }}
          whileInView={fadeUp(0.05)}
          viewport={revealViewport}
          className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16"
        >
          <div>
            <div className={eyebrowClass}>
              <ShieldCheck className="h-4 w-4 text-[#06B6D4]" />
              Hiring Intelligence
            </div>
            <h2 className={`${headingClass} mt-6 max-w-2xl`}>
              See every moving part with sharper focus
            </h2>
            <p className={`${bodyClass} mt-6 max-w-2xl`}>
              Create roles, review applications, manage candidate profiles, and move every hiring
              conversation forward without losing the original requirement context.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                'Admin and candidate routes stay connected',
                'Applications carry profile and resume context',
                'Pipeline movement remains visible across the workflow',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#06B6D4]/12 text-[#06B6D4]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div ref={visualImageRef} className="group relative">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(107,33,242,0.2),transparent_68%)] blur-3xl"
            />
            <div className="relative h-[360px] overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#0A1020]/70 p-2 shadow-[0_28px_78px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:h-[460px] lg:h-[560px]">
              <motion.div
                style={{
                  y: visualImageY,
                  scale: visualImageScale,
                }}
                className="h-full overflow-hidden rounded-[12px]"
              >
                <ImageWithFallback
                  src={visualImageSrc}
                  alt="Modern team collaborating around a digital hiring workflow"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </motion.div>
              <div className="absolute inset-2 rounded-[12px] bg-[linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.62))]" />
            </div>
          </div>
        </motion.section>

        <motion.section
          id="vision"
          initial={{ opacity: 0, y: 32 }}
          whileInView={fadeUp()}
          viewport={revealViewport}
          className="relative scroll-mt-32 overflow-hidden rounded-[18px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] px-6 py-16 text-center shadow-[0_28px_78px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:px-10 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-x-1/4 top-1/2 h-40 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(6,182,212,0.2),rgba(107,33,242,0.16),rgba(56,139,246,0.2))] blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className={`${eyebrowClass} mx-auto`}>
              <Sparkles className="h-4 w-4 text-[#06B6D4]" />
              Vision
            </div>
            <h2 className={`${headingClass} mt-6`}>Our Vision</h2>
            <p className={`${bodyClass} mx-auto mt-6 max-w-3xl`}>
              To redefine requirement management through elegant technology that helps
              organizations work smarter and deliver with greater certainty.
            </p>
          </div>
        </motion.section>

        <section id="trust" className="scroll-mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={fadeUp()}
            viewport={revealViewport}
            className="mx-auto mb-8 max-w-2xl text-center"
          >
            <div className={`${eyebrowClass} mx-auto`}>
              <ShieldCheck className="h-4 w-4 text-[#06B6D4]" />
              Trusted Foundations
            </div>
            <h2 className={`${headingClass} mt-6`}>
              Built to support serious teams at scale
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={fadeUp(0.08)}
            viewport={revealViewport}
            className="grid gap-4 rounded-[18px] border border-white/[0.12] bg-white/[0.055] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:grid-cols-2 xl:grid-cols-4"
          >
            {trustItems.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={fadeUp(index * 0.08)}
                  viewport={revealViewport}
                  className="flex items-center gap-4 rounded-[8px] border border-white/[0.08] bg-[#0A1020]/48 px-5 py-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,rgba(56,139,246,0.28),rgba(6,182,212,0.12))] text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-base font-semibold text-white">{item.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        <motion.section
          id="cta"
          initial={{ opacity: 0, y: 34 }}
          whileInView={fadeUp(0.08)}
          viewport={revealViewport}
          className="relative scroll-mt-32 overflow-hidden rounded-[20px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(107,33,242,0.22),rgba(56,139,246,0.13),rgba(255,255,255,0.045))] px-6 py-16 text-center shadow-[0_32px_92px_rgba(0,0,0,0.42),0_0_76px_rgba(56,139,246,0.14)] backdrop-blur-2xl sm:px-10 sm:py-20"
        >
          <div className="animate-landing-aurora pointer-events-none absolute -left-20 top-6 h-64 w-64 rounded-full bg-[#6B21F2]/28 blur-3xl" />
          <div className="animate-landing-aurora-delayed pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#06B6D4]/18 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="font-sora text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to improve your hiring workflow?
            </h2>
            <p className={`${bodyClass} mx-auto mt-5 max-w-2xl`}>
              Bring requirement planning, job management, applications, and candidate decisions
              into one focused product experience.
            </p>

            <div className="mt-9 flex justify-center">
              <Link
                to={primaryCtaTarget}
                className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full bg-[linear-gradient(135deg,#6B21F2_0%,#388BF6_58%,#06B6D4_100%)] px-8 py-4 text-base font-semibold text-white shadow-[0_22px_64px_rgba(56,139,246,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(6,182,212,0.34),0_24px_70px_rgba(56,139,246,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#06B6D4]"
              >
                <span className="absolute inset-0 bg-white/14 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative">Get Started Now</span>
                <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.section>

        <footer className="border-t border-white/[0.12] py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="group flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,#6B21F2,#388BF6)] text-white shadow-[0_16px_38px_rgba(56,139,246,0.24)]">
                <ClipboardList className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-sora text-lg font-semibold text-white">
                  Requirement System
                </span>
                <span className="block text-sm text-[#A1A1AA]">
                  Recruitment and hiring management
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#A1A1AA]">
              <a className="transition-colors duration-300 hover:text-white" href="#platform">
                Platform
              </a>
              <a className="transition-colors duration-300 hover:text-white" href="#workflow">
                Workflow
              </a>
              <a className="transition-colors duration-300 hover:text-white" href="#trust">
                Trust
              </a>
              <Link className="transition-colors duration-300 hover:text-white" to="/login">
                Login
              </Link>
              <Link className="transition-colors duration-300 hover:text-white" to="/register">
                Register
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
