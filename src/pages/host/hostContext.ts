import { useOutletContext } from 'react-router-dom'
import type { Course } from '../../lib/courses'

export interface HostDraft {
  course: Course | null
  day: string
  format: 'stableford' | 'stroke' | 'match' | 'scramble'
  buddiesOnly: boolean
  minHandicap: string
  maxHandicap: string
  autoAccept: boolean
  time: string
  walking: boolean
  fee: string
  notes: string
  teeId: string | null
  womenOnly: boolean
  beginnerFriendly: boolean
}

export type HostCtx = { draft: HostDraft; update: (patch: Partial<HostDraft>) => void }
export const useHost = () => useOutletContext<HostCtx>()
