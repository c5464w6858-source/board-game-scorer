import { Link, useNavigate, useParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, roundButton, secondaryButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, type IconName } from '../components/ui'
import { handicapText, playStyleLabel, shortName } from '../lib/format'
import { fetchProfile, fetchStats } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

const bagLabels: [string, string][] = [
  ['driver', 'Driver'],
  ['irons', 'Irons'],
  ['putter', 'Putter'],
  ['ball', 'Ball'],
]

function Stat({ icon, value, label }: { icon: IconName; value: string | number; label: string }) {
  return (
    <div className={`${glassCard} flex flex-col items-center gap-1 px-2 py-3.5 text-center text-fairway`}>
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
    const [profile, stats] = await Promise.all([fetchProfile(id), fetchStats(id)])
    return { profile, stats }
  }, [id])

  if (state.loading) return <Loading />
  if (state.error || !state.data) return <ErrorNote message={state.error ?? 'Something went wrong'} />
  const { profile, stats } = state.data
  if (!profile) return <p>Golfer not found.</p>

  const bag = (profile.bag ?? {}) as Record<string, string>
  const bagRows = bagLabels.filter(([k]) => bag[k])

  return (
    <PhotoPage
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
        <Stat icon="user" value={stats.buddies} label="Buddies" />
        <Stat icon="check" value={stats.showsUpPct == null ? 'New' : `${Math.round(stats.showsUpPct)}%`} label="Shows up" />
      </section>

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

      {own && (
        <div className="relative flex gap-2.5">
          <Link to="/me/edit" className={`${secondaryButton} flex-1 gap-2`}>
            <Icon name="pencil" size={17} /> Edit profile
          </Link>
          <button type="button" onClick={() => supabase.auth.signOut()} className={`${secondaryButton.replace('text-fairway', 'text-danger')} flex-1`}>
            Sign out
          </button>
        </div>
      )}
    </PhotoPage>
  )
}
