/** Values mirror the App\Enums\UserRole enum of the API. */
export type UserRole = 'company' | 'candidate'

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'candidate', label: 'Candidato', description: 'Cerco lavoro nel settore tech' },
  { value: 'company', label: 'Azienda', description: 'Voglio pubblicare offerte di lavoro' },
]

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  role_label: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: UserRole
}
