import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { jobOf } from '@/__tests__/fixtures'
import { MAX_COMPARED_JOBS, useComparisonStore } from '../comparison'

describe('comparison store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('toggles job postings, up to three', () => {
    const comparison = useComparisonStore()

    for (const id of [1, 2, 3, 4]) comparison.toggle(jobOf(id))

    expect(comparison.jobs.map((job) => job.id)).toEqual([1, 2, 3])
    expect(comparison.jobs).toHaveLength(MAX_COMPARED_JOBS)
    expect(comparison.isFull).toBe(true)

    comparison.toggle(jobOf(2))

    expect(comparison.isSelected(2)).toBe(false)
    expect(comparison.isFull).toBe(false)
  })

  it('removes one job posting or clears the selection', () => {
    const comparison = useComparisonStore()
    comparison.toggle(jobOf(1))
    comparison.toggle(jobOf(2))

    comparison.remove(1)
    expect(comparison.jobs.map((job) => job.id)).toEqual([2])

    comparison.clear()
    expect(comparison.jobs).toEqual([])
  })
})
