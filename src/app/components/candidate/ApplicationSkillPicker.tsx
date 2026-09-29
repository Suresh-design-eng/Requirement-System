import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Search, X } from 'lucide-react'
import {
  experienceLevelOptions,
  type ExperienceLevel,
} from '../../utils/candidate'

interface ApplicationSkillPickerProps {
  selectedSkills: string[]
  skillQuery: string
  suggestions: string[]
  suggestedSkills: string[]
  canAddCustomSkill: boolean
  showSuggestions: boolean
  skillsError?: string
  experienceError?: string
  selectedExperienceLevel: ExperienceLevel
  onSkillQueryChange: (value: string) => void
  onSkillFocus: () => void
  onSkillBlur: () => void
  onSkillKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void
  onAddSkill: (skill: string) => void
  onRemoveSkill: (skill: string) => void
  onExperienceChange: (value: ExperienceLevel) => void
}

export default function ApplicationSkillPicker({
  selectedSkills,
  skillQuery,
  suggestions,
  suggestedSkills,
  canAddCustomSkill,
  showSuggestions,
  skillsError,
  experienceError,
  selectedExperienceLevel,
  onSkillQueryChange,
  onSkillFocus,
  onSkillBlur,
  onSkillKeyDown,
  onAddSkill,
  onRemoveSkill,
  onExperienceChange,
}: ApplicationSkillPickerProps) {
  const trimmedSkillQuery = skillQuery.trim()

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Skills and Experience</h3>
          <p className="text-sm text-slate-400">
            Add the strongest match signals for this requirement.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-100">Skills *</span>
            <span className="text-xs text-slate-500">
              Suggested: {suggestedSkills.join(', ') || 'React, Python'}
            </span>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-50"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill)}
                    className="rounded-full text-cyan-100 transition-colors hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}

              <div className="relative min-w-[220px] flex-1">
                <input
                  value={skillQuery}
                  onChange={event => onSkillQueryChange(event.target.value)}
                  onFocus={onSkillFocus}
                  onBlur={onSkillBlur}
                  onKeyDown={onSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="w-full border-0 bg-transparent px-2 py-2 text-white outline-none placeholder:text-slate-500"
                />

                {showSuggestions && (
                  <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full rounded-2xl border border-white/10 bg-[#0c1724] p-2 shadow-2xl">
                    {suggestions.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onMouseDown={event => {
                          event.preventDefault()
                          onAddSkill(skill)
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-white/[0.06]"
                      >
                        <span>{skill}</span>
                        <span className="text-xs text-slate-500">Suggested</span>
                      </button>
                    ))}

                    {canAddCustomSkill && (
                      <button
                        type="button"
                        onMouseDown={event => {
                          event.preventDefault()
                          onAddSkill(trimmedSkillQuery)
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-white/[0.06]"
                      >
                        <span>Add "{trimmedSkillQuery}"</span>
                        <span className="text-xs text-cyan-300">Custom</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {skillsError && <p className="mt-2 text-sm text-rose-300">{skillsError}</p>}
        </div>

        <div>
          <span className="mb-3 block text-sm font-medium text-slate-100">
            Experience Level *
          </span>
          <div className="grid gap-3 md:grid-cols-3">
            {experienceLevelOptions.map(option => {
              const active = selectedExperienceLevel === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onExperienceChange(option.value)}
                  className={`rounded-3xl border px-4 py-4 text-left transition-all ${
                    active
                      ? 'border-cyan-400/40 bg-cyan-400/12 shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/25 hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="text-base font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{option.description}</p>
                </button>
              )
            })}
          </div>

          {experienceError && (
            <p className="mt-2 text-sm text-rose-300">{experienceError}</p>
          )}
        </div>
      </div>
    </section>
  )
}
