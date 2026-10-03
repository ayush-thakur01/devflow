import { create } from 'zustand'

const useToastStore = create<{
  toasts: Array<{ id: number; message: string; type: string }>
  addToast: (message: string, type?: string, duration?: number) => void
  removeToast: (id: number) => void
}>()((set) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export default useToastStore
