import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  authMode,
  loginWithRemoteApi,
  registerWithRemoteApi,
  type AuthResult,
  type RegistrationData,
} from '../services/auth'
import { normalizeSkills, validateResumeFile } from '../utils/candidate'
import {
  type Application,
  type Job,
  type JobApplicationInput,
  type Requirement,
  type User,
  mockApplications,
  mockJobs,
  mockRequirements,
  mockUsers,
} from '../utils/mockData'

interface UserRecord extends User {
  password?: string
}

interface SessionState {
  token: string
  userId: string
}

interface ActionResult {
  success: boolean
  message: string
}

interface AppContextType {
  authMode: 'local' | 'remote'
  currentUser: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (payload: RegistrationData) => Promise<AuthResult>
  logout: () => void
  users: User[]
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  requirements: Requirement[]
  addRequirement: (req: Omit<Requirement, 'id' | 'createdAt'>) => void
  updateRequirement: (id: string, req: Partial<Requirement>) => void
  deleteRequirement: (id: string) => void
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void
  updateJob: (id: string, job: Partial<Job>) => void
  deleteJob: (id: string) => void
  applications: Application[]
  applyToJob: (jobId: string) => void
  submitJobApplication: (payload: JobApplicationInput) => Promise<ActionResult>
  rejectJob: (jobId: string) => void
  updateApplicationStatus: (
    applicationId: string,
    status: Application['status']
  ) => ActionResult
  scheduleInterview: (
    applicationId: string,
    type: 'online' | 'offline',
    date: string,
    linkOrLocation: string
  ) => void
  uploadResume: (file: File) => Promise<void>
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  users: 'requirement-system.users',
  requirements: 'requirement-system.requirements',
  jobs: 'requirement-system.jobs',
  applications: 'requirement-system.applications',
  session: 'requirement-system.session.v2',
  legacySession: 'requirement-system.session',
  darkMode: 'requirement-system.dark-mode',
} as const

const jobTypes = ['full-time', 'part-time', 'contract', 'internship'] as const
const applicationStatuses = [
  'applied',
  'in_review',
  'shortlisted',
  'rejected',
  'interview_scheduled',
  'accepted',
] as const

const applicationStatusTransitions: Record<Application['status'], Application['status'][]> = {
  applied: ['in_review', 'shortlisted', 'rejected'],
  in_review: ['shortlisted', 'rejected'],
  shortlisted: ['interview_scheduled', 'rejected'],
  interview_scheduled: ['accepted', 'rejected'],
  rejected: [],
  accepted: [],
}

function createAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getNow() {
  return new Date().toISOString()
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorage<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeStorage(key: string) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(key)
}

function stripPassword(user: UserRecord) {
  const { password, ...publicUser } = user
  return publicUser
}

function normalizeOptionalString(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function normalizeNumber(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return undefined
  }

  return Math.round(value * 10) / 10
}

function normalizeUserRecord(user: UserRecord, fallbackPassword?: string): UserRecord {
  const safeEmail = user.email?.trim().toLowerCase() || ''
  const safeName = user.name?.trim() || safeEmail.split('@')[0] || 'User'

  return {
    ...user,
    id: String(user.id),
    name: safeName,
    email: safeEmail,
    role: user.role === 'admin' ? 'admin' : 'user',
    avatar: normalizeOptionalString(user.avatar) || createAvatarUrl(safeName),
    phone: normalizeOptionalString(user.phone),
    skills: normalizeSkills(user.skills),
    experienceYears: normalizeNumber(user.experienceYears),
    education: normalizeOptionalString(user.education),
    location: normalizeOptionalString(user.location),
    portfolioUrl: normalizeOptionalString(user.portfolioUrl),
    githubUrl: normalizeOptionalString(user.githubUrl),
    linkedinUrl: normalizeOptionalString(user.linkedinUrl),
    expectedSalary: normalizeOptionalString(user.expectedSalary),
    resumeUrl: normalizeOptionalString(user.resumeUrl),
    resumeName: normalizeOptionalString(user.resumeName),
    password: user.password ?? fallbackPassword,
  }
}

function normalizeJobRecord(job: Job): Job {
  const normalizedType = jobTypes.includes(job.type) ? job.type : 'full-time'
  const experienceYearsRequired =
    typeof job.experienceYearsRequired === 'number' && job.experienceYearsRequired >= 0
      ? Math.round(job.experienceYearsRequired * 10) / 10
      : 0

  return {
    ...job,
    id: String(job.id),
    title: job.title.trim(),
    company: normalizeOptionalString(job.company) || 'Requirement System',
    adminName: normalizeOptionalString(job.adminName) || 'Admin User',
    description: job.description.trim(),
    department: normalizeOptionalString(job.department) || 'General',
    location: normalizeOptionalString(job.location) || 'Remote',
    type: normalizedType,
    salary: normalizeOptionalString(job.salary) || 'Competitive',
    requirements: Array.isArray(job.requirements)
      ? job.requirements.map(item => item.trim()).filter(Boolean)
      : [],
    skills: normalizeSkills(job.skills),
    experienceYearsRequired,
    postedDate: normalizeOptionalString(job.postedDate) || getToday(),
    deadline: normalizeOptionalString(job.deadline) || getToday(),
    lat: typeof job.lat === 'number' ? job.lat : undefined,
    lng: typeof job.lng === 'number' ? job.lng : undefined,
  }
}

function normalizeApplicationRecord(application: Application): Application {
  const normalizedStatus = applicationStatuses.includes(application.status)
    ? application.status
    : 'applied'

  return {
    ...application,
    id: String(application.id),
    jobId: String(application.jobId),
    userId: String(application.userId),
    status: normalizedStatus,
    appliedDate: normalizeOptionalString(application.appliedDate) || getToday(),
    lastUpdatedAt: normalizeOptionalString(application.lastUpdatedAt) || application.appliedDate,
    fullName: normalizeOptionalString(application.fullName),
    email: normalizeOptionalString(application.email),
    phone: normalizeOptionalString(application.phone),
    resumeUrl: normalizeOptionalString(application.resumeUrl),
    resumeName: normalizeOptionalString(application.resumeName),
    skills: normalizeSkills(application.skills),
    experienceYears: normalizeNumber(application.experienceYears),
    coverLetter: normalizeOptionalString(application.coverLetter),
    portfolioUrl: normalizeOptionalString(application.portfolioUrl),
    githubUrl: normalizeOptionalString(application.githubUrl),
    linkedinUrl: normalizeOptionalString(application.linkedinUrl),
    expectedSalary: normalizeOptionalString(application.expectedSalary),
    availability:
      application.availability === 'notice_period' ? 'notice_period' : 'immediate',
    interviewType: application.interviewType === 'offline' ? 'offline' : application.interviewType,
    interviewDate: normalizeOptionalString(application.interviewDate),
    interviewLink: normalizeOptionalString(application.interviewLink),
    interviewLocation: normalizeOptionalString(application.interviewLocation),
  }
}

function canTransitionApplication(
  currentStatus: Application['status'],
  nextStatus: Application['status']
) {
  return (
    currentStatus === nextStatus ||
    applicationStatusTransitions[currentStatus].includes(nextStatus)
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

const seededUsers: UserRecord[] = mockUsers.map((user, index) =>
  normalizeUserRecord(user, index === 0 ? 'Admin@123' : 'User@123')
)

function upsertUserRecord(records: UserRecord[], user: User) {
  const normalizedIncoming = normalizeUserRecord(user)
  const existingRecord = records.find(record => record.id === normalizedIncoming.id)

  if (!existingRecord) {
    return [...records, normalizedIncoming]
  }

  return records.map(record =>
    record.id === normalizedIncoming.id
      ? normalizeUserRecord(
          { ...record, ...normalizedIncoming, password: existingRecord.password },
          existingRecord.password
        )
      : record
  )
}

function createDefaultUsers() {
  return seededUsers.map(user => ({ ...user }))
}

function createDefaultRequirements() {
  return mockRequirements.map(requirement => ({ ...requirement }))
}

function createDefaultJobs() {
  return mockJobs.map(job => normalizeJobRecord(job))
}

function createDefaultApplications() {
  return mockApplications.map(application => normalizeApplicationRecord(application))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [storedUsers, setStoredUsers] = useState<UserRecord[]>(() => {
    const stored = readStorage<UserRecord[]>(STORAGE_KEYS.users, [])
    return stored.length > 0
      ? stored.map((user, index) =>
          normalizeUserRecord(user, index === 0 ? 'Admin@123' : 'User@123')
        )
      : createDefaultUsers()
  })
  const [requirements, setRequirements] = useState<Requirement[]>(() =>
    readStorage<Requirement[]>(STORAGE_KEYS.requirements, createDefaultRequirements())
  )
  const [jobs, setJobs] = useState<Job[]>(() =>
    readStorage<Job[]>(STORAGE_KEYS.jobs, createDefaultJobs()).map(normalizeJobRecord)
  )
  const [applications, setApplications] = useState<Application[]>(() =>
    readStorage<Application[]>(STORAGE_KEYS.applications, createDefaultApplications()).map(
      normalizeApplicationRecord
    )
  )
  const [authSession, setAuthSession] = useState<SessionState | null>(() =>
    readStorage<SessionState | null>(STORAGE_KEYS.session, null)
  )
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.darkMode, true)
  )

  const currentUserRecord =
    authSession ? storedUsers.find(user => user.id === authSession.userId) || null : null
  const currentUser = currentUserRecord ? stripPassword(currentUserRecord) : null
  const users = storedUsers.map(stripPassword)

  useEffect(() => {
    removeStorage(STORAGE_KEYS.legacySession)
  }, [])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.users, storedUsers)
  }, [storedUsers])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.requirements, requirements)
  }, [requirements])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.jobs, jobs)
  }, [jobs])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.applications, applications)
  }, [applications])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.darkMode, isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    if (authSession) {
      writeStorage(STORAGE_KEYS.session, authSession)
      return
    }

    removeStorage(STORAGE_KEYS.session)
  }, [authSession])

  useEffect(() => {
    if (authSession && !currentUserRecord) {
      setAuthSession(null)
    }
  }, [authSession, currentUserRecord])

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (!normalizedEmail || !normalizedPassword) {
      return {
        success: false,
        message: 'Enter both your email address and password.',
      } satisfies AuthResult
    }

    if (authMode === 'remote') {
      const remoteResult = await loginWithRemoteApi({
        email: normalizedEmail,
        password: normalizedPassword,
      })

      if (!remoteResult) {
        return {
          success: false,
          message: 'Remote authentication is not configured.',
        } satisfies AuthResult
      }

      if (remoteResult.success && remoteResult.user) {
        setStoredUsers(previousUsers => upsertUserRecord(previousUsers, remoteResult.user!))
        setAuthSession({
          userId: remoteResult.user.id,
          token: remoteResult.token || `session-${remoteResult.user.id}`,
        })
      }

      return remoteResult
    }

    const matchingUser = storedUsers.find(
      user => user.email.toLowerCase() === normalizedEmail
    )

    if (!matchingUser || matchingUser.password !== normalizedPassword) {
      return {
        success: false,
        message: 'The email or password you entered is incorrect.',
      } satisfies AuthResult
    }

    const token = `session-${matchingUser.id}-${Date.now()}`
    setAuthSession({
      userId: matchingUser.id,
      token,
    })

    return {
      success: true,
      message: 'Signed in successfully.',
      token,
      user: stripPassword(matchingUser),
    } satisfies AuthResult
  }

  const register = async (payload: RegistrationData) => {
    const name = payload.name.trim()
    const email = payload.email.trim().toLowerCase()
    const password = payload.password.trim()

    if (name.length < 2) {
      return {
        success: false,
        message: 'Use a name with at least 2 characters.',
      } satisfies AuthResult
    }

    if (password.length < 8) {
      return {
        success: false,
        message: 'Use a password with at least 8 characters.',
      } satisfies AuthResult
    }

    if (authMode === 'remote') {
      const remoteResult = await registerWithRemoteApi({
        name,
        email,
        password,
      })

      if (!remoteResult) {
        return {
          success: false,
          message: 'Remote authentication is not configured.',
        } satisfies AuthResult
      }

      if (remoteResult.success && remoteResult.user) {
        setStoredUsers(previousUsers => upsertUserRecord(previousUsers, remoteResult.user!))
        setAuthSession({
          userId: remoteResult.user.id,
          token: remoteResult.token || `session-${remoteResult.user.id}`,
        })
      }

      return remoteResult
    }

    const existingUser = storedUsers.find(user => user.email === email)
    if (existingUser) {
      return {
        success: false,
        message: 'An account with that email address already exists.',
      } satisfies AuthResult
    }

    const newUser: UserRecord = normalizeUserRecord({
      id: generateId('user'),
      name,
      email,
      role: 'user',
      avatar: createAvatarUrl(name),
      skills: [],
      password,
    })

    setStoredUsers(previousUsers => [...previousUsers, newUser])

    const token = `session-${newUser.id}-${Date.now()}`
    setAuthSession({
      userId: newUser.id,
      token,
    })

    return {
      success: true,
      message: 'Account created successfully.',
      token,
      user: stripPassword(newUser),
    } satisfies AuthResult
  }

  const logout = () => {
    setAuthSession(null)
  }

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = normalizeUserRecord(
      {
        ...user,
        id: generateId('user'),
        avatar: user.avatar || createAvatarUrl(user.name),
      },
      'ChangeMe123!'
    )

    setStoredUsers(previousUsers => [...previousUsers, newUser])
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    setStoredUsers(previousUsers =>
      previousUsers.map(user =>
        user.id === id
          ? normalizeUserRecord(
              {
                ...user,
                ...userData,
                avatar: userData.avatar === undefined ? user.avatar : userData.avatar,
              },
              user.password
            )
          : user
      )
    )
  }

  const deleteUser = (id: string) => {
    setStoredUsers(previousUsers => previousUsers.filter(user => user.id !== id))
    setApplications(previousApplications =>
      previousApplications.filter(application => application.userId !== id)
    )

    if (authSession?.userId === id) {
      setAuthSession(null)
    }
  }

  const addRequirement = (requirement: Omit<Requirement, 'id' | 'createdAt'>) => {
    setRequirements(previousRequirements => [
      ...previousRequirements,
      {
        ...requirement,
        id: generateId('requirement'),
        createdAt: getToday(),
      },
    ])
  }

  const updateRequirement = (id: string, requirementData: Partial<Requirement>) => {
    setRequirements(previousRequirements =>
      previousRequirements.map(requirement =>
        requirement.id === id ? { ...requirement, ...requirementData } : requirement
      )
    )
  }

  const deleteRequirement = (id: string) => {
    setRequirements(previousRequirements =>
      previousRequirements.filter(requirement => requirement.id !== id)
    )
  }

  const addJob = (job: Omit<Job, 'id' | 'postedDate'>) => {
    setJobs(previousJobs => [
      ...previousJobs,
      normalizeJobRecord({
        ...job,
        id: generateId('job'),
        postedDate: getToday(),
      }),
    ])
  }

  const updateJob = (id: string, jobData: Partial<Job>) => {
    setJobs(previousJobs =>
      previousJobs.map(job =>
        job.id === id ? normalizeJobRecord({ ...job, ...jobData }) : job
      )
    )
  }

  const deleteJob = (id: string) => {
    setJobs(previousJobs => previousJobs.filter(job => job.id !== id))
    setApplications(previousApplications =>
      previousApplications.filter(application => application.jobId !== id)
    )
  }

  const applyToJob = (jobId: string) => {
    if (!currentUserRecord) {
      return
    }

    void submitJobApplication({
      jobId,
      fullName: currentUserRecord.name,
      email: currentUserRecord.email,
      phone: currentUserRecord.phone || '',
      skills: currentUserRecord.skills || [],
      experienceYears: currentUserRecord.experienceYears || 0,
      coverLetter: 'I am excited to apply for this position and would love to be considered.',
      portfolioUrl: currentUserRecord.portfolioUrl,
      githubUrl: currentUserRecord.githubUrl,
      linkedinUrl: currentUserRecord.linkedinUrl,
      expectedSalary: currentUserRecord.expectedSalary,
      availability: 'immediate',
    })
  }

  const rejectJob = (jobId: string) => {
    if (!currentUserRecord) {
      return
    }

    setApplications(previousApplications => {
      const existingApplication = previousApplications.find(
        application =>
          application.jobId === jobId && application.userId === currentUserRecord.id
      )

      if (existingApplication) {
        return previousApplications.map(application =>
          application.id === existingApplication.id
            ? normalizeApplicationRecord({
                ...application,
                status: 'rejected',
                lastUpdatedAt: getNow(),
              })
            : application
        )
      }

      return [
        normalizeApplicationRecord({
          id: generateId('application'),
          jobId,
          userId: currentUserRecord.id,
          status: 'rejected',
          appliedDate: getToday(),
          lastUpdatedAt: getNow(),
          fullName: currentUserRecord.name,
          email: currentUserRecord.email,
          phone: currentUserRecord.phone,
          skills: currentUserRecord.skills,
          experienceYears: currentUserRecord.experienceYears,
        }),
        ...previousApplications,
      ]
    })
  }

  const updateApplicationStatus = (
    applicationId: string,
    status: Application['status']
  ): ActionResult => {
    let result: ActionResult = {
      success: false,
      message: 'Unable to update this application right now.',
    }

    setApplications(previousApplications => {
      const currentApplication = previousApplications.find(
        application => application.id === applicationId
      )

      if (!currentApplication) {
        result = {
          success: false,
          message: 'The application could not be found.',
        }
        return previousApplications
      }

      if (!canTransitionApplication(currentApplication.status, status)) {
        result = {
          success: false,
          message:
            'This status change is outside the hiring workflow. Move the candidate through review, shortlist, interview, then selection or rejection.',
        }
        return previousApplications
      }

      result = {
        success: true,
        message: 'Application status updated successfully.',
      }

      return previousApplications.map(application =>
        application.id === applicationId
          ? normalizeApplicationRecord({
              ...application,
              status,
              lastUpdatedAt: getNow(),
            })
          : application
      )
    })

    return result
  }

  const submitJobApplication = async (
    payload: JobApplicationInput
  ): Promise<ActionResult> => {
    if (!currentUserRecord) {
      return {
        success: false,
        message: 'Please sign in before applying.',
      }
    }

    const job = jobs.find(item => item.id === payload.jobId)
    if (!job) {
      return {
        success: false,
        message: 'This job is no longer available.',
      }
    }

    const fullName = payload.fullName.trim()
    const email = payload.email.trim().toLowerCase()
    const phone = payload.phone.trim()
    const skills = normalizeSkills(payload.skills)
    const experienceYears = Math.max(0, Number(payload.experienceYears) || 0)
    const coverLetter = payload.coverLetter.trim()
    const portfolioUrl = normalizeOptionalString(payload.portfolioUrl)
    const githubUrl = normalizeOptionalString(payload.githubUrl)
    const linkedinUrl = normalizeOptionalString(payload.linkedinUrl)
    const expectedSalary = normalizeOptionalString(payload.expectedSalary)

    if (!fullName || !email || !phone || skills.length === 0) {
      return {
        success: false,
        message: 'Please complete all required application fields.',
      }
    }

    const existingApplication = applications.find(
      application =>
        application.jobId === payload.jobId && application.userId === currentUserRecord.id
    )

    if (existingApplication && existingApplication.status !== 'rejected') {
      return {
        success: false,
        message: 'You have already applied to this job.',
      }
    }

    let resumeUrl = currentUserRecord.resumeUrl
    let resumeName = currentUserRecord.resumeName

    if (payload.resumeFile) {
      const resumeValidationError = validateResumeFile(payload.resumeFile)
      if (resumeValidationError) {
        return {
          success: false,
          message: resumeValidationError,
        }
      }

      resumeUrl = await readFileAsDataUrl(payload.resumeFile)
      resumeName = payload.resumeFile.name
    }

    if (!resumeUrl || !resumeName) {
      return {
        success: false,
        message: 'Please upload a resume before submitting your application.',
      }
    }

    setStoredUsers(previousUsers =>
      previousUsers.map(user =>
        user.id === currentUserRecord.id
          ? normalizeUserRecord(
              {
                ...user,
                name: fullName,
                email,
                phone,
                skills,
                experienceYears,
                portfolioUrl: portfolioUrl || user.portfolioUrl,
                githubUrl: githubUrl || user.githubUrl,
                linkedinUrl: linkedinUrl || user.linkedinUrl,
                expectedSalary: expectedSalary || user.expectedSalary,
                resumeUrl,
                resumeName,
              },
              user.password
            )
          : user
      )
    )

    const nextApplication = normalizeApplicationRecord({
      ...(existingApplication || {}),
      id: existingApplication?.id || generateId('application'),
      jobId: payload.jobId,
      userId: currentUserRecord.id,
      status: 'applied',
      appliedDate: existingApplication?.appliedDate || getToday(),
      lastUpdatedAt: getNow(),
      fullName,
      email,
      phone,
      resumeUrl,
      resumeName,
      skills,
      experienceYears,
      coverLetter,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      expectedSalary,
      availability: payload.availability,
      interviewType: undefined,
      interviewDate: undefined,
      interviewLink: undefined,
      interviewLocation: undefined,
    })

    setApplications(previousApplications =>
      existingApplication
        ? previousApplications.map(application =>
            application.id === existingApplication.id ? nextApplication : application
          )
        : [nextApplication, ...previousApplications]
    )

    return {
      success: true,
      message: 'Application submitted successfully.',
    }
  }

  const scheduleInterview = (
    applicationId: string,
    type: 'online' | 'offline',
    date: string,
    linkOrLocation: string
  ) => {
    setApplications(previousApplications =>
      previousApplications.map(application =>
        application.id === applicationId &&
        (application.status === 'shortlisted' || application.status === 'interview_scheduled')
          ? normalizeApplicationRecord({
              ...application,
              status: 'interview_scheduled',
              lastUpdatedAt: getNow(),
              interviewType: type,
              interviewDate: date,
              interviewLink: type === 'online' ? linkOrLocation : undefined,
              interviewLocation: type === 'offline' ? linkOrLocation : undefined,
            })
          : application
      )
    )
  }

  const uploadResume = async (file: File) => {
    if (!currentUserRecord) {
      return
    }

    const resumeValidationError = validateResumeFile(file)
    if (resumeValidationError) {
      throw new Error(resumeValidationError)
    }

    const resumeUrl = await readFileAsDataUrl(file)
    updateUser(currentUserRecord.id, {
      resumeUrl,
      resumeName: file.name,
    })
  }

  const toggleDarkMode = () => {
    setIsDarkMode(previousValue => !previousValue)
  }

  return (
    <AppContext.Provider
      value={{
        authMode,
        currentUser,
        login,
        register,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        requirements,
        addRequirement,
        updateRequirement,
        deleteRequirement,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        applications,
        applyToJob,
        submitJobApplication,
        rejectJob,
        updateApplicationStatus,
        scheduleInterview,
        uploadResume,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }

  return context
}
