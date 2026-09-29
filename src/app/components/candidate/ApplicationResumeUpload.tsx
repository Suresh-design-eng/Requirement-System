import { useRef } from 'react'
import { Eye, FileUp, Paperclip, Trash2, Upload } from 'lucide-react'
import {
  formatFileSize,
  RESUME_FILE_ACCEPT,
  RESUME_FILE_MAX_SIZE_BYTES,
} from '../../utils/candidate'
import { Button } from '../ui/button'

interface ApplicationResumeUploadProps {
  activeResumeName: string
  activeResumeUrl: string
  resumeError: string
  hasResumeReady: boolean
  resumeSourceLabel: string
  onFileSelected: (file: File | null) => void
  onRemove: () => void
}

export default function ApplicationResumeUpload({
  activeResumeName,
  activeResumeUrl,
  resumeError,
  hasResumeReady,
  resumeSourceLabel,
  onFileSelected,
  onRemove,
}: ApplicationResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
          <Paperclip className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Resume Upload</h3>
          <p className="text-sm text-slate-400">
            Upload a PDF, DOC, or DOCX. The local demo limits files to{' '}
            {formatFileSize(RESUME_FILE_MAX_SIZE_BYTES)}.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block cursor-pointer rounded-[1.75rem] border border-dashed border-cyan-400/25 bg-[linear-gradient(135deg,_rgba(6,182,212,0.10),_rgba(255,255,255,0.02))] p-6 transition-all hover:border-cyan-400/45 hover:bg-[linear-gradient(135deg,_rgba(6,182,212,0.14),_rgba(255,255,255,0.03))]">
          <input
            ref={inputRef}
            type="file"
            accept={RESUME_FILE_ACCEPT}
            className="hidden"
            onChange={event => {
              onFileSelected(event.target.files?.[0] || null)
              event.currentTarget.value = ''
            }}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-3xl bg-cyan-400/15 p-4 text-cyan-100">
              <Upload className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-semibold text-white">
              {activeResumeName || 'Choose Resume File'}
            </p>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Click to browse and attach a resume, or replace the saved file from your profile.
            </p>
          </div>
        </label>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/[0.06] p-3 text-cyan-100">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  {activeResumeName || 'No resume attached yet'}
                </p>
                <p className="mt-1 text-sm text-slate-400">{resumeSourceLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06] hover:text-white"
              >
                Replace File
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeResumeUrl) {
                    window.open(activeResumeUrl, '_blank', 'noopener,noreferrer')
                  }
                }}
                disabled={!activeResumeUrl}
                className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06] hover:text-white"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onRemove}
                className="text-rose-200 hover:bg-rose-400/10 hover:text-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {!hasResumeReady && !resumeError && (
          <p className="text-sm text-slate-400">
            A resume is required before you can submit the application.
          </p>
        )}
        {resumeError && <p className="text-sm text-rose-300">{resumeError}</p>}
      </div>
    </section>
  )
}
