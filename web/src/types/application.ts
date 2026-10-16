import type { Skill } from './skill'

/** Values mirror the App\Enums\ApplicationStatus enum of the API. */
export type ApplicationStatus = 'in_review' | 'interview' | 'rejected' | 'hired'

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'in_review', label: 'In valutazione' },
  { value: 'interview', label: 'Colloquio' },
  { value: 'rejected', label: 'Non selezionato' },
  { value: 'hired', label: 'Assunto' },
]

/** The applicant, as the company sees them. */
export interface Applicant {
  id: number
  name: string
  email: string
  phone: string | null
  city: string | null
  headline: string | null
  experience_years: number | null
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  skills: Skill[]
}

export interface Application {
  id: number
  status: ApplicationStatus
  status_label: string
  status_changed_at: string | null
  cover_letter: string | null
  cv_name: string
  created_at: string
  /** In the candidate's list. */
  job_posting?: {
    id: number
    title: string
    company: { id: number; name: string; logo_url: string | null }
  }
  /** In the company's list. */
  candidate?: Applicant
}

/** How many applications a job posting has in each status, plus the total. */
export type ApplicationCounts = Record<ApplicationStatus | 'all', number>
