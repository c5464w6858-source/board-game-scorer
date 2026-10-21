import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { field } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton } from '../../components/surfaces'
import { AvatarStack, ErrorNote, Icon, Loading } from '../../components/ui'
import { dateAndTime } from '../../lib/format'
import { fetchMyGroups, joinGroup, kindLabel, type GroupRow } from '../../lib/groups'
import { daysLeft, fetchMyPlan } from '../../lib/plus'
import { useAsync } from '../../lib/useAsync'
import { useUserId } from '../../lib/useMe'
import { dateRange } from './helpers'

function GroupCard({ g }: { g: GroupRow }) {
  const next = g.group_rounds.find((r) => new Date(r.tee_time) > new Date())
  return (
    <Link to={`/groups/${g.id}`} className={`${glassCard} flex flex-col gap-3 p-4 text-navy no-underline`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[12px] font-semibold text-gold">
          <Icon name="flag" size={13} /> {kindLabel(g.kind)}
        </span>
        {dateRange(g.starts_on, g.ends_on) && <span className="text-[13px] font-semibold text-[#6B5A2E]">{dateRange(g.starts_on, g.ends_on)}</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[20px] font-bold tracking-[-0.02em]">{g.name}</div>
          <div className="truncate text-[13px] text-muted">
            {[g.location, `${g.group_members.length} golfer${g.group_members.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <AvatarStack
          players={g.group_members.slice(0, 4).map((m) => ({ name: m.profile?.display_name ?? 'Golfer', avatarUrl: m.profile?.avatar_url }))}
          total={Math.min(4, g.group_members.length)}
          size={28}
        />
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-cream px-3.5 py-2.5 text-[14px]">
        <Icon name="clock" size={16} className="shrink-0 text-[#6B5A2E]" />
        <span className="min-w-0 flex-1 truncate">
          {next ? (
            <>
              <span className="font-semibold">Next:</span> {next.course_name} · {dateAndTime(next.tee_time)}
            </>
          ) : g.group_rounds.length ? (
            `${g.group_rounds.length} round${g.group_rounds.length === 1 ? '' : 's'} played`
          ) : (
            'No rounds scheduled yet'
          )}
        </span>
        <Icon name="back" size={16} className="shrink-0 rotate-180 text-muted" />
      </div>
    </Link>
  )
}

// Societies & trips: groups that play together, organise rounds and keep score.
export function Groups() {
  const navigate = useNavigate()
  const me = useUserId()
  const groups = useAsync(() => fetchMyGroups(), [])
  // Starting a group needs Plus; joining with a code is free.
  const plan = useAsync(() => fetchMyPlan(me), [me])
  const plus = plan.data?.active ?? false
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function join(e: FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    try {
      navigate(`/groups/${await joinGroup(code)}`)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-4 pt-6">
          <div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-gold uppercase">The clubhouse</span>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Societies & trips</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">Organise your society, golf trip or big day out. Every score in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={plus ? '/groups/new' : '/plus?from=groups&next=/groups/new'} className={`${goldButton} gap-2`}>
              <Icon name="plus" size={18} /> Start a group
            </Link>
            {!plan.loading && (
              <Link to="/plus" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-soft no-underline">
                <span className="rounded-full bg-flag px-2 py-0.5 text-[11px] font-bold text-fairway">PLUS</span>
                {plus ? (plan.data?.trial ? `Trial · ${daysLeft(plan.data.endsAt)} days left` : 'Plus member') : 'Organisers need Plus · joining is free'}
              </Link>
            )}
          </div>
        </div>
      }
    >
      <Section tone="navy" title="Your groups" icon="user" badge={groups.data?.length || undefined}>
        {groups.loading ? (
          <Loading />
        ) : groups.error ? (
          <ErrorNote message={groups.error} />
        ) : groups.data?.length ? (
          <div className="flex flex-col gap-3">
            {groups.data.map((g) => <GroupCard key={g.id} g={g} />)}
          </div>
        ) : (
          <div className={`${glassCard} flex flex-col items-center gap-2 px-5 py-6 text-center text-navy`}>
            <span className="grid size-12 place-items-center rounded-full bg-gold-soft text-navy"><Icon name="flag" size={22} /></span>
            <div className="font-display text-[18px] font-bold">No groups yet</div>
            <p className="m-0 text-[14px] text-muted">Start one for your society or next golf trip, or join with a code from your organiser.</p>
          </div>
        )}
      </Section>

      <Section tone="navy" title="Join with a code" icon="send">
        <form onSubmit={join} className={`${glassCard} flex items-center gap-2 p-2 text-navy`}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            aria-label="Invite code"
            placeholder="6-letter code"
            maxLength={6}
            className={`${field} min-w-0 flex-1 border-transparent bg-transparent font-mono text-[18px] tracking-[0.2em] shadow-none`}
          />
          <button type="submit" disabled={busy || code.trim().length < 6} className={`${goldButton} min-h-11 px-4`}>
            {busy ? 'Joining…' : 'Join'}
          </button>
        </form>
        {error && <ErrorNote message={error} />}
      </Section>
    </PhotoPage>
  )
}
