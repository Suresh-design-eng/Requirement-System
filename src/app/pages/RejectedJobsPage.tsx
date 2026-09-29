import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import { XCircle, MapPin, Briefcase, Calendar, ArrowRight } from 'lucide-react';

export default function RejectedJobsPage() {
  const { jobs, applications, currentUser } = useApp();

  const rejectedApplications = applications.filter(
    app => app.userId === currentUser?.id && app.status === 'rejected'
  );

  const appliedApplications = applications.filter(
    app => app.userId === currentUser?.id && (app.status === 'applied' || app.status === 'interview_scheduled')
  );

  const getJob = (jobId: string) => jobs.find(j => j.id === jobId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">My Applications</h1>
          <p className="text-lg text-muted-foreground">
            Track the status of your job applications
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <Link to="/applications">
            <div className="px-6 py-3 bg-card hover:bg-muted rounded-xl font-semibold border border-border transition-colors">
              Applied ({appliedApplications.length})
            </div>
          </Link>
          <Link to="/applications/rejected">
            <div className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-semibold border border-red-500/20">
              Rejected ({rejectedApplications.length})
            </div>
          </Link>
        </motion.div>

        {/* Rejected List */}
        {rejectedApplications.length > 0 ? (
          <div className="space-y-6">
            {rejectedApplications.map((application, index) => {
              const job = getJob(application.jobId);
              if (!job) return null;

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  <div className="relative bg-card rounded-2xl border border-border group-hover:border-red-500/30 transition-all p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.department}</p>
                          </div>
                          <div className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Not Interested
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground capitalize">{job.type.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Rejected {new Date(application.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Link to={`/jobs/${job.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            View Job Details
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 bg-card rounded-2xl border border-border"
          >
            <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Rejected Applications</h3>
            <p className="text-muted-foreground">
              You haven't marked any jobs as not interested yet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
