import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MapPin, Briefcase, Calendar, Navigation } from 'lucide-react';
import { useState } from 'react';

export default function MapPage() {
  const { jobs, applications, currentUser } = useApp();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const jobLocations = jobs.filter(job => job.lat && job.lng);

  const interviews = applications
    .filter(app => app.status === 'interview_scheduled' && app.userId === currentUser?.id)
    .map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return { ...app, job };
    })
    .filter(item => item.job?.lat && item.job?.lng);

  const selected = selectedJob
    ? jobLocations.find(j => j.id === selectedJob) || interviews.find(i => i.job?.id === selectedJob)?.job
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Location Map</h1>
          <p className="text-lg text-muted-foreground">
            View job locations and interview venues
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 h-[600px] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
              {/* Decorative map background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Mock Map with Markers */}
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full h-full max-w-3xl max-h-[500px]">
                {/* USA Map Outline (simplified) */}
                <svg viewBox="0 0 800 500" className="w-full h-full opacity-20">
                  <path
                    d="M100,250 Q200,200 300,250 T500,250 Q600,250 700,300 L700,400 Q600,450 500,400 Q400,350 300,400 Q200,450 100,400 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>

                {/* Location Markers */}
                {jobLocations.map((job, index) => {
                  const x = ((job.lng || 0) + 125) * 3.2;
                  const y = (50 - (job.lat || 0)) * 7;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`
                      }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedJob(job.id)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className={`relative ${
                          selectedJob === job.id ? 'z-10' : 'z-0'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                            selectedJob === job.id
                              ? 'bg-primary scale-125'
                              : 'bg-primary/80 group-hover:bg-primary'
                          }`}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="px-3 py-2 bg-card border border-border rounded-lg shadow-xl whitespace-nowrap text-sm font-medium">
                            {job.title}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Interview Markers */}
                {interviews.map((interview, index) => {
                  if (!interview.job?.lat || !interview.job?.lng) return null;
                  const x = ((interview.job.lng || 0) + 125) * 3.2;
                  const y = (50 - (interview.job.lat || 0)) * 7;

                  return (
                    <motion.div
                      key={interview.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (jobLocations.length + index) * 0.1 }}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`
                      }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedJob(interview.job?.id || null)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative z-20"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">Job Location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">Interview Scheduled</span>
              </div>
            </div>
          </motion.div>

          {/* Location Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Selected Location */}
            {selected ? (
              <div className="bg-card rounded-2xl border border-primary/50 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{selected.title}</h3>
                    <p className="text-sm text-muted-foreground">{selected.department}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1" />
                    <span className="text-sm">{selected.location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-primary mt-1" />
                    <span className="text-sm">
                      Coordinates: {selected.lat?.toFixed(4)}, {selected.lng?.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click on a marker to view location details
                </p>
              </div>
            )}

            {/* All Locations List */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">All Locations</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {jobLocations.map((job) => (
                  <motion.div
                    key={job.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedJob(job.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedJob === job.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
