import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { CheckCircle, LogOut, Save, Upload, UserRound } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { candidateSkillOptions } from '../../utils/candidate'

interface CandidateSettingsValues {
  name: string
  email: string
  phone: string
  education: string
  location: string
  experienceYears: number
  portfolioUrl: string
  githubUrl: string
  linkedinUrl: string
  expectedSalary: string
  skills: string[]
}

export default function CandidateSettings() {
  const navigate = useNavigate()
  const { currentUser, logout, updateUser } = useApp()
  const [notice, setNotice] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(currentUser?.avatar)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CandidateSettingsValues>({
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      education: currentUser?.education || '',
      location: currentUser?.location || '',
      experienceYears: currentUser?.experienceYears || 0,
      portfolioUrl: currentUser?.portfolioUrl || '',
      githubUrl: currentUser?.githubUrl || '',
      linkedinUrl: currentUser?.linkedinUrl || '',
      expectedSalary: currentUser?.expectedSalary || '',
      skills: currentUser?.skills || [],
    },
  })

  const selectedSkills = watch('skills') || []

  useEffect(() => {
    reset({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      education: currentUser?.education || '',
      location: currentUser?.location || '',
      experienceYears: currentUser?.experienceYears || 0,
      portfolioUrl: currentUser?.portfolioUrl || '',
      githubUrl: currentUser?.githubUrl || '',
      linkedinUrl: currentUser?.linkedinUrl || '',
      expectedSalary: currentUser?.expectedSalary || '',
      skills: currentUser?.skills || [],
    })
    setAvatarDataUrl(currentUser?.avatar)
  }, [currentUser, reset])

  useEffect(() => {
    register('skills')
  }, [register])

  const handleSkillToggle = (skill: string) => {
    const nextSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(item => item !== skill)
      : [...selectedSkills, skill]

    setValue('skills', nextSkills, { shouldValidate: true })
  }

  const handleAvatarSelection = (file: File | null) => {
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarDataUrl(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = handleSubmit(async values => {
    if (!currentUser) {
      return
    }

    updateUser(currentUser.id, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      education: values.education,
      location: values.location,
      experienceYears: Number(values.experienceYears),
      portfolioUrl: values.portfolioUrl,
      githubUrl: values.githubUrl,
      linkedinUrl: values.linkedinUrl,
      expectedSalary: values.expectedSalary,
      skills: values.skills,
      avatar: avatarDataUrl,
    })

    setNotice('Profile updated successfully.')
    window.setTimeout(() => setNotice(''), 2500)
  })

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Candidate Settings
          </p>
          <h1 className="mt-3 text-4xl font-bold lg:text-5xl">Profile & Account Settings</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Keep your candidate profile updated so jobs, applications, and resume analysis stay in
            sync.
          </p>
        </motion.div>

        {notice && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {notice}
            </span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex flex-col items-start gap-5">
              <img
                src={avatarDataUrl}
                alt={currentUser?.name}
                className="h-28 w-28 rounded-3xl border border-primary/20 object-cover"
              />
              <div>
                <h2 className="text-2xl font-semibold">{currentUser?.name}</h2>
                <p className="mt-1 text-muted-foreground">{currentUser?.email}</p>
                <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Candidate
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 font-semibold transition-colors hover:bg-accent/10"
              >
                <Upload className="h-4 w-4" />
                Upload Profile Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => handleAvatarSelection(event.target.files?.[0] || null)}
              />

              <div className="w-full rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-sm font-semibold">Resume Status</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentUser?.resumeName || 'No resume uploaded yet'}
                </p>
                <Link
                  to="/resume"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <UserRound className="h-4 w-4" />
                  Manage Resume
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 font-semibold text-destructive transition-colors hover:bg-destructive/15"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Name *</span>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Email *</span>
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Phone</span>
                  <input
                    {...register('phone')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Experience (Years)</span>
                  <input
                    {...register('experienceYears', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Education</span>
                  <input
                    {...register('education')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Location</span>
                  <input
                    {...register('location')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidateSkillOptions.map(skill => {
                    const active = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Portfolio Link</span>
                  <input
                    {...register('portfolioUrl')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Expected Salary</span>
                  <input
                    {...register('expectedSalary')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">GitHub Link</span>
                  <input
                    {...register('githubUrl')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">LinkedIn Link</span>
                  <input
                    {...register('linkedinUrl')}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
