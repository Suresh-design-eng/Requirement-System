import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { Briefcase, CheckCircle2, LoaderCircle, Save, Sparkles, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  candidateSkillOptions,
  formatJobType,
  getExperienceLevelFromYears,
  getExperienceYearsFromLevel,
  type ExperienceLevel,
  validateResumeFile,
} from '../../utils/candidate'
import type { Job } from '../../utils/mockData'
import ApplicationResumeUpload from './ApplicationResumeUpload'
import ApplicationSidebar from './ApplicationSidebar'
import ApplicationSkillPicker from './ApplicationSkillPicker'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

interface ApplyFormProps {
  job: Job | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ApplyFormValues {
  fullName: string
  email: string
  phone: string
  skills: string[]
  experienceLevel: ExperienceLevel
  coverLetter: string
  portfolioUrl: string
}

interface ApplicationDraft {
  savedAt: string
  useStoredResume: boolean
  values: ApplyFormValues
  resume?: {
    dataUrl: string
    name: string
    type: string
  }
}

const DRAFT_PREFIX = 'requirement-system.application-draft'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const inputClassName =
  'w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20'

function buildDraftKey(userId: string, jobId: string) {
  return `${DRAFT_PREFIX}.${userId}.${jobId}`
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function dataUrlToFile(dataUrl: string, name: string, type: string) {
  const [, base64 = ''] = dataUrl.split(',')
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new File([bytes], name, { type })
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ApplyForm({ job, open, onClose, onSuccess }: ApplyFormProps) {
  const { currentUser, submitJobApplication } = useApp()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null)
  const [useStoredResume, setUseStoredResume] = useState(Boolean(currentUser?.resumeUrl))
  const [resumeError, setResumeError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [draftAvailable, setDraftAvailable] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skillQuery, setSkillQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const previewUrlRef = useRef<string | null>(null)

  const storedResume =
    currentUser?.resumeUrl && currentUser?.resumeName
      ? { name: currentUser.resumeName, url: currentUser.resumeUrl }
      : null

  const defaultValues = useMemo<ApplyFormValues>(
    () => ({
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      skills: currentUser?.skills || [],
      experienceLevel: getExperienceLevelFromYears(currentUser?.experienceYears),
      coverLetter: '',
      portfolioUrl: currentUser?.portfolioUrl || '',
    }),
    [currentUser]
  )

  const skillOptions = useMemo(
    () =>
      Array.from(
        new Set([...(job?.skills || []), ...(currentUser?.skills || []), ...candidateSkillOptions])
      ),
    [currentUser?.skills, job?.skills]
  )

  const draftKey = currentUser && job ? buildDraftKey(currentUser.id, job.id) : null

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<ApplyFormValues>({
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const selectedSkills = watch('skills') || []
  const selectedExperienceLevel = watch('experienceLevel') || defaultValues.experienceLevel
  const trimmedSkillQuery = skillQuery.trim()
  const skillSuggestions = trimmedSkillQuery
    ? skillOptions
        .filter(
          skill =>
            !selectedSkills.some(selected => selected.toLowerCase() === skill.toLowerCase()) &&
            skill.toLowerCase().includes(trimmedSkillQuery.toLowerCase())
        )
        .slice(0, 6)
    : []

  const canAddCustomSkill =
    Boolean(trimmedSkillQuery) &&
    !skillOptions.some(skill => skill.toLowerCase() === trimmedSkillQuery.toLowerCase()) &&
    !selectedSkills.some(skill => skill.toLowerCase() === trimmedSkillQuery.toLowerCase())

  const hasResumeReady = Boolean(resumeFile || (useStoredResume && storedResume))
  const activeResumeName = resumeFile?.name || (useStoredResume ? storedResume?.name : '') || ''
  const activeResumeUrl = resumeFile
    ? resumePreviewUrl || ''
    : useStoredResume
      ? storedResume?.url || ''
      : ''
  const resumeSourceLabel = resumeFile
    ? 'New upload selected for this application.'
    : useStoredResume && storedResume
      ? 'Using the resume saved in your candidate profile.'
      : 'Attach a resume before you submit your application.'
  const canSubmit = isValid && hasResumeReady && !resumeError && !isSubmitting

  const updatePreviewUrl = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    if (!file) {
      setResumePreviewUrl(null)
      return
    }

    const nextUrl = URL.createObjectURL(file)
    previewUrlRef.current = nextUrl
    setResumePreviewUrl(nextUrl)
  }

  useEffect(() => {
    register('skills', {
      validate: value => (value && value.length > 0) || 'Select at least one skill.',
    })
    register('experienceLevel', {
      required: 'Choose your experience level.',
    })
  }, [register])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return

    reset(defaultValues)
    setResumeFile(null)
    updatePreviewUrl(null)
    setUseStoredResume(Boolean(storedResume))
    setResumeError('')
    setSubmitError('')
    setSubmitSuccess('')
    setDraftMessage(currentUser ? 'Saved profile details were loaded automatically.' : '')
    setDraftAvailable(Boolean(draftKey && window.localStorage.getItem(draftKey)))
    setConfirmOpen(false)
    setIsSubmitting(false)
    setSkillQuery('')
    setShowSuggestions(false)

    if (!draftKey) return

    const rawDraft = window.localStorage.getItem(draftKey)
    if (!rawDraft) return

    try {
      const parsedDraft = JSON.parse(rawDraft) as ApplicationDraft
      reset({ ...defaultValues, ...parsedDraft.values })
      setUseStoredResume(Boolean(storedResume) && parsedDraft.useStoredResume)
      setDraftAvailable(true)
      setDraftMessage('Draft restored from this device.')

      if (parsedDraft.resume?.dataUrl) {
        const restoredFile = dataUrlToFile(
          parsedDraft.resume.dataUrl,
          parsedDraft.resume.name,
          parsedDraft.resume.type
        )
        setResumeFile(restoredFile)
        setUseStoredResume(false)
        updatePreviewUrl(restoredFile)
      }
    } catch {
      window.localStorage.removeItem(draftKey)
      setDraftAvailable(false)
    }
  }, [currentUser, defaultValues, draftKey, open, reset, storedResume?.name, storedResume?.url])

  useEffect(() => {
    if (!open) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onClose, open])

  const addSkill = (skill: string) => {
    const normalized = skill.trim()
    if (!normalized) return
    setValue('skills', Array.from(new Set([...selectedSkills, normalized])), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setSkillQuery('')
    setShowSuggestions(false)
  }

  const removeSkill = (skill: string) => {
    setValue(
      'skills',
      selectedSkills.filter(selected => selected !== skill),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    )
  }

  const handleSkillKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault()
    if (skillSuggestions[0]) addSkill(skillSuggestions[0])
    else if (canAddCustomSkill) addSkill(trimmedSkillQuery)
  }

  const ensureResumeReady = () => {
    if (resumeFile) {
      const validationError = validateResumeFile(resumeFile)
      if (validationError) {
        setResumeError(validationError)
        return false
      }
    }

    if (!resumeFile && !(useStoredResume && storedResume)) {
      setResumeError('Resume is required.')
      return false
    }

    setResumeError('')
    return true
  }

  const handleResumeSelection = (file: File | null) => {
    if (!file) return
    const validationError = validateResumeFile(file)
    if (validationError) {
      setResumeError(validationError)
      return
    }
    setResumeFile(file)
    setUseStoredResume(false)
    setResumeError('')
    updatePreviewUrl(file)
  }

  const handleResumeRemove = () => {
    if (resumeFile) {
      setResumeFile(null)
      updatePreviewUrl(null)
      if (storedResume) {
        setUseStoredResume(true)
        return
      }
    }
    if (storedResume && useStoredResume) {
      setUseStoredResume(false)
    }
    setResumeError('Resume is required.')
  }

  const handleSaveDraft = async () => {
    if (!draftKey) return

    const draftPayload: ApplicationDraft = {
      savedAt: new Date().toISOString(),
      useStoredResume: Boolean(storedResume) && useStoredResume,
      values: getValues(),
    }

    try {
      if (resumeFile) {
        draftPayload.resume = {
          dataUrl: await readFileAsDataUrl(resumeFile),
          name: resumeFile.name,
          type: resumeFile.type,
        }
      }
      window.localStorage.setItem(draftKey, JSON.stringify(draftPayload))
      setDraftAvailable(true)
      setDraftMessage('Draft saved on this device.')
    } catch {
      setDraftMessage('Unable to save a draft on this device right now.')
    }
  }

  const handleClearDraft = () => {
    if (draftKey) {
      window.localStorage.removeItem(draftKey)
    }
    reset(defaultValues)
    setResumeFile(null)
    updatePreviewUrl(null)
    setUseStoredResume(Boolean(storedResume))
    setResumeError('')
    setSubmitError('')
    setSubmitSuccess('')
    setDraftAvailable(false)
    setDraftMessage('Draft cleared. Saved profile details are back in the form.')
  }

  const handleAutofill = () => {
    reset(defaultValues)
    setResumeFile(null)
    updatePreviewUrl(null)
    setUseStoredResume(Boolean(storedResume))
    setResumeError('')
    setSubmitError('')
    setSubmitSuccess('')
    setDraftMessage('Saved profile details reloaded.')
  }

  const openConfirmation = async () => {
    const formIsReady = await trigger()
    if (formIsReady && ensureResumeReady()) {
      setConfirmOpen(true)
    }
  }

  const onSubmit = handleSubmit(async values => {
    if (!job || !ensureResumeReady()) return
    setConfirmOpen(false)
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    const result = await submitJobApplication({
      jobId: job.id,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      skills: values.skills,
      experienceYears: getExperienceYearsFromLevel(values.experienceLevel),
      coverLetter: values.coverLetter,
      portfolioUrl: values.portfolioUrl,
      availability: 'immediate',
      resumeFile: resumeFile || null,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setSubmitError(result.message)
      return
    }

    if (draftKey) {
      window.localStorage.removeItem(draftKey)
    }

    setDraftAvailable(false)
    setDraftMessage('Draft cleared after submission.')
    setSubmitSuccess('Application submitted successfully.')
    onSuccess?.()
    window.setTimeout(() => onClose(), 1300)
  })

  return (
    <AnimatePresence>
      {open && job && (
        <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSubmitting) onClose()
          }}
        >
            <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={event => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-border bg-card text-foreground shadow-2xl"
          >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Candidate Application
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">{job.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.company} · {job.location} · {formatJobType(job.type)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) onClose()
                }}
                className="rounded-xl border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 px-6 py-6">
              <section className="rounded-3xl border border-border bg-background p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Profile auto-fill is ready</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Name, email, phone, skills, experience, and portfolio are preloaded from
                      your saved candidate profile.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutofill}
                      className="border-border bg-background text-foreground hover:bg-accent/10 hover:text-foreground"
                    >
                      <Sparkles className="h-4 w-4" />
                      Auto-fill
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleSaveDraft()}
                      className="border-border bg-background text-foreground hover:bg-accent/10 hover:text-foreground"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </Button>
                    {draftAvailable && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClearDraft}
                        className="text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                      >
                        Clear Draft
                      </Button>
                    )}
                  </div>
                </div>

                {draftMessage && (
                  <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                    {draftMessage}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-border bg-background p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Candidate Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill the essentials recruiters need to review your profile quickly.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Full Name *
                    </span>
                    <input
                      {...register('fullName', {
                        required: 'Full name is required.',
                        minLength: { value: 2, message: 'Use at least 2 characters.' },
                      })}
                      placeholder="John Doe"
                      className={inputClassName}
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">Email *</span>
                    <input
                      {...register('email', {
                        required: 'Email is required.',
                        pattern: {
                          value: emailPattern,
                          message: 'Enter a valid email address.',
                        },
                      })}
                      type="email"
                      placeholder="john@example.com"
                      className={inputClassName}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Phone Number *
                    </span>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required.',
                        validate: value =>
                          value.replace(/\D/g, '').length >= 10 ||
                          'Enter a valid phone number.',
                      })}
                      placeholder="+1 (555) 123-4567"
                      className={inputClassName}
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </label>
                </div>
              </section>

              <ApplicationSkillPicker
                selectedSkills={selectedSkills}
                skillQuery={skillQuery}
                suggestions={skillSuggestions}
                suggestedSkills={job.skills.slice(0, 3)}
                canAddCustomSkill={canAddCustomSkill}
                showSuggestions={showSuggestions && (skillSuggestions.length > 0 || canAddCustomSkill)}
                skillsError={errors.skills?.message}
                experienceError={errors.experienceLevel?.message}
                selectedExperienceLevel={selectedExperienceLevel}
                onSkillQueryChange={value => {
                  setSkillQuery(value)
                  setShowSuggestions(true)
                }}
                onSkillFocus={() => setShowSuggestions(true)}
                onSkillBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 120)
                }}
                onSkillKeyDown={handleSkillKeyDown}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                onExperienceChange={value =>
                  setValue('experienceLevel', value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />

              <ApplicationResumeUpload
                activeResumeName={activeResumeName}
                activeResumeUrl={activeResumeUrl}
                resumeError={resumeError}
                hasResumeReady={hasResumeReady}
                resumeSourceLabel={resumeSourceLabel}
                onFileSelected={handleResumeSelection}
                onRemove={handleResumeRemove}
              />

              <section className="rounded-3xl border border-border bg-background p-5">
                <h3 className="text-xl font-semibold text-foreground">Portfolio and Cover Letter</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  These are optional, but they help recruiters understand your work.
                </p>

                <div className="mt-5 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Portfolio Link
                    </span>
                    <input
                      {...register('portfolioUrl', {
                        validate: value =>
                          !value.trim() || isValidHttpUrl(value.trim()) || 'Enter a valid URL.',
                      })}
                      type="url"
                      placeholder="https://portfolio.example.com"
                      className={inputClassName}
                    />
                    {errors.portfolioUrl && (
                      <p className="mt-2 text-sm text-destructive">
                        {errors.portfolioUrl.message}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Cover Letter
                    </span>
                    <textarea
                      {...register('coverLetter', {
                        maxLength: {
                          value: 1000,
                          message: 'Keep the cover letter under 1000 characters.',
                        },
                      })}
                      rows={5}
                      placeholder="Share why this requirement fits your skills, interests, or past work."
                      className={`${inputClassName} rounded-3xl`}
                    />
                    {errors.coverLetter && (
                      <p className="mt-2 text-sm text-destructive">
                        {errors.coverLetter.message}
                      </p>
                    )}
                  </label>
                </div>
              </section>

              {submitError && (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {submitSuccess}
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!isSubmitting) onClose()
                  }}
                  className="border-border bg-background text-foreground hover:bg-accent/10 hover:text-foreground"
                >
                  Cancel
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleSaveDraft()}
                    className="border-border bg-background text-foreground hover:bg-accent/10 hover:text-foreground"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => void openConfirmation()}
                    className="h-11 min-w-[180px] rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="px-6 pb-6">
              <ApplicationSidebar
                job={job}
                experienceLevel={selectedExperienceLevel}
                selectedSkillsCount={selectedSkills.length}
                resumeName={activeResumeName}
              />
            </div>
          </motion.div>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit application?</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Are you sure you want to submit your application?
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
                This will send your current form details, selected skills, and attached resume for{' '}
                <span className="font-semibold text-foreground">{job.title}</span>.
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="border-border bg-background text-foreground hover:bg-accent/10 hover:text-foreground"
                >
                  Go Back
                </Button>
                <Button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm Apply'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
