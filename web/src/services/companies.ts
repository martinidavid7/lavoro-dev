import type { Resource } from '@/types/api'
import type { Company, CompanyProfilePayload } from '@/types/company'
import { http } from './http'

export async function getCompany(id: number) {
  const { data } = await http<Resource<Company>>(`/companies/${id}`)

  return data
}

/** Updates the logged in company's profile. */
export async function updateCompanyProfile(payload: CompanyProfilePayload) {
  const { data } = await http<Resource<Company>>('/company-profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return data
}

export async function uploadCompanyLogo(file: File) {
  const body = new FormData()
  body.append('logo', file)

  const { data } = await http<Resource<Company>>('/company-profile/logo', { method: 'POST', body })

  return data
}

export async function deleteCompanyLogo() {
  const { data } = await http<Resource<Company>>('/company-profile/logo', { method: 'DELETE' })

  return data
}
