import { motion } from 'motion/react';
import { useParams, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import ApplyForm from '../components/candidate/ApplyForm';
import { formatJobType, getApplicationStatusMeta } from '../utils/candidate';

export default function JobDetailPage() {
  const { id } = useParams();
  const { jobs, applications, rejectJob, currentUser } = useApp();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);

  const job = jobs.find(j => j.id === id);
  const application = applications.find(
    app => app.jobId === id && app.userId === currentUser?.id
  );
  const statusMeta = application ? getApplicationStatusMeta(application.status) : null;

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Link to="/jobs">
            <button className="px-6 py-3 bg-primary text-white rounded-xl">
              Back to Jobs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const hasResume = currentUser?.resumeUrl;

  const handleApply = () => {
    if (!currentUser) {
      return;
    }

    setShowApplyForm(true);
  };

  const handleReject = () => {
    if (job.id) {
      rejectJob(job.id);
      setShowRejectSuccess(true);
      setTimeout(() => setShowRejectSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Back Button */}
        <Link to="/jobs">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </motion.button>
        </Link>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{job.title}</h1>
              <p className="text-lg text-muted-foreground">
                {job.company} · {job.department} · Posted by {job.adminName}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold capitalize">
              {formatJobType(job.type)}
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-6">{job.description}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
                <p className="font-medium">{job.salary}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Posted</p>
                <p className="font-medium">{new Date(job.postedDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Calendar className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-8 mb-6"
        >
          <h2 className="text-xl font-semibold mb-6">Requirements</h2>
          <ul className="space-y-3">
            {job.requirements.map((req, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{req}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Application Status or Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-8"
        >
          {application ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">Application Status</h2>
              {statusMeta && (
                <div className={`p-6 rounded-xl border ${statusMeta.badgeClassName}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-background/70 rounded-xl">
                      {application.status === 'rejected' ? (
                        <XCircle className="w-6 h-6 text-destructive" />
                      ) : application.status === 'interview_scheduled' ? (
                        <Calendar className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{statusMeta.label}</h3>
                      <p className="text-muted-foreground mb-1">
                        Updated on{' '}
                        {new Date(
                          application.lastUpdatedAt || application.appliedDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{statusMeta.summary}</p>

                      {application.status === 'interview_scheduled' &&
                        application.interviewDate && (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Interview scheduled for{' '}
                            {new Date(application.interviewDate).toLocaleString()}
                          </p>
                        )}

                      {application.status === 'interview_scheduled' &&
                        application.interviewType === 'online' &&
                        application.interviewLink && (
                          <a
                            href={application.interviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                          >
                            Join Video Call
                          </a>
                        )}

                      {application.status === 'interview_scheduled' &&
                        application.interviewType === 'offline' &&
                        application.interviewLocation && (
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>Location: {application.interviewLocation}</span>
                          </div>
                        )}

                      {application.status === 'rejected' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowApplyForm(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Submit New Application
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6">Apply for this Position</h2>

              {!currentUser && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary mb-1">Sign in to continue</p>
                    <p className="text-sm text-muted-foreground">
                      <Link to="/login" className="text-primary hover:underline">
                        Login
                      </Link>{' '}
                      to apply for this role or save it as not interested.
                    </p>
                  </div>
                </div>
              )}

              {currentUser && !hasResume && (
                <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-500 mb-1">Resume Required</p>
                    <p className="text-sm text-muted-foreground">
                      You can upload a PDF resume directly in the application form or manage it on the{' '}
                      <Link to="/resume" className="text-primary hover:underline">
                        Resume page
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: currentUser ? 1.02 : 1 }}
                  whileTap={{ scale: currentUser ? 0.98 : 1 }}
                  onClick={handleApply}
                  disabled={!currentUser}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Apply Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: currentUser ? 1.02 : 1 }}
                  whileTap={{ scale: currentUser ? 0.98 : 1 }}
                  onClick={handleReject}
                  disabled={!currentUser}
                  className="flex-1 px-6 py-4 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Not Interested
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Success Notifications */}
        {showApplySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Application submitted successfully!</span>
          </motion.div>
        )}

        {showRejectSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-card border border-border px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
          >
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Job marked as not interested</span>
          </motion.div>
        )}

        <ApplyForm
          job={job}
          open={showApplyForm}
          onClose={() => setShowApplyForm(false)}
          onSuccess={() => {
            setShowApplySuccess(true);
            window.setTimeout(() => setShowApplySuccess(false), 3000);
          }}
        />
      </div>
    </div>
  );
}
