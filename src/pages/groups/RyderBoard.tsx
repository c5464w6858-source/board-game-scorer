import { Link } from 'react-router-dom'
import { glassCard } from '../../components/surfaces'
import { firstName } from '../../lib/format'
import type { GroupRow } from '../../lib/groups'
import { formatLabel, points, type Match, type MatchState } from '../../lib/ryder'

export type MatchView = Match & { state: MatchState }

const names = (g: GroupRow, ids: string[], me: string) =>
  ids.map((id) => (id === me ? 'You' : firstName(g.group_members.find((m) => m.user_id === id)?.profile?.display_name ?? null))).join(' & ')

// One match: the two sides, coloured by who's ahead, and the live state.
export function MatchRow({ g, m, me, to }: { g: GroupRow; m: MatchView; me: string; to?: string }) {
  const lead = m.state.up > 0 ? 'a' : m.state.up < 0 ? 'b' : null
  const side = (s: 'a' | 'b') => {
    const won = m.state.winner === s
    const ahead = !m.state.finished && lead === s
    const tone = won
      ? s === 'a' ? 'bg-team-blue text-white' : 'bg-team-red text-white'
      : ahead
        ? s === 'a' ? 'bg-team-blue/12 text-team-blue' : 'bg-team-red/12 text-team-red'
        : 'text-navy'
    return (
      <span className={`min-w-0 flex-1 truncate rounded-xl px-2.5 py-2 text-[14px] font-semibold ${tone} ${s === 'b' ? 'text-right' : ''}`}>
        {names(g, s === 'a' ? m.side_a : m.side_b, me)}
      </span>
    )
  }
  const body = (
    <>
      <div className="flex items-center gap-2">
        {side('a')}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-center font-mono text-[12px] font-semibold ${
            m.state.winner === 'halved' ? 'bg-gold-soft text-[#6B5A2E]' : lead === 'a' ? 'bg-team-blue text-white' : lead === 'b' ? 'bg-team-red text-white' : 'bg-cream text-muted'
          }`}
        >
          {m.state.label}
        </span>
        {side('b')}
      </div>
      <div className="mt-1 text-center text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">{formatLabel(m.format)}</div>
    </>
  )
  return to ? (
    <Link to={to} className="block px-3 py-2.5 no-underline">
      {body}
    </Link>
  ) : (
    <div className="px-3 py-2.5">{body}</div>
  )
}

// The big Ryder Cup score: points won, points still live and what wins it.
export function RyderScore({ g, matches }: { g: GroupRow; matches: MatchView[] }) {
  const a = matches.reduce((n, m) => n + m.state.pointsA, 0)
  const b = matches.reduce((n, m) => n + m.state.pointsB, 0)
  const live = matches.filter((m) => m.state.thru && !m.state.finished)
  const liveA = live.filter((m) => m.state.up > 0).length + live.filter((m) => m.state.up === 0).length / 2
  const liveB = live.filter((m) => m.state.up < 0).length + live.filter((m) => m.state.up === 0).length / 2
  const toWin = matches.length / 2 + 0.5
  const total = Math.max(1, matches.length)
  const winner = a >= toWin ? g.team_a_name : b >= toWin ? g.team_b_name : null
  return (
    <div className={`${glassCard} overflow-hidden text-navy`}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-navy px-4 py-4 text-white">
        <div>
          <div className="truncate text-[13px] font-semibold text-[#8FB2F0]">{g.team_a_name}</div>
          <div className="font-mono text-[44px] leading-none font-semibold">{points(a)}</div>
        </div>
        <div className="text-center text-[12px] font-semibold text-gold uppercase">{winner ? 'Winners' : 'v'}</div>
        <div className="text-right">
          <div className="truncate text-[13px] font-semibold text-[#F08F94]">{g.team_b_name}</div>
          <div className="font-mono text-[44px] leading-none font-semibold">{points(b)}</div>
        </div>
      </div>
      <div className="flex h-2.5">
        <span className="bg-team-blue" style={{ width: `${(a / total) * 100}%` }} />
        <span className="bg-team-blue/35" style={{ width: `${(liveA / total) * 100}%` }} />
        <span className="flex-1 bg-cream" />
        <span className="bg-team-red/35" style={{ width: `${(liveB / total) * 100}%` }} />
        <span className="bg-team-red" style={{ width: `${(b / total) * 100}%` }} />
      </div>
      <div className="flex justify-between px-4 py-2.5 text-[13px] text-muted">
        <span>{winner ? `${winner} win the cup` : matches.length ? `${points(toWin)} to win · ${matches.length} matches` : 'No matches set yet'}</span>
        {live.length > 0 && (
          <span className="font-semibold text-[#6B5A2E]">
            Live: {points(a + liveA)}–{points(b + liveB)}
          </span>
        )}
      </div>
    </div>
  )
}
