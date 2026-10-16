import type { Skill } from './skill'

/** The logged in candidate's profile. Fields stay null until the candidate fills them in. */
export interface CandidateProfile {
  id: number
  name: string
  email: string
  phone: string | null
  city: string | null
  headline: string | null
  experience_years: number | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  photo_url: string | null
  cv: { name: string; updated_at: string } | null
  skills: Skill[]
}

export interface CandidateProfilePayload {
  name: string
  phone: string | null
  city: string | null
  headline: string | null
  experience_years: number | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  /** Ids of the candidate's skills; replaces the current list. */
  skills: number[]
}
