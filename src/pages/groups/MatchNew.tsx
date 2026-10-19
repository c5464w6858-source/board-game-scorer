import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ActionBar, Choice } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton, roundButton } from '../../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../../components/ui'
import { firstName, handicapText } from '../../lib/format'
import { fetchGroup, type GroupMember } from '../../lib/groups'
import { addMatch, fetchMatches, matchFormats, type MatchFormat } from '../../lib/ryder'
import { useAsync } from '../../lib/useAsync'
import { useUserId } from '../../lib/useMe'

// Set up one match in a Ryder Cup round: the format and who plays for each side.
export function MatchNew() {
  const { id = '', roundId = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const [group, matches] = await Promise.all([fetchGroup(id), fetchMatches([roundId])])
    return group && { group, matches }
  }, [id, roundId])
  const [format, setFormat] = useState<MatchFormat>('fourball')
  const [sideA, setSideA] = useState<string[]>([])
  const [sideB, setSideB] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Group not found.</p>
  const { group: g, matches } = state.data
  const size = format === 'singles' ? 1 : 2
  // Golfers already playing a match in this round.
  const busyIds = new Set(matches.flatMap((m) => [...m.side_a, ...m.side_b]))
  const team = (t: 1 | 2) => {
    const picked = g.group_members.filter((m) => m.team === t)
    return picked.length ? picked : g.group_members
  }
  const ok = sideA.length === size && sideB.length === size

  function toggle(side: 'a' | 'b', userId: string) {
    const set = side === 'a' ? setSideA : setSideB
    set((cur) => (cur.includes(userId) ? cur.filter((x) => x !== userId) : [...cur, userId].slice(-size)))
  }

  function chooseFormat(f: MatchFormat) {
    setFormat(f)
    if (f === 'singles') {
      setSideA((a) => a.slice(0, 1))
      setSideB((b) => b.slice(0, 1))
    }
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await addMatch({ group_round_id: roundId, format, side_a: sideA, side_b: sideB, sort: matches.length })
      navigate(`/groups/${id}/rounds/${roundId}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  const picker = (side: 'a' | 'b', members: GroupMember[]) => {
    const chosen = side === 'a' ? sideA : sideB
    const other = side === 'a' ? sideB : sideA
    return (
      <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
        {members
          .filter((m) => !other.includes(m.user_id))
          .map((m) => {
            const on = chosen.includes(m.user_id)
            return (
              <button key={m.user_id} type="button" aria-pressed={on} onClick={() => toggle(side, m.user_id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                <span className={`rounded-full p-[2px] ring-[2.5px] ${on ? (side === 'a' ? 'ring-team-blue' : 'ring-team-red') : 'ring-transparent'}`}>
                  <Avatar name={m.profile?.display_name ?? 'Golfer'} src={m.profile?.avatar_url} size={34} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{m.user_id === me ? 'You' : firstName(m.profile?.display_name ?? null)}</span>
                  <span className="block text-[12px] text-muted">
                    HCP <span className="font-mono">{handicapText(m.profile?.handicap ?? null)}</span>
                    {busyIds.has(m.user_id) ? ' · already in a match' : ''}
                  </span>
                </span>
                <span className={`grid size-6 place-items-center rounded-full border-2 ${on ? (side === 'a' ? 'border-team-blue bg-team-blue text-white' : 'border-team-red bg-team-red text-white') : 'border-[#CFCBBE]'}`}>
                  {on && <Icon name="check" size={14} />}
                </span>
              </button>
            )
          })}
      </div>
    )
  }

  const names = (ids: string[]) => ids.map((uid) => (uid === me ? 'You' : firstName(g.group_members.find((m) => m.user_id === uid)?.profile?.display_name ?? null))).join(' & ')

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-gold uppercase">Match {matches.length + 1}</span>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">
              <span className="text-[#8FB2F0]">{g.team_a_name}</span> v <span className="text-[#F08F94]">{g.team_b_name}</span>
            </h1>
          </div>
        </div>
      }
    >
      <Section tone="navy" title="Format" icon="flag">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
          {matchFormats.map((f) => (
            <Choice key={f.value} name="format" label={f.label} hint={f.blurb} checked={format === f.value} onSelect={() => chooseFormat(f.value)} />
          ))}
        </div>
      </Section>

      <Section tone="navy" title={g.team_a_name} icon="user" action={<span className="text-[13px] text-team-blue">{sideA.length} of {size}</span>}>
        {picker('a', team(1))}
      </Section>

      <Section tone="navy" title={g.team_b_name} icon="user" action={<span className="text-[13px] text-team-red">{sideB.length} of {size}</span>}>
        {picker('b', team(2))}
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar tone="navy" title={ok ? `${names(sideA)} v ${names(sideB)}` : `Pick ${size} a side`} note={matchFormats.find((f) => f.value === format)?.label}>
        <button type="button" disabled={!ok || busy} onClick={save} className={goldButton}>
          {busy ? 'Adding…' : 'Add match'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
