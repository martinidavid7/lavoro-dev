import { ref } from 'vue'
import { defineStore } from 'pinia'
import { listSkills } from '@/services/skills'
import type { Skill } from '@/types/skill'

/** The skills catalog: a few dozen items, loaded once and shared by every picker. */
export const useSkillsStore = defineStore('skills', () => {
  const items = ref<Skill[]>([])
  let pending: Promise<void> | null = null

  function ensureLoaded() {
    pending ??= listSkills()
      .then((skills) => {
        items.value = skills
      })
      .catch((e) => {
        pending = null
        throw e
      })

    return pending
  }

  function byIds(ids: number[]) {
    return items.value.filter((skill) => ids.includes(skill.id))
  }

  return { items, ensureLoaded, byIds }
})
