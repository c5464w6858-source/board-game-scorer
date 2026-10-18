import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClubPicker } from '../components/ClubPicker'
import { Avatar, Button, Card, Chip, ErrorNote, Loading, Logo, Segmented, SectionLabel, ToggleRow } from '../components/ui'
import { fetchCourse, type Course } from '../lib/courses'
import { playStyles } from '../lib/format'
import { fetchPreferences, playFrequencies, savePreferences, updateProfile, uploadAvatar } from '../lib/profiles'
import { useMe } from '../lib/useMe'

const field = 'min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px]'

const steps = [
  { title: 'About you', intro: 'So other golfers know who they’re playing with.' },
  { title: 'Your golf club', intro: 'We use this to find games near you.' },
  { title: 'How you play', intro: 'We match you with golfers who play the same way.' },
]

type Frequency = (typeof playFrequencies)[number]['value']

// First-run setup after sign-up. Every step can be skipped and everything can
// be changed later from Edit profile.
export function Welcome() {
  const { id, data, loading, error: loadError } = useMe()
  const navigate = useNavigate()
  const profile = data?.profile
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [handicap, setHandicap] = useState('')
  const [noHandicap, setNoHandicap] = useState(false)
  const [area, setArea] = useState('')
  const [club, setClub] = useState<Course | null>(null)
  const [member, setMember] = useState<'yes' | 'no'>('no')
  const [looking, setLooking] = useState(false)
  const [clubsCanContact, setClubsCanContact] = useState(false)
  const [styles, setStyles] = useState<string[]>([])
  const [frequency, setFrequency] = useState<Frequency | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setName(profile.display_name ?? '')
    setHandicap(profile.handicap == null ? '' : String(profile.handicap))
    setArea(profile.home_area ?? '')
    setMember(profile.home_club_member ? 'yes' : 'no')
    setStyles(profile.play_style)
    setAvatar(profile.avatar_url)
    if (profile.home_club_id) fetchCourse(profile.home_club_id).then(setClub, () => {})
    fetchPreferences(id).then((p) => {
      if (!p) return
      setLooking(p.looking_for_membership)
      setClubsCanContact(p.clubs_can_contact)
      setFrequency(p.play_frequency as Frequency | null)
    }, () => {})
  }, [profile, id])

  if (loading) return <Loading />
  if (loadError) return <ErrorNote message={loadError} />

  async function finish() {
    await updateProfile(id, { onboarded_at: new Date().toISOString() })
    navigate('/', { replace: true })
  }

  async function saveStep() {
    if (step === 0) {
      const h = noHandicap || handicap.trim() === '' ? null : Number(handicap)
      if (h != null && (Number.isNaN(h) || h < -10 || h > 54)) throw new Error('Handicap must be between -10 and 54.')
      await updateProfile(id, { display_name: name.trim() || null, handicap: h, home_area: area.trim() || null })
    } else if (step === 1) {
      await updateProfile(id, { home_club_id: club?.id ?? null, home_club_member: Boolean(club) && member === 'yes' })
      await savePreferences(id, {
        looking_for_membership: member === 'no' && looking,
        clubs_can_contact: clubsCanContact,
      })
    } else {
      await updateProfile(id, { play_style: styles, avatar_url: avatar })
      await savePreferences(id, { play_frequency: frequency })
    }
  }

  async function next(save: boolean) {
    setBusy(true)
    setError(null)
    try {
      if (save) await saveStep()
      if (step < steps.length - 1) setStep(step + 1)
      else await finish()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function pickAvatar(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      setAvatar(await uploadAvatar(id, file))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const last = step === steps.length - 1

  return (
    <main className="mx-auto flex min-h-full max-w-[480px] flex-col gap-6 bg-clubhouse px-5 pt-5 pb-8">
      <header className="flex items-center justify-between">
        <Logo size={32} />
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await finish()
            } catch (e) {
              setError((e as Error).message)
              setBusy(false)
            }
          }}
          className="min-h-11 text-sm font-medium text-muted"
        >
          Skip setup
        </button>
      </header>

      <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-green' : 'bg-line'}`} />
        ))}
      </div>

      <div>
        <div className="text-[13px] font-semibold text-green">Step {step + 1} of {steps.length}</div>
        <h1 className="mt-1 mb-1 font-display text-[30px] font-extrabold tracking-[-0.03em]">{steps[step].title}</h1>
        <p className="m-0 text-muted">{steps[step].intro}</p>
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Paul Whitehouse" className={field} />
            <span className="text-[13px] text-muted">Other golfers see your first name and last initial.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Handicap index</span>
            <input
              value={noHandicap ? '' : handicap}
              onChange={(e) => setHandicap(e.target.value)}
              disabled={noHandicap}
              inputMode="decimal"
              placeholder="e.g. 14.2"
              className={`${field} font-mono disabled:opacity-50`}
            />
          </label>
          <Card className="overflow-hidden">
            <ToggleRow label="I don’t have a handicap yet" checked={noHandicap} onChange={setNoHandicap} />
          </Card>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Where are you based?</span>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Town or area, e.g. Harlow" className={field} />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Home club</span>
            <ClubPicker club={club} onChange={setClub} />
          </div>
          {club && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Are you a member at {club.name}?</span>
              <Segmented
                label="Member at your home club"
                value={member}
                onChange={setMember}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No, I pay as I play' },
                ]}
              />
            </div>
          )}
          <Card className="divide-y divide-line-soft overflow-hidden">
            {(!club || member === 'no') && (
              <ToggleRow label="I’m looking for a club membership" checked={looking} onChange={setLooking} />
            )}
            <ToggleRow
              label="Let golf clubs contact me about membership and offers"
              hint="Off unless you turn it on. We never sell your data."
              checked={clubsCanContact}
              onChange={setClubsCanContact}
            />
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <SectionLabel>How I play</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {playStyles.map((p) => (
                <Chip
                  key={p.value}
                  outline={!styles.includes(p.value)}
                  active={styles.includes(p.value)}
                  onClick={() => setStyles((s) => (s.includes(p.value) ? s.filter((x) => x !== p.value) : [...s, p.value]))}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <SectionLabel>How often do you play?</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {playFrequencies.map((f) => (
                <Chip key={f.value} outline={frequency !== f.value} active={frequency === f.value} onClick={() => setFrequency(f.value)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <SectionLabel>Profile photo</SectionLabel>
            <div className="flex items-center gap-4">
              <Avatar name={name || 'You'} src={avatar} size={64} />
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-card px-4 font-semibold">
                {avatar ? 'Change photo' : 'Add a photo'}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} />
              </label>
            </div>
            <p className="m-0 text-[13px] text-muted">Golfers are more likely to accept a request with a face to it.</p>
          </section>
        </div>
      )}

      {error && <ErrorNote message={error} />}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button size="lg" full disabled={busy} onClick={() => next(true)}>
          {busy ? 'Saving…' : last ? 'Finish' : 'Continue'}
        </Button>
        <button type="button" disabled={busy} onClick={() => next(false)} className="min-h-11 text-sm font-medium text-muted">
          {last ? 'Skip and finish' : 'Skip this step'}
        </button>
      </div>
    </main>
  )
}
