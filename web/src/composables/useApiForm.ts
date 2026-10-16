import { ref } from 'vue'
import { ApiError } from '@/services/http'
import { useNotificationsStore } from '@/stores/notifications'
import type { ValidationErrors } from '@/types/api'

/**
 * Submission state for a form backed by the API: the submitting flag, the
 * per-field errors of a 422 response and the error notifications.
 *
 * @param errorTitle notification title for errors that are not validation errors
 */
export function useApiForm(errorTitle: string) {
  const notifications = useNotificationsStore()

  const errors = ref<ValidationErrors>({})
  const submitting = ref(false)

  /** Runs the request; resolves to its result, or to undefined if it failed. */
  async function submit<T>(request: () => Promise<T>): Promise<T | undefined> {
    submitting.value = true
    errors.value = {}

    try {
      return await request()
    } catch (e) {
      if (e instanceof ApiError && e.isValidation) {
        errors.value = e.errors
        notifications.error('Controlla i campi evidenziati')
      } else {
        notifications.error(errorTitle, e instanceof Error ? e.message : undefined)
      }

      return undefined
    } finally {
      submitting.value = false
    }
  }

  return { errors, submitting, submit }
}
