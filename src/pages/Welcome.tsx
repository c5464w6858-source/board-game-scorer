import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClubPicker } from '../components/ClubPicker'
import { ActionBar, darkDisabled, Field, field as pill, Pick, Switch } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, limeButton, roundButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, Logo } from '../components/ui'
import { fetchCourse, type Course } from '../lib/courses'
import { playStyles } from '../lib/format'
import { fetchPreferences, playFrequencies, savePreferences, updateProfile, uploadAvatar } from '../lib/profiles'
import { useMe } from '../lib/useMe'

const field = `${pill} w-full text-[16px]`

const steps = [
  { title: 'About you', intro: 'So other golfers know who they’re playing with.' },
  { title: 'Your golf club', intro: 'Your home club, or the course you play most. We use it to find games near you.' },
  { title: 'How you play', intro: 'We match you with golfers who play the same way.' },
]

type Frequency = (typeof playFrequencies)[number]['value']

// First-run setup after sign-up. Every step must be completed; everything can
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
  // Empty until the golfer answers, so it can't be passed over by accident.
  const [member, setMember] = useState<'yes' | 'no' | ''>('')
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
    if (profile.home_club_member) setMember('yes')
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

  // What's still needed before this step can be completed, or null when done.
  function missing(): string | null {
    if (step === 0) {
      if (!name.trim()) return 'Add your name'
      if (!noHandicap && !handicap.trim()) return 'Add your handicap, or tick “no handicap”'
      if (!area.trim()) return 'Add where you’re based'
    } else if (step === 1) {
      if (!club) return 'Choose your home club'
      if (!member) return 'Say if you’re a member there'
    } else {
      if (!styles.length) return 'Pick how you like to play'
      if (!frequency) return 'Choose how often you play'
    }
    return null
  }

  async function next() {
    if (missing()) return
    setBusy(true)
    setError(null)
    try {
      await saveStep()
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
  const todo = missing()

  return (
    <main className="mx-auto min-h-full max-w-[480px] px-5 pt-5">
      <PhotoPage
        header={
          <div className="flex flex-col gap-5">
            <div className="flex min-h-11 items-center gap-4">
              {step > 0 ? (
                <button type="button" aria-label="Back" onClick={() => setStep(step - 1)} className={roundButton}>
                  <Icon name="back" size={20} />
                </button>
              ) : (
                <Logo size={40} />
              )}
              <div className="flex flex-1 flex-col gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
                <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Step {step + 1} of {steps.length}</span>
                <div className="flex gap-1.5" aria-hidden="true">
                  {steps.map((_, i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-flag' : 'bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              {step === 0 && <span className="mb-2 block text-[13px] font-semibold text-flag">Welcome to BuddyGolf</span>}
              <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{steps[step].title}</h1>
              <p className="mt-1 mb-0 text-sm text-white/80">{steps[step].intro}</p>
            </div>
          </div>
        }
      >
        {step === 0 && (
          <Section title="Your details" icon="user">
            <div className={`${glassCard} divide-y divide-line-soft text-fairway`}>
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Paul Whitehouse" className={field} />
                <span className="text-[12px] text-muted">Other golfers see your first name and last initial.</span>
              </Field>
              <Field label="Handicap index">
                <input
                  value={noHandicap ? '' : handicap}
                  onChange={(e) => setHandicap(e.target.value)}
                  disabled={noHandicap}
                  inputMode="decimal"
                  placeholder="e.g. 14.2"
                  className={`${field} font-mono disabled:opacity-50`}
                />
              </Field>
              <Switch label="No handicap yet" checked={noHandicap} onChange={setNoHandicap} />
              <Field label="Where are you based?">
                <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Town or area, e.g. Harlow" className={field} />
              </Field>
            </div>
          </Section>
        )}

        {step === 1 && (
          <>
            <Section title="Home club" icon="flag">
              <div className="relative text-fairway">
                <ClubPicker club={club} onChange={setClub} />
              </div>
            </Section>
            {club && (
              <Section title="Membership" icon="check">
                <p className="relative -mt-1 mb-0 text-[14px] text-muted">Are you a member at {club.name}?</p>
                <div className="relative flex flex-wrap gap-2">
                  <Pick on={member === 'yes'} onClick={() => setMember('yes')}>Yes, I’m a member</Pick>
                  <Pick on={member === 'no'} onClick={() => setMember('no')}>No, I pay as I play</Pick>
                </div>
              </Section>
            )}
            <Section title="Clubs and offers" icon="lock">
              <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
                {member === 'no' && <Switch label="I’m looking for a club membership" checked={looking} onChange={setLooking} />}
                <Switch
                  label="Let golf clubs contact me"
                  hint="About membership and offers. Off unless you turn it on. We never sell your data."
                  checked={clubsCanContact}
                  onChange={setClubsCanContact}
                />
              </div>
            </Section>
          </>
        )}

        {step === 2 && (
          <>
            <Section title="How I play" icon="tee">
              <div className="relative flex flex-wrap gap-2">
                {playStyles.map((p) => (
                  <Pick
                    key={p.value}
                    on={styles.includes(p.value)}
                    onClick={() => setStyles((s) => (s.includes(p.value) ? s.filter((x) => x !== p.value) : [...s, p.value]))}
                  >
                    {p.label}
                  </Pick>
                ))}
              </div>
            </Section>
            <Section title="How often" icon="clock">
              <div className="relative flex flex-wrap gap-2">
                {playFrequencies.map((f) => (
                  <Pick key={f.value} on={frequency === f.value} onClick={() => setFrequency(f.value)}>{f.label}</Pick>
                ))}
              </div>
            </Section>
            <Section title="Profile photo" icon="user">
              <div className={`${glassCard} flex items-center gap-4 p-4 text-fairway`}>
                <span className="rounded-full p-[3px] ring-[3px] ring-flag">
                  <Avatar name={name || 'You'} src={avatar} size={60} />
                </span>
                <div className="flex flex-1 flex-col gap-2">
                  <p className="m-0 text-[13px] text-muted">Golfers are more likely to accept a request with a face to it.</p>
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 self-start rounded-full bg-fairway px-3.5 text-[14px] font-semibold text-white">
                    <Icon name="user" size={16} />
                    {avatar ? 'Change photo' : 'Add a photo'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} />
                  </label>
                </div>
              </div>
            </Section>
          </>
        )}

        {error && <div className="relative"><ErrorNote message={error} /></div>}

        <ActionBar noTabBar title={todo ? 'Nearly there' : last ? 'All set' : 'Looks good'} note={todo ?? 'You can change it any time'}>
          <button type="button" className={`${limeButton} ${darkDisabled}`} disabled={busy || Boolean(todo)} onClick={next}>
            {busy ? 'Saving…' : last ? 'Finish' : 'Continue'}
          </button>
        </ActionBar>
      </PhotoPage>
    </main>
  )
}
