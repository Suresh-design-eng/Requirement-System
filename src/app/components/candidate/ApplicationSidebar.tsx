import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { formatExperienceLevel, formatJobType, type ExperienceLevel } from '../../utils/candidate'
import type { Job } from '../../utils/mockData'

interface ApplicationSidebarProps {
  job: Job
  experienceLevel: ExperienceLevel
  selectedSkillsCount: number
  resumeName: string
}

const lifecycleSteps = [
  {
    label: 'Applied',
    summary: 'Your profile lands in the recruiter queue as soon as you submit.',
  },
  {
    label: 'Shortlisted',
    summary: 'Strong matches move into the shortlist for the next hiring round.',
  },
  {
    label: 'Interview',
    summary: 'Shortlisted candidates receive a scheduled interview with mode and timing.',
  },
  {
    label: 'Selected / Rejected',
    summary: 'The final decision appears in your application tracker after the interview stage.',
  },
]

export default function ApplicationSidebar({
  job,
  experienceLevel,
  selectedSkillsCount,
  resumeName,
}: ApplicationSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Application Snapshot
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{job.title}</h3>
        <p className="mt-2 text-sm text-slate-400">
          {job.company} / {job.location} / {formatJobType(job.type)}
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Experience</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {formatExperienceLevel(experienceLevel)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Selected Skills</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {selectedSkillsCount > 0
                ? `${selectedSkillsCount} skill${selectedSkillsCount === 1 ? '' : 's'} added`
                : 'No skills selected yet'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Resume Status</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {resumeName || 'Resume required'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Status Tracking</h3>
            <p className="text-sm text-slate-400">
              The candidate pipeline updates after submission.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {lifecycleSteps.map((step, index) => (
            <div
              key={step.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/12 text-sm font-semibold text-cyan-100">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-white">{step.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{step.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/[0.06] p-3 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Before You Submit</h3>
            <p className="text-sm text-slate-400">
              Quick checks to keep your application strong.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3 text-sm text-slate-300">
          <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            Tailor the resume to the role and make sure the latest work is included.
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            Add a portfolio link when you want recruiters to review projects faster.
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            Drafts stay on this device and are removed after a successful submission.
          </li>
        </ul>
      </section>
    </aside>
  )
}
