import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pick, Switch } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, roundButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { shortName } from '../lib/format'
import { updateProfile, type ProfileUpdate } from '../lib/profiles'
import { fetchBlocked, genders, unblockGolfer } from '../lib/safety'
import { useAsync } from '../lib/useAsync'
import { useMe } from '../lib/useMe'

// Safety and the games you're shown (design 12, without verification yet).
export function Safety() {
  const me = useMe()
  const navigate = useNavigate()
  const blocked = useAsync(() => fetchBlocked(), [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (me.loading || blocked.loading) return <Loading />
  if (me.error || !me.data?.profile) return <ErrorNote message={me.error ?? 'Something went wrong'} />
  const profile = me.data.profile
  const woman = profile.gender === 'woman'

  async function save(patch: ProfileUpdate) {
    setBusy(true)
    setError(null)
    try {
      await updateProfile(me.id, patch)
      me.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function unblock(id: string) {
    setError(null)
    try {
      await unblockGolfer(id)
      blocked.reload()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <PhotoPage tone="heather"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-fairway">
              <Icon name="shield" size={15} /> Safety
            </span>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Play your way</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">Choose the games you’re shown and who you never see.</p>
          </div>
        </div>
      }
    >
      <Section title="About you" icon="user">
        <p className="relative -mt-1 mb-0 text-[14px] text-muted">
          Optional. Only used so women can find and join women-only games. Never shown on your profile.
        </p>
        <div className="relative flex flex-wrap gap-2">
          {genders.map((g) => (
            <Pick
              key={g.value}
              on={profile.gender === g.value}
              onClick={() => save({ gender: profile.gender === g.value ? null : g.value, ...(g.value !== 'woman' ? { women_only: false } : {}) })}
            >
              {g.label}
            </Pick>
          ))}
        </div>
      </Section>

      <Section title="Games I’m shown" icon="flag">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
          {woman ? (
            <Switch
              label="Women-only games"
              hint="Only show me games just for women. You can host them too."
              checked={profile.women_only}
              onChange={(women_only) => !busy && save({ women_only })}
            />
          ) : (
            <div className="px-4 py-3">
              <div className="font-semibold text-muted">Women-only games</div>
              <div className="text-[13px] text-muted">Available to golfers who select Woman above.</div>
            </div>
          )}
          <Switch
            label="Beginner-friendly games"
            hint="Only show me games marked beginner-friendly. No pressure, any score welcome."
            checked={profile.beginner_friendly}
            onChange={(beginner_friendly) => !busy && save({ beginner_friendly })}
          />
        </div>
      </Section>

      <Section title="Blocked golfers" icon="close" badge={blocked.data?.length || undefined}>
        {blocked.data?.length ? (
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
            {blocked.data.map((b) => (
              <div key={b.blocked_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={b.golfer?.display_name ?? 'Golfer'} src={b.golfer?.avatar_url} size={40} />
                <Link to={`/golfers/${b.blocked_id}`} className="min-w-0 flex-1 truncate font-semibold text-fairway no-underline">
                  {shortName(b.golfer?.display_name ?? null)}
                </Link>
                <button type="button" onClick={() => unblock(b.blocked_id)} className="min-h-10 shrink-0 px-2 text-[13px] font-semibold text-green">
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>
            Nobody blocked. To block or report someone, open their profile.
          </div>
        )}
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <div className="relative flex gap-3 rounded-[20px] border border-green/20 bg-green-tint/90 px-4 py-3 text-[14px] text-[#0E3D20]">
        <span className="mt-0.5 shrink-0"><Icon name="shield" size={20} /></span>
        <p className="m-0">Share round details with a friend before you meet someone new. Golfers never need to pay each other in the app.</p>
      </div>
    </PhotoPage>
  )
}
