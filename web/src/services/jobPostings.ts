import type { Paginated, Resource } from '@/types/api'
import type { JobPosting, JobPostingFilters, JobPostingPayload } from '@/types/jobPosting'
import { http } from './http'

export function listJobPostings(filters: JobPostingFilters = {}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    // Arrays use Laravel's syntax: ?skills[]=1&skills[]=2
    if (Array.isArray(value)) value.forEach((item) => params.append(`${key}[]`, String(item)))
    else if (value !== undefined && value !== '') params.set(key, String(value))
  }

  const query = params.toString()

  return http<Paginated<JobPosting>>(`/job-postings${query ? `?${query}` : ''}`)
}

export async function getJobPosting(id: number) {
  const { data } = await http<Resource<JobPosting>>(`/job-postings/${id}`)

  return data
}

export async function createJobPosting(payload: JobPostingPayload) {
  const { data } = await http<Resource<JobPosting>>('/job-postings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export function deleteJobPosting(id: number) {
  return http<void>(`/job-postings/${id}`, { method: 'DELETE' })
}
