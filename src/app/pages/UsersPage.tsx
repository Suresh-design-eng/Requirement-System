import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import {
  CalendarClock,
  CheckCircle2,
  Filter,
  Search,
  Shield,
  UserCheck,
  Users2,
  XCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getApplicationStatusMeta } from '../utils/candidate'
import type { Application } from '../utils/mockData'

type ExperienceFilter = 'all' | '0' | '1-3' | '4+'

interface PipelineRecord {
  application: Application
  candidateName: string
  candidateEmail: string
  candidateSkills: string[]
  experienceYears: number
  jobTitle: string
  jobId: string
}

export default function UsersPage() {
  const {
    applications,
    currentUser,
    jobs,
    scheduleInterview,
    updateApplicationStatus,
    users,
  } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Application['status']>('all')
  const [jobFilter, setJobFilter] = useState(() => searchParams.get('job') || 'all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all')
  const [notice, setNotice] = useState('')
  const [schedulingApplicationId, setSchedulingApplicationId] = useState<string | null>(null)
  const [scheduleMode, setScheduleMode] = useState<'online' | 'offline'>('online')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleDetails, setScheduleDetails] = useState('')
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!notice) {
      return
    }

    const timeoutId = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    if (jobFilter === 'all') {
      setSearchParams({}, { replace: true })
      return
    }

    setSearchParams({ job: jobFilter }, { replace: true })
  }, [jobFilter, setSearchParams])

  const registeredCandidates = users
    .filter(user => user.role === 'user')
    .sort((left, right) => left.name.localeCompare(right.name))

  const pipelineRecords = useMemo<PipelineRecord[]>(() => {
    return applications
      .map(application => {
        const candidate = users.find(user => user.id === application.userId)
        const job = jobs.find(item => item.id === application.jobId)

        if (!candidate || !job) {
          return null
        }

        return {
          application,
          candidateName: application.fullName || candidate.name,
          candidateEmail: application.email || candidate.email,
          candidateSkills: application.skills || candidate.skills || [],
          experienceYears:
            typeof application.experienceYears === 'number'
              ? application.experienceYears
              : candidate.experienceYears || 0,
          jobTitle: job.title,
          jobId: job.id,
        }
      })
      .filter((record): record is PipelineRecord => Boolean(record))
      .sort(
        (left, right) =>
          new Date(right.application.lastUpdatedAt || right.application.appliedDate).getTime() -
          new Date(left.application.lastUpdatedAt || left.application.appliedDate).getTime()
      )
  }, [applications, jobs, users])

  const availableSkills = useMemo(
    () =>
      Array.from(
        new Set(pipelineRecords.flatMap(record => record.candidateSkills))
      ).sort((left, right) => left.localeCompare(right)),
    [pipelineRecords]
  )

  const filteredRecords = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return pipelineRecords.filter(record => {
      const matchesSearch =
        !normalizedSearchTerm ||
        [
          record.candidateName,
          record.candidateEmail,
          record.jobTitle,
          ...record.candidateSkills,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearchTerm)

      const matchesStatus =
        statusFilter === 'all' || record.application.status === statusFilter
      const matchesJob = jobFilter === 'all' || record.jobId === jobFilter
      const matchesSkill =
        skillFilter === 'all' || record.candidateSkills.includes(skillFilter)
      const matchesExperience =
        experienceFilter === 'all' ||
        (experienceFilter === '0' && record.experienceYears === 0) ||
        (experienceFilter === '1-3' &&
          record.experienceYears >= 1 &&
          record.experienceYears < 4) ||
        (experienceFilter === '4+' && record.experienceYears >= 4)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJob &&
        matchesSkill &&
        matchesExperience
      )
    })
  }, [experienceFilter, jobFilter, pipelineRecords, searchTerm, skillFilter, statusFilter])

  const candidateDirectory = useMemo(() => {
    return registeredCandidates.map(candidate => {
      const candidateApplications = pipelineRecords.filter(
        record => record.application.userId === candidate.id
      )
      const latestApplication = candidateApplications[0]

      return {
        candidate,
        applicationsCount: candidateApplications.length,
        latestStatus: latestApplication?.application.status,
        latestJobTitle: latestApplication?.jobTitle || 'No applications yet',
      }
    })
  }, [pipelineRecords, registeredCandidates])

  const pipelineStats = useMemo(() => {
    return [
      { label: 'Registered Candidates', value: registeredCandidates.length, icon: Users2 },
      { label: 'Applications', value: pipelineRecords.length, icon: UserCheck },
      {
        label: 'Interviews Scheduled',
        value: pipelineRecords.filter(
          record => record.application.status === 'interview_scheduled'
        ).length,
        icon: CalendarClock,
      },
      {
        label: 'Selected',
        value: pipelineRecords.filter(record => record.application.status === 'accepted').length,
        icon: CheckCircle2,
      },
    ]
  }, [pipelineRecords, registeredCandidates.length])

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">
            Only admins can review the candidate pipeline.
          </p>
        </div>
      </div>
    )
  }

  const handleStatusChange = (
    applicationId: string,
    status: Application['status']
  ) => {
    const result = updateApplicationStatus(applicationId, status)
    setNotice(result.message)
  }

  const openScheduleForm = (record: PipelineRecord) => {
    setSchedulingApplicationId(record.application.id)
    setScheduleMode(record.application.interviewType || 'online')
    setScheduleDate(record.application.interviewDate?.slice(0, 16) || '')
    setScheduleDetails(
      record.application.interviewType === 'offline'
        ? record.application.interviewLocation || ''
        : record.application.interviewLink || ''
    )
  }

  const handleScheduleSubmit = () => {
    if (!schedulingApplicationId || !scheduleDate || !scheduleDetails.trim()) {
      setNotice('Add interview date, mode, and meeting details before scheduling.')
      return
    }

    scheduleInterview(
      schedulingApplicationId,
      scheduleMode,
      scheduleDate,
      scheduleDetails.trim()
    )
    setNotice('Interview scheduled successfully.')
    setSchedulingApplicationId(null)
    setScheduleDate('')
    setScheduleDetails('')
    setScheduleMode('online')
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
            Admin Candidate Pipeline
          </p>
          <h1 className="mt-3 text-4xl font-bold lg:text-5xl">Candidates & Hiring Flow</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Review candidates, filter the pipeline by skills or status, and move applications
            cleanly from applied to shortlist, interview, selection, or rejection.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pipelineStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-border bg-card p-5"
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

        {notice && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {notice}
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-2xl font-semibold">Registered Candidates</h2>
            <p className="mt-2 text-muted-foreground">
              A quick directory of everyone who has created a candidate account.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Skills</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Applications</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Latest Status</th>
                </tr>
              </thead>
              <tbody>
                {candidateDirectory.map(({ candidate, applicationsCount, latestJobTitle, latestStatus }) => {
                  const statusMeta = latestStatus ? getApplicationStatusMeta(latestStatus) : null

                  return (
                    <tr
                      key={candidate.id}
                      className="border-b border-border last:border-0 hover:bg-accent/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="h-10 w-10 rounded-xl border border-border object-cover"
                          />
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(candidate.skills || []).slice(0, 4).map(skill => (
                            <span
                              key={skill}
                              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                          {!candidate.skills?.length && (
                            <span className="text-sm text-muted-foreground">No skills added</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {typeof candidate.experienceYears === 'number'
                          ? `${candidate.experienceYears} years`
                          : 'Not provided'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium">{applicationsCount}</p>
                        <p className="text-muted-foreground">{latestJobTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        {statusMeta ? (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}
                          >
                            {statusMeta.label}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No applications yet</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-3xl border border-border bg-card"
        >
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Application Pipeline</h2>
                <p className="mt-2 text-muted-foreground">
                  Filter applications and move candidates through the hiring workflow.
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
                <label className="relative block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="Search candidate, email, job, or skill"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <select
                  value={jobFilter}
                  onChange={event => setJobFilter(event.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>

                <select
                  value={skillFilter}
                  onChange={event => setSkillFilter(event.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Skills</option>
                  {availableSkills.map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                <select
                  value={experienceFilter}
                  onChange={event => setExperienceFilter(event.target.value as ExperienceFilter)}
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Experience</option>
                  <option value="0">Fresher</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="4+">4+ Years</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={event =>
                    setStatusFilter(event.target.value as 'all' | Application['status'])
                  }
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="in_review">In Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview</option>
                  <option value="accepted">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredRecords.length} candidates in the filtered pipeline</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Job</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Skills</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => {
                  const statusMeta = getApplicationStatusMeta(record.application.status)
                  const isScheduling = schedulingApplicationId === record.application.id

                  return (
                    <tr
                      key={record.application.id}
                      className="border-b border-border align-top last:border-0 hover:bg-accent/5"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{record.candidateName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {record.candidateEmail}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Applied {new Date(record.application.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{record.jobTitle}</p>
                          {record.application.interviewDate && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Interview: {new Date(record.application.interviewDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {record.candidateSkills.map(skill => (
                            <span
                              key={skill}
                              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                          {record.candidateSkills.length === 0 && (
                            <span className="text-sm text-muted-foreground">No skills listed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.experienceYears} year{record.experienceYears === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            {record.application.status === 'applied' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(record.application.id, 'in_review')
                                }
                                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent/10"
                              >
                                Review
                              </button>
                            )}

                            {(record.application.status === 'applied' ||
                              record.application.status === 'in_review') && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(record.application.id, 'shortlisted')
                                }
                                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                              >
                                Shortlist
                              </button>
                            )}

                            {(record.application.status === 'shortlisted' ||
                              record.application.status === 'interview_scheduled') && (
                              <button
                                type="button"
                                onClick={() => openScheduleForm(record)}
                                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent/10"
                              >
                                Schedule Interview
                              </button>
                            )}

                            {record.application.status === 'interview_scheduled' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(record.application.id, 'accepted')
                                }
                                className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white"
                              >
                                Mark Selected
                              </button>
                            )}

                            {record.application.status !== 'rejected' &&
                              record.application.status !== 'accepted' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(record.application.id, 'rejected')
                                  }
                                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
                                >
                                  Reject
                                </button>
                              )}
                          </div>

                          {isScheduling && (
                            <div className="w-full min-w-[290px] rounded-2xl border border-border bg-background p-4 text-left">
                              <div className="grid gap-3">
                                <label className="block">
                                  <span className="mb-2 block text-sm font-medium">Mode</span>
                                  <select
                                    value={scheduleMode}
                                    onChange={event =>
                                      setScheduleMode(
                                        event.target.value as 'online' | 'offline'
                                      )
                                    }
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                  </select>
                                </label>

                                <label className="block">
                                  <span className="mb-2 block text-sm font-medium">
                                    Date & Time
                                  </span>
                                  <input
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={event => setScheduleDate(event.target.value)}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  />
                                </label>

                                <label className="block">
                                  <span className="mb-2 block text-sm font-medium">
                                    {scheduleMode === 'online' ? 'Meeting Link' : 'Interview Location'}
                                  </span>
                                  <input
                                    value={scheduleDetails}
                                    onChange={event => setScheduleDetails(event.target.value)}
                                    placeholder={
                                      scheduleMode === 'online'
                                        ? 'https://meet.example.com/session'
                                        : 'HQ Office, Floor 4'
                                    }
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  />
                                </label>
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSchedulingApplicationId(null)}
                                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/10"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleScheduleSubmit}
                                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                                >
                                  Save Interview
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="px-6 py-16 text-center">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No candidates match these filters</h3>
              <p className="mt-2 text-muted-foreground">
                Clear a few filters or create more job openings to widen the pipeline.
              </p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
