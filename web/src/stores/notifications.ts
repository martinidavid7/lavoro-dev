import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  description?: string
}

const DURATION_MS = 4000

let nextId = 0

/** Queue of notifications (toasts) rendered by ToastContainer. */
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])

  function remove(id: number) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function notify(type: NotificationType, title: string, description?: string) {
    const id = ++nextId

    items.value.push({ id, type, title, description })
    setTimeout(() => remove(id), DURATION_MS)
  }

  return {
    items,
    remove,
    success: (title: string, description?: string) => notify('success', title, description),
    error: (title: string, description?: string) => notify('error', title, description),
  }
})
