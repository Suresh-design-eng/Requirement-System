import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { ArrowRight, Briefcase, Calendar, FileText, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getApplicationStatusMeta } from '../../utils/candidate'
import type { Application } from '../../utils/mockData'

type ApplicationFilter = 'all' | 'active' | 'rejected'

export default function MyApplications() {
  const { applications, jobs, currentUser } = useApp()
  const [filter, setFilter] = useState<ApplicationFilter>('all')

  const candidateApplications = useMemo(
    () =>
      applications
        .filter(application => application.userId === currentUser?.id)
        .sort(
          (left, right) =>
            new Date(right.lastUpdatedAt || right.appliedDate).getTime() -
            new Date(left.lastUpdatedAt || left.appliedDate).getTime()
        ),
    [applications, currentUser?.id]
  )

  const filteredApplications = candidateApplications.filter(application => {
    if (filter === 'all') {
      return true
    }

    if (filter === 'rejected') {
      return application.status === 'rejected'
    }

    return application.status !== 'rejected'
  })

  const getJob = (jobId: string) => jobs.find(job => job.id === jobId)

  const statusCounts = {
    all: candidateApplications.length,
    active: candidateApplications.filter(application => application.status !== 'rejected').length,
    rejected: candidateApplications.filter(application => application.status === 'rejected').length,
  }

  const filterButtons: Array<{ key: ApplicationFilter; label: string; count: number }> = [
    { key: 'all', label: 'All Applications', count: statusCounts.all },
    { key: 'active', label: 'Active', count: statusCounts.active },
    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Candidate Tracker
          </p>
          <h1 className="mt-3 text-4xl font-bold lg:text-5xl">My Applications</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Review every submitted application, track status updates, and jump back into any job
            detail page whenever you need more context.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          {filterButtons.map(button => {
            const active = filter === button.key
            return (
              <button
                key={button.key}
                type="button"
                onClick={() => setFilter(button.key)}
                className={`rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {button.label} ({button.count})
              </button>
            )
          })}
        </motion.div>

        {filteredApplications.length > 0 ? (
          <div className="space-y-5">
            {filteredApplications.map((application, index) => {
              const job = getJob(application.jobId)
              const statusMeta = getApplicationStatusMeta(application.status)

              return (
                <motion.article
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-3xl border border-border bg-card p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold">
                            {job?.title || 'Unknown Job'}
                          </h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {job?.company || 'Requirement System'} · {job?.adminName || 'Admin User'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusMeta.badgeClassName}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{job?.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span>{job ? job.type.replace('-', ' ') : 'Role'}</span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4">
                        <p className="text-sm font-semibold">Application Summary</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {statusMeta.summary}
                        </p>
                        {application.interviewDate && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Interview: {new Date(application.interviewDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-[220px]">
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-semibold text-white shadow-lg shadow-primary/25"
                      >
                        View Job
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/resume"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 font-semibold transition-colors hover:bg-accent/10"
                      >
                        <FileText className="h-4 w-4" />
                        Resume
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-border bg-card px-6 py-16 text-center"
          >
            <FileText className="mx-auto h-14 w-14 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No applications found</h2>
            <p className="mt-2 text-muted-foreground">
              Browse active jobs and submit your first application to start tracking progress here.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-semibold text-white shadow-lg shadow-primary/25"
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
