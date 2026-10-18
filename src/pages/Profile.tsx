import { Link, useParams } from 'react-router-dom'
import { Avatar, Card, ErrorNote, Icon, Loading, RoundIconButton, SectionLabel, StatTile, Chip } from '../components/ui'
import { handicapText, playStyleLabel, shortName } from '../lib/format'
import { fetchProfile, fetchStats } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { useNavigate } from 'react-router-dom'

const bagLabels: [string, string][] = [
  ['driver', 'Driver'],
  ['irons', 'Irons'],
  ['putter', 'Putter'],
  ['ball', 'Ball'],
]

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
    <div className="flex flex-col gap-3.5">
      <header className="flex items-center gap-3.5">
        <Avatar name={profile.display_name ?? 'Golfer'} src={profile.avatar_url} size={76} ring />
        <div className="flex-1">
          <h1 className="m-0 font-display text-[26px] font-extrabold tracking-[-0.03em]">{shortName(profile.display_name)}</h1>
          {profile.home_area && <div className="text-sm text-muted">{profile.home_area}</div>}
          {profile.home_club && (
            <div className="mt-0.5 text-[13px] font-semibold text-green">
              {profile.home_club_member ? 'Member, ' : 'Plays at '}
              {profile.home_club.name}
            </div>
          )}
        </div>
        {own ? (
          <RoundIconButton label="Edit profile" icon="pencil" onClick={() => navigate('/me/edit')} />
        ) : (
          <RoundIconButton label="Back" icon="back" onClick={() => navigate(-1)} />
        )}
      </header>

      {profile.bio && <p className="m-0">{profile.bio}</p>}

      <section aria-label="Handicap" className="rounded-[22px] bg-fairway p-4 text-white">
        <div className="text-xs text-muted-dark">Handicap index</div>
        <div className="font-mono text-[38px] leading-[1.1] font-semibold">{handicapText(profile.handicap)}</div>
        <div className="text-xs text-flag">
          {profile.handicap_source === 'official' ? 'Official' : 'Self-declared'}
        </div>
      </section>

      <section aria-label="Stats" className="grid grid-cols-3 gap-2">
        <StatTile value={<span className="font-mono text-xl font-semibold">{stats.rounds}</span>} label="Rounds" />
        <StatTile value={<span className="font-mono text-xl font-semibold">{stats.buddies}</span>} label="Buddies" />
        <StatTile
          value={<span className="font-mono text-xl font-semibold">{stats.showsUpPct == null ? 'New' : `${Math.round(stats.showsUpPct)}%`}</span>}
          label="Shows up"
        />
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>How I play</SectionLabel>
        {profile.play_style.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.play_style.map((s) => <Chip key={s} outline>{playStyleLabel(s)}</Chip>)}
          </div>
        ) : (
          <p className="m-0 text-sm text-muted">{own ? <Link to="/me/edit">Add how you like to play</Link> : 'Nothing added yet.'}</p>
        )}
      </section>

      {bagRows.length > 0 && (
        <Card className="px-3.5 py-1">
          <div className="pt-3"><SectionLabel>In the bag</SectionLabel></div>
          {bagRows.map(([k, label]) => (
            <div key={k} className="flex justify-between border-b border-line-soft py-3 last:border-0">
              <span className="text-muted">{label}</span>
              <span className="font-medium">{bag[k]}</span>
            </div>
          ))}
        </Card>
      )}

      {own && (
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-line bg-card px-4 font-semibold"
        >
          <Icon name="user" size={18} /> Sign out
        </button>
      )}
    </div>
  )
}
