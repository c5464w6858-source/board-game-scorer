import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton, secondaryButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { handicapText, shortName } from '../lib/format'
import { answerBuddyRequest, fetchBuddies, removeConnection, type BuddyRow } from '../lib/profiles'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

function GolferLine({ row, children }: { row: BuddyRow; children?: ReactNode }) {
  const g = row.golfer
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Link to={`/golfers/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3 text-fairway no-underline">
        <Avatar name={g.display_name ?? 'Golfer'} src={g.avatar_url} size={44} />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{shortName(g.display_name)}</span>
          <span className="block truncate text-[13px] text-muted">
            HCP <span className="font-mono">{handicapText(g.handicap)}</span>
            {g.home_area ? ` · ${g.home_area}` : ''}
          </span>
        </span>
      </Link>
      {children}
    </div>
  )
}

export function Buddies() {
  const me = useUserId()
  const state = useAsync(() => fetchBuddies(me), [me])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error || !state.data) return <ErrorNote message={state.error ?? 'Something went wrong'} />
  const { buddies, incoming, sent } = state.data

  async function run(id: string, fn: () => Promise<void>) {
    setBusy(id)
    setError(null)
    try {
      await fn()
      state.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-2 pt-6">
          <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Your people</span>
          <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Buddies</h1>
          <p className="m-0 text-sm text-white/80">
            {buddies.length
              ? `${buddies.length} buddy${buddies.length === 1 ? '' : 's'}. They can see and join your buddies-only rounds.`
              : 'Golfers you’ve played with and want to play again.'}
          </p>
        </div>
      }
    >
      {incoming.length > 0 && (
        <Section title="Want to be buddies" icon="bell" badge={incoming.length}>
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden ring-2 ring-amber/80`}>
            {incoming.map((r) => (
              <GolferLine key={r.id} row={r}>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    aria-label={`Decline ${r.golfer.display_name ?? 'golfer'}`}
                    disabled={busy === r.id}
                    onClick={() => run(r.id, () => answerBuddyRequest(r.id, 'declined'))}
                    className={`${secondaryButton} min-h-10 px-3`}
                  >
                    <Icon name="close" size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => run(r.id, () => answerBuddyRequest(r.id, 'accepted'))}
                    className={`${primaryButton} min-h-10 gap-1.5 px-3.5 text-[14px]`}
                  >
                    <Icon name="check" size={15} /> Accept
                  </button>
                </div>
              </GolferLine>
            ))}
          </div>
        </Section>
      )}

      <Section title="Your buddies" icon="user" action={buddies.length ? <span className="text-[13px] text-muted">{buddies.length}</span> : undefined}>
        {buddies.length ? (
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden`}>
            {buddies.map((r) => (
              <GolferLine key={r.id} row={r}>
                <Link to={`/golfers/${r.golfer.id}`} aria-label="View profile" className="grid size-10 shrink-0 place-items-center text-muted">
                  <Icon name="back" size={16} className="rotate-180" />
                </Link>
              </GolferLine>
            ))}
          </div>
        ) : (
          <div className={`${glassCard} flex flex-col items-center gap-3 px-5 py-6 text-center text-fairway`}>
            <span className="grid size-12 place-items-center rounded-full bg-green-tint text-green"><Icon name="user" size={22} /></span>
            <div>
              <div className="font-display text-[18px] font-bold">No buddies yet</div>
              <p className="mt-1 mb-0 text-[14px] text-muted">Play a round, then add the people you’d play with again from the recap or their profile.</p>
            </div>
            <Link to="/discover" className={primaryButton}>Find a game</Link>
          </div>
        )}
      </Section>

      {sent.length > 0 && (
        <Section title="Requests you’ve sent" icon="send">
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden`}>
            {sent.map((r) => (
              <GolferLine key={r.id} row={r}>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => run(r.id, () => removeConnection(r.id))}
                  className="min-h-10 shrink-0 px-2 text-[13px] font-semibold text-muted"
                >
                  Cancel
                </button>
              </GolferLine>
            ))}
          </div>
        </Section>
      )}

      {error && <div className="relative"><ErrorNote message={error} /></div>}
    </PhotoPage>
  )
}
