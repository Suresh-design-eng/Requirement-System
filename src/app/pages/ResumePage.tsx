import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Upload, FileText, CheckCircle, Download, Trash } from 'lucide-react';
import { useState, useRef } from 'react';
import {
  buildResumeAnalysis,
  formatFileSize,
  RESUME_FILE_ACCEPT,
  RESUME_FILE_MAX_SIZE_BYTES,
  validateResumeFile,
} from '../utils/candidate';

export default function ResumePage() {
  const { currentUser, uploadResume, updateUser, jobs } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeAnalysis = buildResumeAnalysis(currentUser, jobs);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setErrorMessage('');
      await uploadResume(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to upload the selected file.'
      );
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveResume = () => {
    if (currentUser && confirm('Are you sure you want to remove your resume?')) {
      updateUser(currentUser.id, {
        resumeUrl: undefined,
        resumeName: undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">My Resume</h1>
          <p className="text-lg text-muted-foreground">
            Upload and manage your resume for job applications
          </p>
        </motion.div>

        {/* Current Resume */}
        {currentUser?.resumeUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Current Resume</h2>
                <p className="text-sm text-muted-foreground">
                  This resume will be used for all job applications
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Active
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <div className="p-4 bg-primary/10 rounded-xl">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">
                  {currentUser.resumeName || 'resume.pdf'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Uploaded on {new Date().toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(currentUser.resumeUrl, '_blank')}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    View File
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveResume}
                    className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium flex items-center gap-2 hover:bg-destructive/20 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                    Remove
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: currentUser?.resumeUrl ? 0.2 : 0.1 }}
          className="bg-card rounded-2xl border border-border p-8"
        >
          <h2 className="text-xl font-semibold mb-6">
            {currentUser?.resumeUrl ? 'Upload New Resume' : 'Upload Resume'}
          </h2>

          {errorMessage && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }`}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={RESUME_FILE_ACCEPT}
              onChange={handleChange}
              className="hidden"
            />

            <motion.div
              animate={{ y: dragActive ? -8 : 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {dragActive ? 'Drop your resume here' : 'Upload your resume'}
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your PDF, DOC, or DOCX file here, or click to browse
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25"
              >
                Choose File
              </motion.button>

              <p className="text-sm text-muted-foreground mt-6">
                PDF, DOC, and DOCX files are accepted. Maximum size{' '}
                {formatFileSize(RESUME_FILE_MAX_SIZE_BYTES)} in the local demo.
              </p>
            </motion.div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-6 rounded-xl bg-muted/30">
            <h3 className="font-semibold mb-3">Resume Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Keep your resume concise and focused (1-2 pages)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Highlight relevant skills and experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Use clear section headings and bullet points</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Proofread for spelling and grammar errors</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: currentUser?.resumeUrl ? 0.25 : 0.15 }}
          className="mt-8 bg-card rounded-2xl border border-border p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Resume Insights</h2>
              <p className="text-sm text-muted-foreground">
                Local analysis based on your saved profile, resume, and open job requirements
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-semibold mb-3">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.extractedSkills.length ? (
                  resumeAnalysis.extractedSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add skills in Settings to improve job matching and profile insights.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-semibold mb-3">Extracted Experience</h3>
              <p className="text-lg font-semibold">{resumeAnalysis.extractedExperience}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Keep this aligned with your profile to improve recruiter confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-semibold mb-3">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.missingSkills.length ? (
                  resumeAnalysis.missingSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold border border-secondary/20"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your current profile already matches the active openings well.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-semibold mb-3">Improvement Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {resumeAnalysis.improvementTips.map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Success Notification */}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Resume uploaded successfully!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
