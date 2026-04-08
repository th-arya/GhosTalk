'use client'

import { useGhostAuth } from '@/lib/useGhostAuth'
import { Badge } from '@/components/ui/badge'

export function GhostIdentityBadge() {
  const { ghostName, loading } = useGhostAuth()

  if (loading) return null

  return (
    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium border-border/40 bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors">
      <span className="mr-2">👻</span>
      {ghostName || 'Unknown Ghost'}
    </Badge>
  )
}
