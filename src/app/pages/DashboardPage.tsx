import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  UserCheck,
  Users2,
} from 'lucide-react'
import CandidateDashboard from '../components/candidate/CandidateDashboard'
import { useApp } from '../context/AppContext'
import { getApplicationStatusMeta } from '../utils/candidate'

export default function DashboardPage() {
  const { applications, currentUser, jobs, users } = useApp()
  const isCandidate = currentUser?.role === 'user'

  const candidateUsers = users.filter(user => user.role === 'user')

  const stats = useMemo(
    () => [
      { label: 'Open Jobs', value: jobs.length, icon: Briefcase },
      { label: 'Registered Candidates', value: candidateUsers.length, icon: Users2 },
      {
        label: 'Interviews Scheduled',
        value: applications.filter(application => application.status === 'interview_scheduled').length,
        icon: CalendarClock,
      },
      {
        label: 'Selected Candidates',
        value: applications.filter(application => application.status === 'accepted').length,
        icon: CheckCircle2,
      },
    ],
    [applications, candidateUsers.length, jobs.length]
  )

  const pipeline = useMemo(
    () => [
      { label: 'Applied', value: applications.filter(item => item.status === 'applied').length },
      {
        label: 'In Review',
        value: applications.filter(item => item.status === 'in_review').length,
      },
      {
        label: 'Shortlisted',
        value: applications.filter(item => item.status === 'shortlisted').length,
      },
      {
        label: 'Interview',
        value: applications.filter(item => item.status === 'interview_scheduled').length,
      },
      {
        label: 'Selected',
        value: applications.filter(item => item.status === 'accepted').length,
      },
      {
        label: 'Rejected',
        value: applications.filter(item => item.status === 'rejected').length,
      },
    ],
    [applications]
  )

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort(
          (left, right) =>
            new Date(right.lastUpdatedAt || right.appliedDate).getTime() -
            new Date(left.lastUpdatedAt || left.appliedDate).getTime()
        )
        .slice(0, 6)
        .map(application => {
          const candidate = users.find(user => user.id === application.userId)
          const job = jobs.find(item => item.id === application.jobId)

          return {
            id: application.id,
            candidateName: application.fullName || candidate?.name || 'Unknown candidate',
            jobTitle: job?.title || 'Unknown role',
            updatedAt: application.lastUpdatedAt || application.appliedDate,
            statusMeta: getApplicationStatusMeta(application.status),
          }
        }),
    [applications, jobs, users]
  )

  const jobsNeedingAttention = useMemo(
    () =>
      jobs
        .map(job => {
          const jobApplications = applications.filter(application => application.jobId === job.id)
          return {
            id: job.id,
            title: job.title,
            deadline: job.deadline,
            applicationsCount: jobApplications.length,
          }
        })
        .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
        .slice(0, 5),
    [applications, jobs]
  )

  if (isCandidate) {
    return <CandidateDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Admin Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-bold lg:text-5xl">Recruitment Overview</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Track the live hiring pipeline, keep job openings current, and move candidates through
            shortlist, interview, and final selection.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Pipeline Snapshot</h2>
                <p className="mt-2 text-muted-foreground">
                  Every candidate should move through the same hiring sequence.
                </p>
              </div>

              <Link
                to="/users"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent/10"
              >
                Open Candidate Pipeline
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pipeline.map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-background px-5 py-4"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <p className="mt-2 text-muted-foreground">
              Use the admin workflow to keep jobs and candidates moving.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/jobs"
                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 font-semibold transition-colors hover:bg-accent/10"
              >
                <span className="inline-flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Manage Job Requirements
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/users"
                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 font-semibold transition-colors hover:bg-accent/10"
              >
                <span className="inline-flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Review Candidates
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 font-semibold transition-colors hover:bg-accent/10"
              >
                <span className="inline-flex items-center gap-3">
                  <Users2 className="h-5 w-5 text-primary" />
                  Update Admin Settings
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <h2 className="text-2xl font-semibold">Recent Candidate Activity</h2>
            <p className="mt-2 text-muted-foreground">
              Latest movement across the active application pipeline.
            </p>

            <div className="mt-6 space-y-4">
              {recentApplications.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.candidateName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.jobTitle}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${item.statusMeta.badgeClassName}`}
                    >
                      {item.statusMeta.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Updated {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}

              {recentApplications.length === 0 && (
                <div className="rounded-2xl border border-border bg-background px-4 py-8 text-center text-muted-foreground">
                  No candidate activity yet.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <h2 className="text-2xl font-semibold">Jobs Needing Attention</h2>
            <p className="mt-2 text-muted-foreground">
              Roles with upcoming deadlines or limited candidate volume.
            </p>

            <div className="mt-6 space-y-4">
              {jobsNeedingAttention.map(job => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-border bg-background px-4 py-4"
                >
                  <p className="font-semibold">{job.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Deadline {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.applicationsCount} application{job.applicationsCount === 1 ? '' : 's'}
                  </p>
                  <Link
                    to={`/users?job=${job.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Review candidates
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}

              {jobsNeedingAttention.length === 0 && (
                <div className="rounded-2xl border border-border bg-background px-4 py-8 text-center text-muted-foreground">
                  No active jobs found.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
