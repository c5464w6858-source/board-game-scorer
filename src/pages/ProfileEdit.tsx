import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ClubPicker } from '../components/ClubPicker'
import { ActionBar, darkDisabled, field as pill, Switch } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, limeButton, roundButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { fetchCourse, type Course } from '../lib/courses'
import { playStyles } from '../lib/format'
import { fetchPreferences, playFrequencies, savePreferences, updateProfile, uploadAvatar } from '../lib/profiles'
import { useMe } from '../lib/useMe'

const bagFields = [
  ['driver', 'Driver'],
  ['irons', 'Irons'],
  ['putter', 'Putter'],
  ['ball', 'Ball'],
] as const

const field = `${pill} w-full text-[16px]`

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 px-4 py-3">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

function Pick({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold ${
        on
          ? 'bg-fairway text-flag shadow-[0_8px_16px_-10px_rgba(14,31,22,0.8)]'
          : 'border border-white/90 bg-white/80 text-fairway shadow-[0_4px_12px_-6px_rgba(14,31,22,0.3)] backdrop-blur'
      }`}
    >
      {on && <Icon name="check" size={14} />}
      {children}
    </button>
  )
}

export function ProfileEdit() {
  const { id, data, loading, error: loadError } = useMe()
  const navigate = useNavigate()
  const profile = data?.profile
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [bio, setBio] = useState('')
  const [handicap, setHandicap] = useState('')
  const [styles, setStyles] = useState<string[]>([])
  const [bag, setBag] = useState<Record<string, string>>({})
  const [club, setClub] = useState<Course | null>(null)
  const [member, setMember] = useState(false)
  const [looking, setLooking] = useState(false)
  const [clubsCanContact, setClubsCanContact] = useState(false)
  const [frequency, setFrequency] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setName(profile.display_name ?? '')
    setArea(profile.home_area ?? '')
    setBio(profile.bio ?? '')
    setHandicap(profile.handicap == null ? '' : String(profile.handicap))
    setStyles(profile.play_style)
    setBag((profile.bag ?? {}) as Record<string, string>)
    setAvatar(profile.avatar_url)
    setMember(profile.home_club_member)
    if (profile.home_club_id) fetchCourse(profile.home_club_id).then(setClub, () => {})
    fetchPreferences(id).then((p) => {
      if (!p) return
      setLooking(p.looking_for_membership)
      setClubsCanContact(p.clubs_can_contact)
      setFrequency(p.play_frequency)
    }, () => {})
  }, [profile, id])

  if (loading) return <Loading />
  if (loadError) return <ErrorNote message={loadError} />

  async function pickAvatar(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      setAvatar(await uploadAvatar(id, file))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    const h = handicap.trim() === '' ? null : Number(handicap)
    if (h != null && (Number.isNaN(h) || h < -10 || h > 54)) return setError('Handicap must be between -10 and 54.')
    setBusy(true)
    setError(null)
    try {
      await updateProfile(id, {
        display_name: name.trim() || null,
        home_area: area.trim() || null,
        bio: bio.trim() || null,
        handicap: h,
        home_club_id: club?.id ?? null,
        home_club_member: Boolean(club) && member,
        play_style: styles,
        bag: Object.fromEntries(Object.entries(bag).filter(([, v]) => v.trim())),
        avatar_url: avatar,
      })
      await savePreferences(id, {
        looking_for_membership: !member && looking,
        clubs_can_contact: clubsCanContact,
        play_frequency: frequency,
      })
      navigate('/me', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const toggleStyle = (v: string) => setStyles((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  return (
    <form onSubmit={save}>
      <PhotoPage
        header={
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <button type="button" aria-label="Close" onClick={() => navigate('/me')} className={roundButton}>
                <Icon name="close" size={20} />
              </button>
              <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Edit profile</span>
              <span className="size-11" />
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full p-[3px] ring-[3px] ring-flag">
                <Avatar name={name || 'You'} src={avatar} size={78} />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="m-0 truncate font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{name || 'Your profile'}</h1>
                <label className="mt-2.5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-3.5 text-[14px] font-semibold text-fairway">
                  <Icon name="user" size={16} />
                  Change photo
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
        }
      >
        <Section title="About you" icon="user">
          <div className={`${glassCard} divide-y divide-line-soft text-fairway`}>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} required className={field} />
            </Field>
            <Field label="Area">
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Harlow" className={field} />
            </Field>
            <Field label="Handicap index (self-declared)">
              <input value={handicap} onChange={(e) => setHandicap(e.target.value)} inputMode="decimal" className={`${field} font-mono`} />
            </Field>
            <Field label="About you">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} placeholder="A line or two other golfers will see" className={`${field.replace('rounded-full', 'rounded-[18px]')} block py-3`} />
            </Field>
          </div>
        </Section>

        <Section title="Home club" icon="flag">
          <div className="relative text-fairway">
            <ClubPicker club={club} onChange={setClub} />
          </div>
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
            {club && <Switch label={`I’m a member at ${club.name}`} checked={member} onChange={setMember} />}
            {!member && <Switch label="I’m looking for a club membership" checked={looking} onChange={setLooking} />}
          </div>
        </Section>

        <Section title="How I play" icon="tee">
          <div className="relative flex flex-wrap gap-2">
            {playStyles.map((p) => (
              <Pick key={p.value} on={styles.includes(p.value)} onClick={() => toggleStyle(p.value)}>{p.label}</Pick>
            ))}
          </div>
        </Section>

        <Section title="How often I play" icon="clock">
          <div className="relative flex flex-wrap gap-2">
            {playFrequencies.map((f) => (
              <Pick key={f.value} on={frequency === f.value} onClick={() => setFrequency(f.value)}>{f.label}</Pick>
            ))}
          </div>
        </Section>

        <Section title="In the bag" icon="bookmark">
          <div className={`${glassCard} divide-y divide-line-soft text-fairway`}>
            {bagFields.map(([k, label]) => (
              <label key={k} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-16 shrink-0 text-[14px] font-semibold text-muted">{label}</span>
                <input value={bag[k] ?? ''} onChange={(e) => setBag((b) => ({ ...b, [k]: e.target.value }))} placeholder="Add" className={`${pill} min-w-0 flex-1 text-[16px]`} />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Privacy" icon="lock">
          <div className={`${glassCard} overflow-hidden text-fairway`}>
            <Switch
              label="Let golf clubs contact me"
              hint="About membership and offers. Off unless you turn it on. We never sell your data."
              checked={clubsCanContact}
              onChange={setClubsCanContact}
            />
          </div>
        </Section>

        {error && <div className="relative"><ErrorNote message={error} /></div>}

        <ActionBar title="Editing your profile" note="Changes show on your profile">
          <button type="submit" className={`${limeButton} ${darkDisabled}`} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </ActionBar>
      </PhotoPage>
    </form>
  )
}
