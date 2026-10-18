import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Card, Chip, ErrorNote, Loading, ScreenHeader, SectionLabel, ToggleRow } from '../components/ui'
import { ClubPicker } from '../components/ClubPicker'
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

const field = 'min-h-12 w-full rounded-2xl border border-line bg-card px-4'

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

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <ScreenHeader kind="close" center={<span className="block text-center">Edit profile</span>} right={<span className="size-11" />} />

      <div className="flex items-center gap-4">
        <Avatar name={name || 'You'} src={avatar} size={76} />
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-card px-4 font-semibold">
          Change photo
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5"><SectionLabel>Name</SectionLabel>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={field} /></label>
      <label className="flex flex-col gap-1.5"><SectionLabel>Area</SectionLabel>
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Harlow" className={field} /></label>
      <label className="flex flex-col gap-1.5"><SectionLabel>Handicap index (self-declared)</SectionLabel>
        <input value={handicap} onChange={(e) => setHandicap(e.target.value)} inputMode="decimal" className={`${field} font-mono`} /></label>
      <label className="flex flex-col gap-1.5"><SectionLabel>About you</SectionLabel>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} className="w-full rounded-2xl border border-line bg-card p-4" /></label>

      <section className="flex flex-col gap-2">
        <SectionLabel>Home club</SectionLabel>
        <ClubPicker club={club} onChange={setClub} />
        <Card className="divide-y divide-line-soft overflow-hidden">
          {club && <ToggleRow label={`I’m a member at ${club.name}`} checked={member} onChange={setMember} />}
          {!member && <ToggleRow label="I’m looking for a club membership" checked={looking} onChange={setLooking} />}
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>How I play</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {playStyles.map((p) => (
            <Chip key={p.value} outline={!styles.includes(p.value)} active={styles.includes(p.value)} onClick={() => setStyles((s) => (s.includes(p.value) ? s.filter((x) => x !== p.value) : [...s, p.value]))}>
              {p.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>How often I play</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {playFrequencies.map((f) => (
            <Chip key={f.value} outline={frequency !== f.value} active={frequency === f.value} onClick={() => setFrequency(f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Privacy</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            label="Let golf clubs contact me about membership and offers"
            hint="Off unless you turn it on. We never sell your data."
            checked={clubsCanContact}
            onChange={setClubsCanContact}
          />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>In the bag</SectionLabel>
        {bagFields.map(([k, label]) => (
          <input key={k} aria-label={label} placeholder={label} value={bag[k] ?? ''} onChange={(e) => setBag((b) => ({ ...b, [k]: e.target.value }))} className={field} />
        ))}
      </section>

      {error && <ErrorNote message={error} />}
      <Button type="submit" size="lg" full disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
    </form>
  )
}
