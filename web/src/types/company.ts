/** Values mirror the App\Enums\CompanySize enum of the API. */
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

export const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1-10 dipendenti' },
  { value: '11-50', label: '11-50 dipendenti' },
  { value: '51-200', label: '51-200 dipendenti' },
  { value: '201-500', label: '201-500 dipendenti' },
  { value: '500+', label: 'Oltre 500 dipendenti' },
]

/** Public page of a company. Profile fields stay null until the company fills them in. */
export interface Company {
  id: number
  name: string
  description: string | null
  sector: string | null
  city: string | null
  size: CompanySize | null
  size_label: string | null
  website: string | null
  contact_email: string | null
  phone: string | null
  logo_url: string | null
  job_postings_count: number
}

export interface CompanyProfilePayload {
  name: string
  description: string | null
  sector: string | null
  city: string | null
  size: CompanySize | null
  website: string | null
  contact_email: string | null
  phone: string | null
}
