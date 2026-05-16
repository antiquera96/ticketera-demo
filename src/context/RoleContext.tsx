import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Role } from '../types'

interface RoleApi {
  role: Role
  setRole: (r: Role) => void
}

const ROLE_KEY = 'ticketera_role_v1'
const RoleContext = createContext<RoleApi | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const raw = localStorage.getItem(ROLE_KEY)
      if (raw === 'productor' || raw === 'comprador' || raw === 'control')
        return raw
    } catch {
      /* noop */
    }
    return 'comprador'
  })

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_KEY, role)
    } catch {
      /* noop */
    }
  }, [role])

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleState }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleApi {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside RoleProvider')
  return ctx
}
