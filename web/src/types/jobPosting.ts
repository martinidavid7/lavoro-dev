/** Values mirror the App\Enums\WorkMode and App\Enums\ContractType enums of the API. */
export type WorkMode = 1 | 2 | 3
export type ContractType = 1 | 2 | 3 | 4

export const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 1, label: 'Da remoto' },
  { value: 2, label: 'In sede' },
  { value: 3, label: 'Ibrido' },
]

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 1, label: 'Tempo indeterminato' },
  { value: 2, label: 'Tempo determinato' },
  { value: 3, label: 'Partita IVA' },
  { value: 4, label: 'Stage' },
]

export interface JobPosting {
  id: number
  company: { id: number; name: string }
  title: string
  description: string
  salary: string
  work_mode: WorkMode
  work_mode_label: string
  contract_type: ContractType
  contract_type_label: string
  published_at: string
  created_at: string
  updated_at: string
}

export interface JobPostingPayload {
  title: string
  description: string
  salary: number
  work_mode: WorkMode
  contract_type: ContractType
}

export interface JobPostingFilters {
  title?: string
  work_mode?: WorkMode
  contract_type?: ContractType
  /** Id of the company that published the job postings. */
  company?: number
  page?: number
}
