import type {
  Application,
  ApplicationStatus,
  Availability,
  Job,
  JobType,
  NotificationItem,
  ResumeAnalysis,
  User,
} from './mockData'

export const experienceLevelOptions = [
  {
    value: 'fresher',
    label: 'Fresher',
    description: 'Great for internships, campus hires, and entry-level applicants.',
  },
  {
    value: '1-3-years',
    label: '1-3 years',
    description: 'For candidates building momentum in their first full-time roles.',
  },
  {
    value: '3-plus-years',
    label: '3+ years',
    description: 'For experienced professionals with established project ownership.',
  },
] as const

export type ExperienceLevel = (typeof experienceLevelOptions)[number]['value']

export const candidateSkillOptions = [
  'React',
  'TypeScript',
  'Node.js',
  'AWS',
  'Python',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'UI/UX',
  'Figma',
  'Design Systems',
  'Research',
  'Product Strategy',
  'Analytics',
  'Agile',
  'Communication',
  'Stakeholder Management',
  'JavaScript',
  'CSS',
  'HTML',
] as const

export const availabilityOptions: Array<{ value: Availability; label: string }> = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'notice_period', label: 'Notice Period' },
]

export const RESUME_FILE_MAX_SIZE_BYTES = 1024 * 1024
export const RESUME_FILE_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const resumeMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const resumeExtensions = ['pdf', 'doc', 'docx']

export const jobTypeOptions: Array<{ value: JobType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

export const applicationStatusMeta: Record<
  ApplicationStatus,
  { label: string; badgeClassName: string; summary: string }
> = {
  applied: {
    label: 'Applied',
    badgeClassName: 'bg-primary/10 text-primary border-primary/20',
    summary: 'Your application has been received.',
  },
  in_review: {
    label: 'In Review',
    badgeClassName: 'bg-secondary/10 text-secondary border-secondary/20',
    summary: 'Your profile has been reviewed and is moving through evaluation.',
  },
  shortlisted: {
    label: 'Shortlisted',
    badgeClassName: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    summary: 'You are on the shortlist for the next round.',
  },
  rejected: {
    label: 'Rejected',
    badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
    summary: 'This application is no longer active.',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    badgeClassName: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    summary: 'An interview has been scheduled for this role.',
  },
  accepted: {
    label: 'Selected',
    badgeClassName: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    summary: 'Congratulations, you have been selected.',
  },
}

export function normalizeSkills(skills?: string[]) {
  if (!Array.isArray(skills)) {
    return []
  }

  return Array.from(
    new Set(
      skills
        .map(skill => skill.trim())
        .filter(Boolean)
    )
  )
}

export function getExperienceLevelFromYears(years?: number): ExperienceLevel {
  if (typeof years !== 'number' || Number.isNaN(years) || years <= 0) {
    return 'fresher'
  }

  if (years < 3) {
    return '1-3-years'
  }

  return '3-plus-years'
}

export function getExperienceYearsFromLevel(level: ExperienceLevel) {
  switch (level) {
    case '1-3-years':
      return 2
    case '3-plus-years':
      return 4
    case 'fresher':
    default:
      return 0
  }
}

export function formatExperienceLevel(level: ExperienceLevel) {
  return experienceLevelOptions.find(option => option.value === level)?.label || 'Fresher'
}

export function formatJobType(type: JobType) {
  return type
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function formatAvailability(value: Availability) {
  return value === 'notice_period' ? 'Notice Period' : 'Immediate'
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${bytes} B`
}

export function isSupportedResumeFile(file: File) {
  const extension = file.name.toLowerCase().split('.').pop() || ''
  return resumeMimeTypes.has(file.type) || resumeExtensions.includes(extension)
}

export function validateResumeFile(file?: File | null) {
  if (!file) {
    return 'Resume is required.'
  }

  if (!isSupportedResumeFile(file)) {
    return 'Resume must be a PDF, DOC, or DOCX file.'
  }

  if (file.size > RESUME_FILE_MAX_SIZE_BYTES) {
    return `Resume must be ${formatFileSize(RESUME_FILE_MAX_SIZE_BYTES)} or smaller.`
  }

  return ''
}

export function getProfileCompletion(user: User | null) {
  if (!user) {
    return 0
  }

  const checks = [
    user.name,
    user.email,
    user.phone,
    user.education,
    user.location,
    user.avatar,
    user.resumeUrl,
    user.skills?.length ? 'skills' : '',
    typeof user.experienceYears === 'number' && user.experienceYears >= 0 ? 'experience' : '',
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}

export function matchJobToCandidate(job: Job, user: User | null) {
  if (!user) {
    return 0
  }

  const userSkills = normalizeSkills(user.skills)
  const matchedSkills = job.skills.filter(skill => userSkills.includes(skill)).length
  const locationScore =
    user.location && job.location.toLowerCase().includes(user.location.toLowerCase()) ? 2 : 0
  const experienceScore =
    typeof user.experienceYears === 'number' && user.experienceYears >= job.experienceYearsRequired
      ? 2
      : 0

  return matchedSkills * 3 + locationScore + experienceScore
}

export function getRecommendedJobs(jobs: Job[], user: User | null, applications: Application[]) {
  const excluded = new Set(applications.filter(app => app.userId === user?.id).map(app => app.jobId))

  return [...jobs]
    .filter(job => !excluded.has(job.id))
    .sort((left, right) => matchJobToCandidate(right, user) - matchJobToCandidate(left, user))
}

export function buildResumeAnalysis(user: User | null, jobs: Job[]): ResumeAnalysis {
  const extractedSkills = normalizeSkills(user?.skills)
  const extractedExperience =
    typeof user?.experienceYears === 'number'
      ? `${user.experienceYears} year${user.experienceYears === 1 ? '' : 's'}`
      : 'Not specified'
  const targetSkills = Array.from(new Set(jobs.flatMap(job => job.skills))).slice(0, 12)
  const missingSkills = targetSkills
    .filter(skill => !extractedSkills.includes(skill))
    .slice(0, 5)

  const improvementTips = [
    !user?.resumeName ? 'Upload your latest PDF resume to strengthen every application.' : '',
    extractedSkills.length < 4 ? 'Add more role-specific skills so recruiters can match you faster.' : '',
    !user?.portfolioUrl ? 'Add a portfolio link to showcase projects and case studies.' : '',
    !user?.githubUrl && !user?.linkedinUrl ? 'Include GitHub or LinkedIn links to improve credibility.' : '',
    typeof user?.experienceYears !== 'number'
      ? 'Add total years of experience to help recruiters shortlist you accurately.'
      : '',
    !user?.education ? 'Complete your education section to strengthen your profile completeness.' : '',
  ].filter(Boolean)

  return {
    extractedSkills,
    extractedExperience,
    missingSkills,
    improvementTips:
      improvementTips.length > 0
        ? improvementTips
        : ['Your profile looks strong. Keep your resume updated for each target role.'],
  }
}

export function getCandidateNotifications(
  user: User | null,
  jobs: Job[],
  applications: Application[],
): NotificationItem[] {
  if (!user) {
    return []
  }

  const applicationNotifications = applications
    .filter(application => application.userId === user.id)
    .map(application => {
      const job = jobs.find(item => item.id === application.jobId)
      const meta = applicationStatusMeta[application.status]

      return {
        id: `application-${application.id}`,
        title: meta.label,
        message: job ? `${job.title}: ${meta.summary}` : meta.summary,
        date: application.lastUpdatedAt || application.appliedDate,
        type: 'application' as const,
        link: '/applications',
      }
    })

  const newJobNotifications = getRecommendedJobs(jobs, user, applications)
    .slice(0, 3)
    .map(job => ({
      id: `job-${job.id}`,
      title: 'New job match',
      message: `${job.title} in ${job.location} matches your profile.`,
      date: job.postedDate,
      type: 'job' as const,
      link: `/jobs/${job.id}`,
    }))

  const profileNotifications =
    getProfileCompletion(user) < 80
      ? [
          {
            id: 'profile-completion',
            title: 'Complete your profile',
            message: 'Add missing profile details to improve job matching and auto-fill applications.',
            date: new Date().toISOString(),
            type: 'profile' as const,
            link: '/settings',
          },
        ]
      : []

  return [...applicationNotifications, ...newJobNotifications, ...profileNotifications]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 6)
}

export function getApplicationStatusMeta(status: ApplicationStatus) {
  return applicationStatusMeta[status]
}
