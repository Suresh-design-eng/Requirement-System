import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Briefcase,
  Calendar,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ApplyForm from './ApplyForm'
import {
  formatJobType,
  getApplicationStatusMeta,
  jobTypeOptions,
  normalizeSkills,
} from '../../utils/candidate'
import type { Job } from '../../utils/mockData'

type ExperienceFilter = 'all' | '0' | '1' | '3' | '5'

export default function JobList() {
  const { jobs, applications, currentUser } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all')
  const [jobTypeFilter, setJobTypeFilter] =
    useState<(typeof jobTypeOptions)[number]['value']>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const availableSkills = useMemo(
    () =>
      Array.from(new Set(jobs.flatMap(job => normalizeSkills(job.skills)))).sort((left, right) =>
        left.localeCompare(right)
      ),
    [jobs]
  )

  const availableLocations = useMemo(
    () =>
      Array.from(new Set(jobs.map(job => job.location))).sort((left, right) =>
        left.localeCompare(right)
      ),
    [jobs]
  )

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchableText = [
        job.title,
        job.company,
        job.adminName,
        job.description,
        job.location,
        job.department,
        ...job.skills,
        ...job.requirements,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchableText.includes(searchTerm.trim().toLowerCase())
      const matchesSkill = skillFilter === 'all' || job.skills.includes(skillFilter)
      const matchesLocation = locationFilter === 'all' || job.location === locationFilter
      const matchesExperience =
        experienceFilter === 'all' ||
        job.experienceYearsRequired >= Number(experienceFilter)
      const matchesType = jobTypeFilter === 'all' || job.type === jobTypeFilter

      return matchesSearch && matchesSkill && matchesLocation && matchesExperience && matchesType
    })
  }, [experienceFilter, jobTypeFilter, jobs, locationFilter, searchTerm, skillFilter])

  const candidateApplications = applications.filter(application => application.userId === currentUser?.id)

  const getApplication = (jobId: string) =>
    candidateApplications.find(application => application.jobId === jobId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Candidate Job Board
            </p>
            <h1 className="mt-3 text-4xl font-bold lg:text-5xl">Explore Matching Roles</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Search all active openings, filter by skills and location, and apply with your
              complete candidate profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">Open Jobs</p>
              <p className="mt-2 text-2xl font-bold">{jobs.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">My Applications</p>
              <p className="mt-2 text-2xl font-bold">{candidateApplications.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">Matching Skills</p>
              <p className="mt-2 text-2xl font-bold">{currentUser?.skills?.length || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 rounded-3xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Search & Filters</h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by title, company, skill, description, or location"
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

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
              value={locationFilter}
              onChange={event => setLocationFilter(event.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Locations</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={experienceFilter}
              onChange={event => setExperienceFilter(event.target.value as ExperienceFilter)}
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Experience</option>
              <option value="0">Entry Level</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>

            <select
              value={jobTypeFilter}
              onChange={event =>
                setJobTypeFilter(event.target.value as (typeof jobTypeOptions)[number]['value'])
              }
              className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {jobTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {filteredJobs.map((job, index) => {
            const application = getApplication(job.id)
            const statusMeta = application ? getApplicationStatusMeta(application.status) : null
            const hasActiveApplication = Boolean(
              application && application.status !== 'rejected'
            )

            return (
              <motion.article
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                <div className="relative flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all group-hover:border-primary/40">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold transition-colors group-hover:text-primary">
                        {job.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.company} · Posted by {job.adminName}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {formatJobType(job.type)}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-3 text-muted-foreground">{job.description}</p>

                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span>{job.experienceYearsRequired}+ years</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Deadline {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span>{job.department}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="mb-3 text-sm font-medium">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map(skill => (
                        <span
                          key={skill}
                          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {statusMeta && (
                    <div
                      className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${statusMeta.badgeClassName}`}
                    >
                      {statusMeta.label}
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      disabled={hasActiveApplication}
                      className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-opacity disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {application?.status === 'rejected'
                        ? 'Reapply'
                        : hasActiveApplication
                          ? 'Already Applied'
                          : 'Apply'}
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 font-semibold transition-colors hover:bg-accent/10"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <h3 className="text-xl font-semibold">No jobs match your filters</h3>
            <p className="mt-2 text-muted-foreground">
              Try clearing some filters or search with broader keywords.
            </p>
          </div>
        )}
      </div>

      <ApplyForm
        job={selectedJob}
        open={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}
