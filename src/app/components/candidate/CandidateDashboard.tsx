import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  Bell,
  Briefcase,
  CheckCircle,
  FileText,
  MapPin,
  Pencil,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  buildResumeAnalysis,
  getApplicationStatusMeta,
  getCandidateNotifications,
  getProfileCompletion,
  getRecommendedJobs,
} from '../../utils/candidate'

export default function CandidateDashboard() {
  const { currentUser, jobs, applications, updateUser } = useApp()
  const [avatarNotice, setAvatarNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const resumeAnalysis = useMemo(
    () => buildResumeAnalysis(currentUser, jobs),
    [currentUser, jobs]
  )

  const recommendedJobs = useMemo(
    () => getRecommendedJobs(jobs, currentUser, applications).slice(0, 3),
    [applications, currentUser, jobs]
  )

  const notifications = useMemo(
    () => getCandidateNotifications(currentUser, jobs, applications),
    [applications, currentUser, jobs]
  )

  const stats = [
    {
      label: 'Profile Completion',
      value: `${getProfileCompletion(currentUser)}%`,
      link: '/settings',
    },
    {
      label: 'Applications Sent',
      value: String(candidateApplications.length),
      link: '/applications',
    },
    {
      label: 'Open Jobs',
      value: String(jobs.length),
      link: '/jobs',
    },
    {
      label: 'Resume Ready',
      value: currentUser?.resumeName ? 'Yes' : 'No',
      link: '/resume',
    },
  ]

  const handleAvatarUpload = (file: File | null) => {
    if (!file || !currentUser) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateUser(currentUser.id, {
        avatar: String(reader.result),
      })
      setAvatarNotice('Profile photo updated successfully.')
      window.setTimeout(() => setAvatarNotice(''), 2500)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30 p-8 text-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-border pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-2">
            Candidate Dashboard
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your profile, track applications, review resume insights, and discover recommended jobs.
          </p>
        </div>

        <dl className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 bg-card rounded border border-border">
              <dt className="text-sm font-medium text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-foreground">{stat.value}</dd>
              <Link to={stat.link} className="block mt-2 text-primary hover:underline text-sm font-medium">View Details</Link>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="mb-6 p-6 border border-border rounded-lg bg-card">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="h-32 w-32 rounded-full border-4 border-border object-cover mb-4 mx-auto lg:mx-0"
              />
              <div className="text-center lg:text-left space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full lg:w-auto bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Photo
                </button>
                <Link to="/settings" className="block w-full lg:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                  Edit Profile
                </Link>
              </div>
              {avatarNotice && <p className="text-sm text-green-600 mt-2 text-center lg:text-left">{avatarNotice}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => handleAvatarUpload(event.target.files?.[0] || null)}
              />
            </div>
            <div>
              <table className="w-full table-auto border-separate border-spacing-0">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right min-w-[120px]">Name:</td>
                    <td className="py-4 font-semibold text-foreground">{currentUser?.name || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Email:</td>
                    <td className="py-4 font-semibold text-foreground">{currentUser?.email || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Phone:</td>
                    <td className="py-4 font-semibold text-foreground">{currentUser?.phone || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Experience:</td>
                    <td className="py-4 font-semibold text-foreground">
                      {typeof currentUser?.experienceYears === 'number'
                        ? `${currentUser.experienceYears} years`
                        : 'Not set'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Education:</td>
                    <td className="py-4 font-semibold text-foreground">{currentUser?.education || 'Not set'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Location:</td>
                    <td className="py-4 font-semibold text-foreground">{currentUser?.location || 'Not set'}</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="py-4 pr-6 font-medium text-muted-foreground text-right">Skills:</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentUser?.skills?.length ? (
                          currentUser.skills.map(skill => (
                            <span
                              key={skill}
                              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic">No skills added yet</span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

          <section className="border border-border p-6 rounded-lg bg-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </h2>
            <p className="text-muted-foreground mb-4">Application updates and new matching roles</p>
            <ul className="space-y-3">
              {notifications.map(notification => (
                <li key={notification.id} className="border-b border-border pb-3 last:border-b-0">
                  <Link to={notification.link || '/dashboard'} className="block hover:bg-accent/10 p-3 rounded -m-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                        {new Date(notification.date).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="border border-border p-6 rounded-lg bg-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Resume Insights
            </h2>
            <p className="text-muted-foreground mb-6">Extracted strengths and improvement opportunities</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 border border-border rounded-lg bg-background">
                <h3 className="font-semibold mb-3">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.extractedSkills.length ? (
                    resumeAnalysis.extractedSkills.map(skill => (
                      <span key={skill} className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-sm font-medium border border-emerald-500/20">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No skills detected yet.</p>
                  )}
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background">
                <h3 className="font-semibold mb-3">Extracted Experience</h3>
                <p className="text-2xl font-bold text-foreground">{resumeAnalysis.extractedExperience}</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background">
                <h3 className="font-semibold mb-3">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.missingSkills.length ? (
                    resumeAnalysis.missingSkills.map(skill => (
                      <span key={skill} className="bg-secondary/10 text-secondary px-2 py-1 rounded text-sm font-medium border border-secondary/20">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-green-600 font-medium">You match current hiring needs well.</p>
                  )}
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background">
                <h3 className="font-semibold mb-3">Improvement Tips</h3>
                <ul className="space-y-2">
                  {resumeAnalysis.improvementTips.map(tip => (
                    <li key={tip} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link to="/resume" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              <FileText className="h-4 w-4" />
              Manage Resume
            </Link>
          </section>

            <section className="border border-border p-6 rounded-lg bg-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Recommended Jobs</h2>
                    <p className="text-muted-foreground">Based on your profile, skills, and activity</p>
                  </div>
                </div>
                <Link to="/jobs" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Browse All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Job Title</th>
                      <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Company</th>
                      <th className="border border-border px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">Skills</th>
                      <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Location</th>
                      <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendedJobs.map(job => (
                      <tr key={job.id} className="hover:bg-accent/5 transition-colors">
                        <td className="border border-border px-4 py-4 font-semibold">
                          <Link to={`/jobs/${job.id}`} className="text-primary hover:underline">
                            {job.title}
                          </Link>
                        </td>
                        <td className="border border-border px-4 py-4">
                          {job.company} · {job.adminName}
                        </td>
                        <td className="border border-border px-4 py-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs border border-primary/20">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {job.location}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-4 font-medium">{job.experienceYearsRequired}+ years</td>
                      </tr>
                    ))}
                    {recommendedJobs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-border px-8 py-12 text-center text-muted-foreground">
                          No recommended jobs at the moment. <Link to="/jobs" className="underline">Browse all jobs</Link>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        <section className="p-6 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserRound className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold">Recent Applications</h2>
            </div>
            <Link to="/applications" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              View All
            </Link>
          </div>
          <p className="text-muted-foreground mb-6">Track the latest movement in your candidate pipeline</p>
          {candidateApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Job Title</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Applied Date</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateApplications.slice(0, 6).map(application => {
                    const job = jobs.find(item => item.id === application.jobId)
                    const statusMeta = getApplicationStatusMeta(application.status)
                    return (
                      <tr key={application.id} className="hover:bg-accent/5 transition-colors">
                        <td className="border border-border px-4 py-4">
                          <Link to="/applications" className="font-semibold text-primary hover:underline block">
                            {job?.title || 'Unknown Job'}
                          </Link>
                        </td>
                        <td className="border border-border px-4 py-4 text-sm text-muted-foreground">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="border border-border px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.badgeClassName}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-background">
              <UserRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start applying to recommended roles to build your pipeline.
              </p>
              <Link to="/jobs" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all">
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
