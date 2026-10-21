import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, roundButton } from '../components/surfaces'
import { ErrorNote, Icon, Loading } from '../components/ui'
import { daysLeft, fetchMyPlan, PLUS_PRICES, startPlusTrial, TRIAL_DAYS } from '../lib/plus'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

// What Plus adds today. Hosting and joining stay free for everyone.
const rows: { label: string; free: string; plus: string }[] = [
  { label: 'Host rounds', free: 'Unlimited', plus: 'Unlimited' },
  { label: 'Join rounds', free: 'Yes', plus: 'Yes' },
  { label: 'Join a society or trip', free: 'Yes', plus: 'Yes' },
  { label: 'Start and run a society or trip', free: '–', plus: 'Yes' },
  { label: 'Ryder Cup mode and leaderboards', free: '–', plus: 'Yes' },
]

// BuddyGolf Plus: the only thing the app charges for (design 23).
export function Plus() {
  const me = useUserId()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const plan = useAsync(() => fetchMyPlan(me), [me])
  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (plan.loading) return <Loading />
  if (plan.error || !plan.data) return <ErrorNote message={plan.error ?? 'Something went wrong'} />
  const p = plan.data

  async function trial() {
    setBusy(true)
    setError(null)
    try {
      await startPlusTrial()
      if (next) navigate(next, { replace: true })
      else plan.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <div className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em]">
              buddy<span className="text-flag">golf</span> plus
            </div>
            <p className="mt-2 mb-0 text-sm text-white/80">
              {p.active
                ? p.trial
                  ? `Your free trial · ${daysLeft(p.endsAt)} day${daysLeft(p.endsAt) === 1 ? '' : 's'} left`
                  : 'You’re on Plus. Thanks for backing BuddyGolf.'
                : 'Run your society or golf trip. Hosting and joining stay free for everyone.'}
            </p>
          </div>
        </div>
      }
    >
      {params.get('from') === 'groups' && !p.active && (
        <div className="relative flex gap-3 rounded-[20px] border border-gold/50 bg-navy px-4 py-3 text-[14px] text-white">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-navy"><Icon name="user" size={17} /></span>
          <p className="m-0">
            <span className="font-semibold text-gold-soft">Starting a society or trip needs Plus.</span> Your golfers join free with your invite code.
          </p>
        </div>
      )}

      <Section title="Free and Plus" icon="check">
        <div className={`${glassCard} overflow-hidden text-fairway`}>
          <table className="w-full border-collapse text-[14px]">
            <caption className="sr-only">Free compared with Plus</caption>
            <thead>
              <tr className="text-[12px] text-muted">
                <th scope="col" className="px-4 pt-3 pb-2 text-left font-medium" />
                <th scope="col" className="w-16 pt-3 pb-2 text-center font-medium">Free</th>
                <th scope="col" className="w-16 rounded-t-xl bg-flag pt-3 pb-2 text-center font-bold text-fairway">Plus</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-line-soft">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">{r.label}</th>
                  <td className="text-center text-[13px] text-muted">{r.free}</td>
                  <td className="bg-flag/25 text-center text-[13px] font-semibold">{r.plus === 'Yes' ? <Icon name="check" size={18} className="mx-auto" /> : r.plus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="relative m-0 text-[13px] text-muted">More Plus features are on the way. Nothing to pay between golfers, ever: green fees are paid at the club.</p>
      </Section>

      <Section title="Plans" icon="flag">
        <div className="relative grid grid-cols-2 gap-2.5">
          {(['yearly', 'monthly'] as const).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={billing === b}
              onClick={() => setBilling(b)}
              className={`${glassCard} relative flex flex-col items-start gap-1 p-4 text-left text-fairway ${billing === b ? '!border-2 !border-green' : ''}`}
            >
              {b === 'yearly' && <span className="absolute -top-2.5 right-3 rounded-full bg-fairway px-2 py-0.5 text-[11px] font-semibold text-flag">Save 37%</span>}
              <span className="text-[13px] font-semibold text-muted">{b === 'yearly' ? 'Yearly' : 'Monthly'}</span>
              <span className="font-mono text-[24px] font-semibold">{PLUS_PRICES[b]}</span>
              <span className="text-[12px] text-muted">{b === 'yearly' ? 'a year · £2.50 a month' : 'a month'}</span>
            </button>
          ))}
        </div>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <div className="relative flex flex-col gap-2">
        {p.active ? (
          <div className="rounded-[20px] bg-fairway px-4 py-3.5 text-white">
            <div className="flex items-center gap-2 font-semibold"><Icon name="check" size={18} className="text-flag" /> Plus is on</div>
            <p className="m-0 mt-1 text-[13px] text-white/70">
              {p.trial ? `Trial ends in ${daysLeft(p.endsAt)} days. Paid plans open soon, and we’ll ask before charging anything.` : 'Manage your plan here once card payments open.'}
            </p>
          </div>
        ) : p.trialUsed ? (
          <div className="rounded-[20px] bg-white/80 px-4 py-3.5 text-[14px] text-fairway">
            <span className="font-semibold">Your free trial has ended.</span> Paid plans open soon. Your groups are safe in the meantime.
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={trial}
              className="min-h-14 rounded-full bg-gradient-to-b from-[#DBF79A] to-flag font-semibold text-fairway shadow-[0_10px_22px_-12px_rgba(14,31,22,0.8)] disabled:opacity-60"
            >
              {busy ? 'Starting…' : `Start ${TRIAL_DAYS}-day free trial`}
            </button>
            <p className="m-0 text-center text-[13px] text-muted">No card needed. Paid plans open soon, and we’ll ask before charging anything.</p>
          </>
        )}
      </div>
    </PhotoPage>
  )
}
