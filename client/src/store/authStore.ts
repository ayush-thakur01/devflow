import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create<{
  token: string | null
  user: Record<string, unknown> | null
  setCredentials: (user: Record<string, unknown>, token: string) => void
  logout: () => void
}>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setCredentials: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'devflow-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
