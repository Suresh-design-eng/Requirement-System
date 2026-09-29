import { type FormEvent, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users2,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatJobType } from '../../utils/candidate'
import type { Job } from '../../utils/mockData'

interface JobFormState {
  title: string
  company: string
  department: string
  location: string
  type: Job['type']
  salary: string
  description: string
  skills: string
  requirements: string
  experienceYearsRequired: string
  deadline: string
}

function getEmptyFormState(company = 'RequirementSys Labs'): JobFormState {
  return {
    title: '',
    company,
    department: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    skills: '',
    requirements: '',
    experienceYearsRequired: '0',
    deadline: '',
  }
}

function getFormStateFromJob(job: Job): JobFormState {
  return {
    title: job.title,
    company: job.company,
    department: job.department,
    location: job.location,
    type: job.type,
    salary: job.salary,
    description: job.description,
    skills: job.skills.join(', '),
    requirements: job.requirements.join('\n'),
    experienceYearsRequired: String(job.experienceYearsRequired),
    deadline: job.deadline,
  }
}

function parseCommaSeparated(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function parseLineSeparated(value: string) {
  return value
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default function AdminJobsBoard() {
  const { addJob, applications, currentUser, deleteJob, jobs, updateJob } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [formState, setFormState] = useState<JobFormState>(() => getEmptyFormState())
  const [errorMessage, setErrorMessage] = useState('')

  const filteredJobs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return jobs.filter(job => {
      if (!normalizedSearchTerm) {
        return true
      }

      return [
        job.title,
        job.company,
        job.department,
        job.location,
        job.description,
        ...job.skills,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearchTerm)
    })
  }, [jobs, searchTerm])

  const stats = useMemo(() => {
    const totalApplications = applications.length
    const shortlistedCount = applications.filter(
      application => application.status === 'shortlisted'
    ).length
    const interviewCount = applications.filter(
      application => application.status === 'interview_scheduled'
    ).length
    const selectedCount = applications.filter(
      application => application.status === 'accepted'
    ).length

    return [
      { label: 'Open Jobs', value: jobs.length, icon: Briefcase },
      { label: 'Applications', value: totalApplications, icon: Users2 },
      { label: 'Shortlisted', value: shortlistedCount, icon: CheckCircle2 },
      { label: 'Interviews', value: interviewCount, icon: CalendarClock },
      { label: 'Selected', value: selectedCount, icon: CheckCircle2 },
    ]
  }, [applications, jobs.length])

  const resetForm = () => {
    setFormState(getEmptyFormState())
    setEditingJobId(null)
    setErrorMessage('')
    setFormOpen(false)
  }

  const handleCreateClick = () => {
    setFormState(getEmptyFormState())
    setEditingJobId(null)
    setErrorMessage('')
    setFormOpen(true)
  }

  const handleEditClick = (job: Job) => {
    setFormState(getFormStateFromJob(job))
    setEditingJobId(job.id)
    setErrorMessage('')
    setFormOpen(true)
  }

  const handleDeleteClick = (job: Job) => {
    const confirmMessage = `Delete the job "${job.title}" and all linked applications?`
    if (window.confirm(confirmMessage)) {
      deleteJob(job.id)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedTitle = formState.title.trim()
    const normalizedDepartment = formState.department.trim()
    const normalizedLocation = formState.location.trim()
    const normalizedSalary = formState.salary.trim()
    const normalizedDescription = formState.description.trim()
    const normalizedSkills = parseCommaSeparated(formState.skills)
    const normalizedRequirements = parseLineSeparated(formState.requirements)
    const normalizedExperienceYears = Number(formState.experienceYearsRequired)

    if (
      !normalizedTitle ||
      !normalizedDepartment ||
      !normalizedLocation ||
      !normalizedSalary ||
      !normalizedDescription ||
      !formState.deadline
    ) {
      setErrorMessage('Complete all required job fields before saving.')
      return
    }

    if (normalizedSkills.length === 0 || normalizedRequirements.length === 0) {
      setErrorMessage('Add at least one skill and one job requirement.')
      return
    }

    if (Number.isNaN(normalizedExperienceYears) || normalizedExperienceYears < 0) {
      setErrorMessage('Experience years must be 0 or more.')
      return
    }

    const jobPayload = {
      title: normalizedTitle,
      company: formState.company.trim() || 'RequirementSys Labs',
      adminName: currentUser?.name || 'Admin User',
      department: normalizedDepartment,
      location: normalizedLocation,
      type: formState.type,
      salary: normalizedSalary,
      description: normalizedDescription,
      requirements: normalizedRequirements,
      skills: normalizedSkills,
      experienceYearsRequired: normalizedExperienceYears,
      deadline: formState.deadline,
    }

    if (editingJobId) {
      updateJob(editingJobId, jobPayload)
    } else {
      addJob(jobPayload)
    }

    resetForm()
  }

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
              Admin Hiring Console
            </p>
            <h1 className="mt-3 text-4xl font-bold lg:text-5xl">Job Requirements</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Create roles, keep job requirements current, and jump directly into candidate review
              for each opening.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25"
          >
            <PlusCircle className="h-5 w-5" />
            Create Job Requirement
          </button>
        </motion.div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat, index) => {
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 rounded-3xl border border-border bg-card p-6"
        >
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by title, department, location, company, or skill"
              className="w-full rounded-2xl border border-border bg-background py-3 pl-12 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </motion.div>

        {formOpen && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl border border-primary/20 bg-card p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingJobId ? 'Edit Job Requirement' : 'Create Job Requirement'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Keep the job brief structured so candidates and admins see the same information.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-border bg-background p-2 transition-colors hover:bg-accent/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Job Title *</span>
                  <input
                    value={formState.title}
                    onChange={event => setFormState(previous => ({ ...previous, title: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Company *</span>
                  <input
                    value={formState.company}
                    onChange={event => setFormState(previous => ({ ...previous, company: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Department *</span>
                  <input
                    value={formState.department}
                    onChange={event =>
                      setFormState(previous => ({ ...previous, department: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Location *</span>
                  <input
                    value={formState.location}
                    onChange={event => setFormState(previous => ({ ...previous, location: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Job Type *</span>
                  <select
                    value={formState.type}
                    onChange={event =>
                      setFormState(previous => ({
                        ...previous,
                        type: event.target.value as Job['type'],
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Salary *</span>
                  <input
                    value={formState.salary}
                    onChange={event => setFormState(previous => ({ ...previous, salary: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Experience Required *</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formState.experienceYearsRequired}
                    onChange={event =>
                      setFormState(previous => ({
                        ...previous,
                        experienceYearsRequired: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Deadline *</span>
                  <input
                    type="date"
                    value={formState.deadline}
                    onChange={event => setFormState(previous => ({ ...previous, deadline: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Description *</span>
                <textarea
                  rows={5}
                  value={formState.description}
                  onChange={event =>
                    setFormState(previous => ({ ...previous, description: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Skills *</span>
                  <textarea
                    rows={4}
                    value={formState.skills}
                    onChange={event => setFormState(previous => ({ ...previous, skills: event.target.value }))}
                    placeholder="React, TypeScript, Node.js"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Job Requirements *</span>
                  <textarea
                    rows={4}
                    value={formState.requirements}
                    onChange={event =>
                      setFormState(previous => ({ ...previous, requirements: event.target.value }))
                    }
                    placeholder={'5+ years of relevant experience\nStrong communication skills'}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-border bg-background px-5 py-3 font-semibold transition-colors hover:bg-accent/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-semibold text-white shadow-lg shadow-primary/25"
                >
                  {editingJobId ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Pipeline</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, index) => {
                  const jobApplications = applications.filter(application => application.jobId === job.id)
                  const interviewCount = jobApplications.filter(
                    application => application.status === 'interview_scheduled'
                  ).length
                  const selectedCount = jobApplications.filter(
                    application => application.status === 'accepted'
                  ).length

                  return (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-border last:border-0 hover:bg-accent/5"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{job.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {job.company} · {job.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{job.department}</td>
                      <td className="px-6 py-4 text-sm">{formatJobType(job.type)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(job.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          <span>{jobApplications.length} candidates</span>
                          <span>{interviewCount} interviews</span>
                          <span>{selectedCount} selected</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            to={`/users?job=${job.id}`}
                            className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent/10"
                          >
                            Review Candidates
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditClick(job)}
                            className="rounded-xl border border-border bg-background p-2 transition-colors hover:bg-accent/10"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(job)}
                            className="rounded-xl border border-destructive/20 bg-destructive/10 p-2 transition-colors hover:bg-destructive/15"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold">No jobs match this search</p>
              <p className="mt-2 text-muted-foreground">
                Try a broader search or create a new role requirement.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
