import React, { createContext, useContext, useMemo } from 'react'

type PermissionContextValue = {
  can: (perm: string) => boolean
}

const PermissionContext = createContext<PermissionContextValue | null>(null)

export function PermissionProvider({ children, current }: { children: React.ReactNode; current?: string[] }) {
  const set = useMemo(() => new Set(current ?? ['users:create', 'users:update', 'centers:create', 'centers:update', 'centers:delete', 'centers:read', 'classes:create', 'classes:update', 'classes:delete', 'classes:read']), [current])
  const value = useMemo<PermissionContextValue>(() => ({ can: (p: string) => set.has(p) }), [set])
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermission() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('PermissionProvider missing')
  return ctx
}


