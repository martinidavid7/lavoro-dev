import type { Resource } from '@/types/api'
import type { Application, ApplicationCounts, ApplicationStatus } from '@/types/application'
import { saveFile } from '@/utils/saveFile'
import { download, http } from './http'

/** The candidate applies, sending the CV in their profile. */
export async function applyToJob(jobPostingId: number, coverLetter: string | null) {
  const { data } = await http<Resource<Application>>(`/job-postings/${jobPostingId}/applications`, {
    method: 'POST',
    body: JSON.stringify({ cover_letter: coverLetter }),
  })

  return data
}

/** The logged in candidate's applications. */
export async function listMyApplications() {
  const { data } = await http<{ data: Application[] }>('/applications')

  return data
}

export function withdrawApplication(id: number) {
  return http<void>(`/applications/${id}`, { method: 'DELETE' })
}

/** The applicants of a job posting (company only), optionally filtered by status. */
export function listJobApplications(jobPostingId: number, status?: ApplicationStatus) {
  const query = status ? `?status=${status}` : ''

  return http<{ data: Application[]; meta: { counts: ApplicationCounts } }>(
    `/job-postings/${jobPostingId}/applications${query}`,
  )
}

export async function updateApplicationStatus(id: number, status: ApplicationStatus) {
  const { data } = await http<Resource<Application>>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  return data
}

/** Downloads the CV sent with an application. */
export async function downloadApplicationCv(application: Pick<Application, 'id' | 'cv_name'>) {
  const { blob, filename } = await download(`/applications/${application.id}/cv`)

  saveFile(blob, filename ?? application.cv_name)
}
