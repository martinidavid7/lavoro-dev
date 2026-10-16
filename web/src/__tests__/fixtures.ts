import type { JobPosting } from '@/types/jobPosting'

export function jobOf(id = 42, overrides: Partial<JobPosting> = {}): JobPosting {
  return {
    id,
    company: { id: 7, name: 'Acme S.r.l.', logo_url: null },
    title: `Sviluppatore Vue ${id}`,
    description: 'Sviluppo di applicazioni Vue e TypeScript.',
    salary: '42000.00',
    work_mode: 1,
    work_mode_label: 'Da remoto',
    contract_type: 1,
    contract_type_label: 'Tempo indeterminato',
    skills: [{ id: 1, name: 'Vue.js' }],
    published_at: '2026-10-16T12:00:00+02:00',
    created_at: '2026-10-16T12:00:00+02:00',
    updated_at: '2026-10-16T12:00:00+02:00',
    ...overrides,
  }
}
