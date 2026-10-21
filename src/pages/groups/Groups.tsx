import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { field } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton } from '../../components/surfaces'
import { AvatarStack, ErrorNote, Icon, Loading } from '../../components/ui'
import { dateAndTime } from '../../lib/format'
import { fetchMyGroups, joinGroup, kindLabel, type GroupRow } from '../../lib/groups'
import { daysLeft, fetchMyPlan, PLUS_PRICES, TRIAL_DAYS } from '../../lib/plus'
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
          <Link to={plus ? '/groups/new' : '/plus?from=groups&next=/groups/new'} className={`${goldButton} gap-2 self-start`}>
            <Icon name={plus ? 'plus' : 'lock'} size={18} /> Start a group
            {!plus && <span className="ml-1 rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-flag">PLUS</span>}
          </Link>
        </div>
      }
    >
      {!plan.loading &&
        (plus ? (
          <Link to="/plus" className="relative flex items-center gap-2 self-start rounded-full bg-[#0B1A12] py-1.5 pr-3 pl-1.5 text-[13px] font-semibold text-white no-underline">
            <span className="rounded-full bg-flag px-2 py-0.5 text-[11px] font-bold text-fairway">PLUS</span>
            {plan.data?.trial ? `Free trial · ${daysLeft(plan.data.endsAt)} days left` : 'You can start and run groups'}
          </Link>
        ) : (
          <div className="relative flex flex-col gap-3 overflow-hidden rounded-[22px] bg-[#0B1A12] p-4 text-white shadow-[0_16px_32px_-16px_rgba(10,19,38,0.8)]">
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-flag/20 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-flag text-fairway"><Icon name="lock" size={18} /></span>
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  Organising is a Plus feature
                </div>
                <p className="m-0 mt-0.5 text-[14px] text-white/70">
                  Start a society or trip, run a Ryder Cup and keep the leaderboard. Golfers you invite join free.
                </p>
              </div>
            </div>
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-[13px] text-white/60">
                <span className="font-mono font-semibold text-white">{PLUS_PRICES.monthly}</span> a month or <span className="font-mono font-semibold text-white">{PLUS_PRICES.yearly}</span> a year
              </span>
              <Link to="/plus?from=groups&next=/groups/new" className="shrink-0 rounded-full bg-flag px-4 py-2 text-[14px] font-semibold text-fairway no-underline">
                Try free for {TRIAL_DAYS} days
              </Link>
            </div>
          </div>
        ))}

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
