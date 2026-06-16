import { create } from 'zustand'
import { User, Company } from '@/types'

interface AuthState {
  user: User | null
  company: Company | null
  setUser: (user: User | null) => void
  setCompany: (company: Company | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  company: null,
  setUser: (user) => set({ user }),
  setCompany: (company) => set({ company }),
}))
