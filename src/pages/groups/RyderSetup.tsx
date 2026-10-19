import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ActionBar, Field, field as pill } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton, roundButton } from '../../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../../components/ui'
import { handicapText, shortName } from '../../lib/format'
import { fetchGroup } from '../../lib/groups'
import { setTeam, updateGroup } from '../../lib/ryder'
import { useAsync } from '../../lib/useAsync'
import { useUserId } from '../../lib/useMe'

const field = `${pill} w-full text-[16px]`

// Ryder Cup teams: name the two sides and pick who plays for each.
export function RyderSetup() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(() => fetchGroup(id), [id])
  const [nameA, setNameA] = useState('Europe')
  const [nameB, setNameB] = useState('USA')
  const [teams, setTeams] = useState<Map<string, 1 | 2 | null>>(new Map())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const g = state.data
  useEffect(() => {
    if (!g) return
    setNameA(g.team_a_name)
    setNameB(g.team_b_name)
    setTeams(new Map(g.group_members.map((m) => [m.user_id, (m.team as 1 | 2 | null) ?? null])))
  }, [g])

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!g) return <p>Group not found.</p>
  if (!g.group_members.some((m) => m.user_id === me && m.role === 'organiser')) {
    return <p>Only organisers can set up the Ryder Cup. <Link to={`/groups/${id}`}>Back to the group</Link></p>
  }

  const count = (t: 1 | 2) => [...teams.values()].filter((x) => x === t).length
  const pick = (userId: string, t: 1 | 2) => setTeams((cur) => new Map(cur).set(userId, cur.get(userId) === t ? null : t))

  // Alternate golfers by handicap so the teams start roughly even.
  function shuffleFair() {
    const sorted = [...g!.group_members].sort((a, b) => (a.profile?.handicap ?? 54) - (b.profile?.handicap ?? 54))
    setTeams(new Map(sorted.map((m, i) => [m.user_id, (i % 4 === 0 || i % 4 === 3 ? 1 : 2) as 1 | 2])))
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await updateGroup(id, { team_a_name: nameA.trim() || 'Europe', team_b_name: nameB.trim() || 'USA' })
      await Promise.all(
        g!.group_members.filter((m) => (m.team ?? null) !== (teams.get(m.user_id) ?? null)).map((m) => setTeam(id, m.user_id, teams.get(m.user_id) ?? null)),
      )
      navigate(`/groups/${id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[13px] font-semibold text-navy">
              <Icon name="flag" size={14} /> Ryder Cup
            </span>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">
              <span className="text-[#8FB2F0]">{nameA || 'Team A'}</span> v <span className="text-[#F08F94]">{nameB || 'Team B'}</span>
            </h1>
            <p className="mt-1 mb-0 text-sm text-white/80">{g.name} · fourballs, foursomes and singles, a point a match.</p>
          </div>
        </div>
      }
    >
      <Section tone="navy" title="Team names" icon="pencil">
        <div className={`${glassCard} grid grid-cols-2 divide-x divide-line-soft text-navy`}>
          <Field label={<span className="text-team-blue">Blue team</span>}>
            <input value={nameA} onChange={(e) => setNameA(e.target.value)} maxLength={30} className={field} />
          </Field>
          <Field label={<span className="text-team-red">Red team</span>}>
            <input value={nameB} onChange={(e) => setNameB(e.target.value)} maxLength={30} className={field} />
          </Field>
        </div>
      </Section>

      <Section
        tone="navy"
        title="Pick sides"
        icon="user"
        action={
          <button type="button" onClick={shuffleFair} className="text-[13px] font-semibold text-[#6B5A2E]">
            Split by handicap
          </button>
        }
      >
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
          {g.group_members.map((m) => {
            const t = teams.get(m.user_id) ?? null
            return (
              <div key={m.user_id} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`rounded-full p-[2px] ring-[2.5px] ${t === 1 ? 'ring-team-blue' : t === 2 ? 'ring-team-red' : 'ring-transparent'}`}>
                  <Avatar name={m.profile?.display_name ?? 'Golfer'} src={m.profile?.avatar_url} size={36} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{m.user_id === me ? 'You' : shortName(m.profile?.display_name ?? null)}</span>
                  <span className="block text-[12px] text-muted">HCP <span className="font-mono">{handicapText(m.profile?.handicap ?? null)}</span></span>
                </span>
                <span className="flex shrink-0 gap-1.5">
                  {([1, 2] as const).map((team) => (
                    <button
                      key={team}
                      type="button"
                      aria-pressed={t === team}
                      onClick={() => pick(m.user_id, team)}
                      className={`min-h-10 min-w-[64px] truncate rounded-full px-3 text-[13px] font-semibold ${
                        t === team ? (team === 1 ? 'bg-team-blue text-white' : 'bg-team-red text-white') : 'border border-[#DEDBD0] text-muted'
                      }`}
                    >
                      {(team === 1 ? nameA : nameB) || (team === 1 ? 'Blue' : 'Red')}
                    </button>
                  ))}
                </span>
              </div>
            )
          })}
        </div>
        <p className="relative m-0 text-[13px] text-muted">
          <span className="font-semibold text-team-blue">{count(1)}</span> v <span className="font-semibold text-team-red">{count(2)}</span>. Invite more golfers with the group’s code.
        </p>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar tone="navy" title={`${nameA || 'Team A'} v ${nameB || 'Team B'}`} note={`${count(1)} v ${count(2)} picked`}>
        <button type="button" disabled={busy} onClick={save} className={goldButton}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
