import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { ReportSheet } from '../components/ReportSheet'
import { Section } from '../components/Section'
import { glassCard, primaryButton, roundButton, secondaryButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, type IconName } from '../components/ui'
import { handicapText, playStyleLabel, shortName } from '../lib/format'
import { answerBuddyRequest, fetchBuddies, fetchProfile, fetchStats, removeConnection, sendBuddyRequest } from '../lib/profiles'
import { turnOffPush } from '../lib/push'
import { blockGolfer, fetchBlocked, unblockGolfer } from '../lib/safety'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

const bagLabels: [string, string][] = [
  ['driver', 'Driver'],
  ['irons', 'Irons'],
  ['putter', 'Putter'],
  ['ball', 'Ball'],
]

function Stat({ icon, value, label, to }: { icon: IconName; value: string | number; label: string; to?: string }) {
  const cls = `${glassCard} flex flex-col items-center gap-1 px-2 py-3.5 text-center text-fairway no-underline`
  if (to)
    return (
      <Link to={to} className={cls}>
        <span className="grid size-8 place-items-center rounded-full bg-green-tint text-green"><Icon name={icon} size={16} /></span>
        <span className="font-mono text-[22px] leading-tight font-semibold">{value}</span>
        <span className="text-[12px] font-semibold text-green">{label} ›</span>
      </Link>
    )
  return (
    <div className={cls}>
      <span className="grid size-8 place-items-center rounded-full bg-green-tint text-green"><Icon name={icon} size={16} /></span>
      <span className="font-mono text-[22px] leading-tight font-semibold">{value}</span>
      <span className="text-[12px] font-semibold text-muted">{label}</span>
    </div>
  )
}

export function Profile() {
  const params = useParams()
  const me = useUserId()
  const id = params.id ?? me
  const own = id === me
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const [profile, stats, buddies, blocked] = await Promise.all([fetchProfile(id), fetchStats(id), fetchBuddies(me), fetchBlocked()])
    return { profile, stats, buddies, blocked: blocked.some((b) => b.blocked_id === id) }
  }, [id, me])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [reporting, setReporting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error || !state.data) return <ErrorNote message={state.error ?? 'Something went wrong'} />
  const { profile, stats, buddies, blocked } = state.data
  if (!profile) return <p>Golfer not found.</p>

  // Where you stand with this golfer, for the buddy card on their profile.
  const all = [...buddies.buddies, ...buddies.incoming, ...buddies.sent]
  const link = all.find((r) => r.golfer.id === id)
  async function act(fn: () => Promise<void>) {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
      state.reload()
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Stop this phone getting the next golfer's notifications.
  async function signOut() {
    await turnOffPush().catch(() => {})
    await supabase.auth.signOut()
  }

  const bag = (profile.bag ?? {}) as Record<string, string>
  const bagRows = bagLabels.filter(([k]) => bag[k])

  return (
    <PhotoPage tone="heather"
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            {own ? (
              <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Your profile</span>
            ) : (
              <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
                <Icon name="back" size={20} />
              </button>
            )}
            {own && (
              <button type="button" aria-label="Edit profile" onClick={() => navigate('/me/edit')} className={roundButton}>
                <Icon name="pencil" size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full p-[3px] ring-[3px] ring-flag">
              <Avatar name={profile.display_name ?? 'Golfer'} src={profile.avatar_url} size={78} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 truncate font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{shortName(profile.display_name)}</h1>
              {profile.home_area && <p className="mt-1 mb-0 text-sm text-white/80">{profile.home_area}</p>}
              {profile.home_club && (
                <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-fairway">
                  <Icon name="flag" size={14} />
                  <span className="truncate">{profile.home_club_member ? 'Member' : 'Plays'} · {profile.home_club.name}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div>
              <div className="text-[12px] font-semibold tracking-[0.06em] text-white/70 uppercase">Handicap index</div>
              <div className="font-mono text-[36px] leading-none font-semibold text-flag">{handicapText(profile.handicap)}</div>
            </div>
            <span className="rounded-full bg-fairway/70 px-2.5 py-1 text-[12px] font-semibold text-white/85">
              {profile.handicap_source === 'official' ? 'Official' : 'Self-declared'}
            </span>
          </div>
        </div>
      }
    >
      <section aria-label="Stats" className="relative grid grid-cols-3 gap-2.5">
        <Stat icon="flag" value={stats.rounds} label="Rounds" />
        <Stat icon="user" value={stats.buddies} label="Buddies" to={own ? '/buddies' : undefined} />
        <Stat icon="check" value={stats.showsUpPct == null ? 'New' : `${Math.round(stats.showsUpPct)}%`} label="Shows up" />
      </section>

      {own && buddies.incoming.length > 0 && (
        <Link to="/buddies" className={`${glassCard} relative flex items-center gap-3 px-4 py-3 text-fairway no-underline ring-2 ring-amber/80`}>
          <span className="grid size-9 place-items-center rounded-full bg-amber text-fairway"><Icon name="user" size={17} /></span>
          <span className="flex-1 font-semibold">
            {buddies.incoming.length} buddy request{buddies.incoming.length === 1 ? '' : 's'}
          </span>
          <Icon name="back" size={16} className="rotate-180 text-muted" />
        </Link>
      )}

      {!own && (
        <div className={`${glassCard} relative flex items-center gap-3 px-4 py-3 text-fairway ${link?.status === 'accepted' ? 'ring-2 ring-green/45' : ''}`}>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {link?.status === 'accepted'
                ? 'You’re buddies'
                : link?.incoming
                  ? `${shortName(profile.display_name)} wants to be buddies`
                  : link
                    ? 'Buddy request sent'
                    : 'Played together?'}
            </span>
            <span className="block text-[13px] text-muted">
              {link?.status === 'accepted' ? 'You see each other’s buddies-only rounds' : 'Buddies can join each other’s buddies-only rounds'}
            </span>
          </span>
          {link?.status === 'accepted' ? (
            <button type="button" disabled={busy} onClick={() => confirm('Remove this buddy?') && act(() => removeConnection(link.id))} className="min-h-10 shrink-0 px-2 text-[13px] font-semibold text-muted">
              Remove
            </button>
          ) : link?.incoming ? (
            <button type="button" disabled={busy} onClick={() => act(() => answerBuddyRequest(link.id, 'accepted'))} className={`${primaryButton} min-h-10 shrink-0 gap-1.5 px-3.5 text-[14px]`}>
              <Icon name="check" size={15} /> Accept
            </button>
          ) : link ? (
            <button type="button" disabled={busy} onClick={() => act(() => removeConnection(link.id))} className="min-h-10 shrink-0 px-2 text-[13px] font-semibold text-muted">
              Cancel
            </button>
          ) : (
            <button type="button" disabled={busy} onClick={() => act(() => sendBuddyRequest(id))} className={`${primaryButton} min-h-10 shrink-0 gap-1.5 px-3.5 text-[14px]`}>
              <Icon name="plus" size={15} /> Buddy
            </button>
          )}
        </div>
      )}
      {actionError && <div className="relative"><ErrorNote message={actionError} /></div>}

      {profile.bio && (
        <Section title="About" icon="chat">
          <p className={`${glassCard} m-0 px-4 py-3.5 text-[15px] text-fairway`}>{profile.bio}</p>
        </Section>
      )}

      <Section title="How I play" icon="tee">
        {profile.play_style.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.play_style.map((s) => (
              <span key={s} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/90 bg-white/80 px-3.5 text-[14px] font-semibold text-fairway shadow-[0_4px_12px_-6px_rgba(14,31,22,0.3)] backdrop-blur">
                <span className="size-1.5 rounded-full bg-green" />
                {playStyleLabel(s)}
              </span>
            ))}
          </div>
        ) : (
          <p className="relative m-0 text-sm text-muted">{own ? <Link to="/me/edit" className="font-semibold text-green">Add how you like to play</Link> : 'Nothing added yet.'}</p>
        )}
      </Section>

      {bagRows.length > 0 && (
        <Section title="In the bag" icon="bookmark">
          <div className={`${glassCard} divide-y divide-line-soft px-4 text-fairway`}>
            {bagRows.map(([k, label]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[14px] text-muted">{label}</span>
                <span className="text-right font-semibold">{bag[k]}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {!own && (
        <div className="relative flex flex-col gap-2">
          {notice && <p role="status" className="m-0 rounded-2xl bg-green-tint px-3.5 py-2.5 text-[14px] text-green-dark">{notice}</p>}
          {blocked && (
            <p className="m-0 rounded-2xl bg-[#F1EFE8] px-3.5 py-2.5 text-[14px] text-muted">
              You’ve blocked {shortName(profile.display_name)}. You won’t see each other’s games.
            </p>
          )}
          <div className="flex justify-center gap-6">
            <button type="button" onClick={() => setReporting(true)} className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-danger">
              <Icon name="shield" size={16} /> Report
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                blocked
                  ? act(() => unblockGolfer(id))
                  : confirm(`Block ${shortName(profile.display_name)}? You won’t see each other’s games.`) && act(() => blockGolfer(id))
              }
              className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-muted"
            >
              <Icon name="close" size={16} /> {blocked ? 'Unblock' : 'Block'}
            </button>
          </div>
          <ReportSheet
            open={reporting}
            onClose={() => setReporting(false)}
            golferId={id}
            golferName={shortName(profile.display_name)}
            onDone={(didBlock) => {
              setReporting(false)
              setNotice(`Thanks. We’ll review your report within 24 hours${didBlock ? ', and you’ve blocked them' : ''}.`)
              state.reload()
            }}
          />
        </div>
      )}

      {own && (
        <Link to="/plus" className={`${glassCard} relative flex items-center gap-3 px-4 py-3 text-fairway no-underline`}>
          <span className="grid size-9 place-items-center rounded-full bg-fairway text-[11px] font-bold text-flag">PLUS</span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">BuddyGolf Plus</span>
            <span className="block text-[13px] text-muted">Start and run societies and golf trips</span>
          </span>
          <Icon name="back" size={16} className="rotate-180 text-muted" />
        </Link>
      )}

      {own && (
        <Link to="/me/notifications" className={`${glassCard} relative flex items-center gap-3 px-4 py-3 text-fairway no-underline`}>
          <span className="grid size-9 place-items-center rounded-full bg-green-tint text-green"><Icon name="bell" size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Notifications</span>
            <span className="block text-[13px] text-muted">Join requests, need a player, chat and buddies</span>
          </span>
          <Icon name="back" size={16} className="rotate-180 text-muted" />
        </Link>
      )}

      {own && (
        <Link to="/me/safety" className={`${glassCard} relative flex items-center gap-3 px-4 py-3 text-fairway no-underline`}>
          <span className="grid size-9 place-items-center rounded-full bg-green-tint text-green"><Icon name="shield" size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Safety and games I’m shown</span>
            <span className="block text-[13px] text-muted">Women-only and beginner-friendly games, blocked golfers</span>
          </span>
          <Icon name="back" size={16} className="rotate-180 text-muted" />
        </Link>
      )}

      {own && (
        <div className="relative flex gap-2.5">
          <Link to="/me/edit" className={`${secondaryButton} flex-1 gap-2`}>
            <Icon name="pencil" size={17} /> Edit profile
          </Link>
          <button type="button" onClick={signOut} className={`${secondaryButton.replace('text-fairway', 'text-danger')} flex-1`}>
            Sign out
          </button>
        </div>
      )}
    </PhotoPage>
  )
}
