import type { Skill } from '@/types/skill'
import { http } from './http'

export async function listSkills() {
  const { data } = await http<{ data: Skill[] }>('/skills')

  return data
}
