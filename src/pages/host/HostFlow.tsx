import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { upcomingDays } from '../../lib/format'
import type { HostCtx, HostDraft } from './hostContext'

// Holds the draft across the two hosting steps.
export function HostFlow() {
  const [draft, setDraft] = useState<HostDraft>(() => ({
    course: null,
    day: upcomingDays(1)[0].key,
    format: 'stableford',
    buddiesOnly: false,
    minHandicap: '',
    maxHandicap: '',
    autoAccept: false,
    time: '',
    walking: false,
    fee: '',
    notes: '',
    teeId: null,
  }))
  const ctx: HostCtx = { draft, update: (patch) => setDraft((d) => ({ ...d, ...patch })) }
  return <Outlet context={ctx} />
}
