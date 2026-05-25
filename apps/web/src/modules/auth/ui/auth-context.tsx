import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { LoginUserResponse } from '@proyecto-daw/shared'

import { getMe, logoutUser } from '../server/api'

type AuthUser = LoginUserResponse['user']
type AuthStatus = 'loading' | 'authenticated' | 'guest'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  setUser: (user: AuthUser | null) => void
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser)
    setStatus(nextUser ? 'authenticated' : 'guest')
  }, [])

  const refresh = useCallback(async () => {
    setStatus('loading')
    const me = await getMe()
    setUser(me?.user ?? null)
  }, [setUser])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }, [setUser])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      setUser,
      refresh,
      logout,
    }),
    [refresh, logout, setUser, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
