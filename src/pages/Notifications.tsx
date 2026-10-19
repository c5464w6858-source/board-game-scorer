import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Switch } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton, roundButton, secondaryButton } from '../components/surfaces'
import { ErrorNote, Icon, Loading } from '../components/ui'
import { updateProfile } from '../lib/profiles'
import { isPushOn, pushKinds, pushSupport, sendTestPush, turnOffPush, turnOnPush, type PushKind } from '../lib/push'
import { useMe } from '../lib/useMe'

// Push notifications: turn them on for this phone and choose what you hear about.
export function Notifications() {
  const me = useMe()
  const navigate = useNavigate()
  const [support] = useState(pushSupport)
  const [on, setOn] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    isPushOn().then(setOn, () => setOn(false))
  }, [])

  if (me.loading || on == null) return <Loading />
  if (me.error || !me.data?.profile) return <ErrorNote message={me.error ?? 'Something went wrong'} />
  const off = new Set(me.data.profile.push_off)

  async function run(action: () => Promise<void>, done?: string) {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await action()
      if (done) setNotice(done)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const toggle = (kind: PushKind, wanted: boolean) =>
    run(async () => {
      const next = new Set(off)
      if (wanted) next.delete(kind)
      else next.add(kind)
      await updateProfile(me.id, { push_off: [...next] })
      me.reload()
    })

  return (
    <PhotoPage
      tone="heather"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-heather">
              <Icon name="bell" size={15} /> {on ? 'On for this phone' : 'Off for this phone'}
            </span>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Notifications</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">Hear when someone wants to play, without keeping the app open.</p>
          </div>
        </div>
      }
    >
      <Section title="This phone" icon="bell">
        {support === 'install-first' ? (
          <div className={`${glassCard} flex flex-col gap-2 px-4 py-4 text-[14px] text-fairway`}>
            <p className="m-0 font-semibold">Add BuddyGolf to your Home Screen first</p>
            <p className="m-0 text-muted">
              iPhones only allow notifications for apps on the Home Screen. In Safari, tap <span className="font-semibold text-fairway">Share</span>, then{' '}
              <span className="font-semibold text-fairway">Add to Home Screen</span>. Open BuddyGolf from there and come back to this page.
            </p>
          </div>
        ) : support === 'unsupported' ? (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>This browser can’t show notifications. Try Chrome, Edge, Firefox or Safari.</div>
        ) : support === 'blocked' ? (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>
            Notifications are blocked for BuddyGolf. Allow them in your browser or phone settings, then come back here.
          </div>
        ) : on ? (
          <div className="relative flex gap-2.5">
            <button type="button" disabled={busy} onClick={() => run(sendTestPush, 'Test sent. It should arrive in a few seconds.')} className={`${primaryButton} flex-1`}>
              Send a test
            </button>
            <button type="button" disabled={busy} onClick={() => run(async () => { await turnOffPush(); setOn(false) })} className={`${secondaryButton} flex-1`}>
              Turn off
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(async () => { await turnOnPush(); setOn(true) }, 'Notifications are on for this phone.')}
            className={`${primaryButton} relative w-full gap-2`}
          >
            <Icon name="bell" size={18} /> {busy ? 'Turning on…' : 'Turn on notifications'}
          </button>
        )}
      </Section>

      <Section title="Tell me about" icon="flag">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
          {pushKinds.map((k) => (
            <Switch key={k.value} label={k.label} hint={k.hint} checked={!off.has(k.value)} onChange={(v) => !busy && toggle(k.value, v)} />
          ))}
        </div>
        <p className="relative m-0 text-[13px] text-muted">These apply on every phone you’ve turned notifications on for.</p>
      </Section>

      {notice && (
        <div role="status" className="relative flex items-center gap-2 rounded-[18px] bg-heather px-4 py-3 text-[14px] font-semibold text-white">
          <Icon name="check" size={17} /> {notice}
        </div>
      )}
      {error && <div className="relative"><ErrorNote message={error} /></div>}
    </PhotoPage>
  )
}
