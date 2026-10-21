import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorNote, Icon, Loading } from '../components/ui'
import { daysLeft, FREE_JOINS_PER_MONTH, fetchMyPlan, fetchUsage, PLUS_PRICES, startPlusTrial, TRIAL_DAYS, WAITING_LIMIT } from '../lib/plus'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

// What Plus adds today. Hosting stays free and unlimited for everyone.
const rows: { label: string; free: string; plus: string }[] = [
  { label: 'Rounds you join', free: '2 a month', plus: 'Unlimited' },
  { label: 'Join requests out', free: '1 at a time', plus: '5 at a time' },
  { label: 'Rounds you host', free: 'Unlimited', plus: 'Unlimited' },
  { label: 'Top of the host’s list', free: '–', plus: 'Yes' },
  { label: 'Start a society or trip', free: '–', plus: 'Yes' },
  { label: 'Ryder Cup and leaderboards', free: '–', plus: 'Yes' },
]

// "1 Nov": when the free joining limit resets.
const resetDate = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// BuddyGolf Plus (design 23): a dark, full-screen page so it reads as the
// one place the app takes payment, apart from every other screen.
export function Plus() {
  const me = useUserId()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const fromGroups = params.get('from') === 'groups'
  const plan = useAsync(async () => {
    const [p, usage] = await Promise.all([fetchMyPlan(me), fetchUsage()])
    return { ...p, usage }
  }, [me])
  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (plan.loading) return <Loading />
  if (plan.error || !plan.data) return <ErrorNote message={plan.error ?? 'Something went wrong'} />
  const p = plan.data
  const joined = p.usage.joined_this_month

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
    <div className="fixed inset-0 z-[1100] mx-auto flex max-w-[480px] flex-col bg-[#0B1A12] text-white">
      {/* Soft lime glow behind the wordmark. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-flag/15 blur-3xl" />

      <div className="relative flex-1 overflow-y-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em]">
            buddy<span className="text-flag">golf</span> plus
          </div>
          <button type="button" aria-label="Close" onClick={() => navigate(-1)} className="grid size-12 shrink-0 place-items-center rounded-full border border-white/20 text-white">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {p.active ? (
            <div className="rounded-[20px] border border-flag/40 bg-[#17301F] px-4 py-3.5">
              <div className="flex items-center gap-2 font-semibold"><Icon name="check" size={18} className="text-flag" /> Plus is on</div>
              <p className="m-0 mt-1 text-[14px] text-white/70">
                {p.trial
                  ? `Free trial · ${daysLeft(p.endsAt)} day${daysLeft(p.endsAt) === 1 ? '' : 's'} left. Paid plans open soon, and we’ll ask before charging anything.`
                  : 'Thanks for backing BuddyGolf.'}
              </p>
            </div>
          ) : fromGroups ? (
            <div className="flex gap-3 rounded-[20px] border border-gold/50 bg-navy px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-navy"><Icon name="lock" size={18} /></span>
              <p className="m-0 text-[14px] text-white/80">
                <span className="block font-semibold text-gold-soft">Starting a society or trip needs Plus</span>
                Your golfers join free with your invite code.
              </p>
            </div>
          ) : null}

          {!p.active && p.usage.limits_on && (
            <div className="rounded-[20px] bg-[#17301F] px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px]">Free rounds joined this month</span>
                <span className="font-mono text-[18px] font-semibold text-flag">
                  {Math.min(joined, FREE_JOINS_PER_MONTH)} of {FREE_JOINS_PER_MONTH}
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-flag" style={{ width: `${Math.min(100, (joined / FREE_JOINS_PER_MONTH) * 100)}%` }} />
              </div>
              <p className="m-0 mt-2.5 text-[13px] text-white/60">
                {p.usage.waiting >= WAITING_LIMIT.free ? 'Your 1 free join request is in use. ' : ''}
                {joined >= FREE_JOINS_PER_MONTH ? 'You’ve used this month’s free rounds. Go Plus to keep joining.' : 'Hosting never counts towards this.'}
              </p>
            </div>
          )}
        </div>

        <table className="mt-5 w-full border-collapse text-[15px]">
          <caption className="sr-only">Free compared with Plus</caption>
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className="w-[92px] pb-2 text-center text-[13px] font-medium text-white/60">Free</th>
              <th scope="col" className="w-[104px] rounded-t-xl bg-flag py-2 text-center text-[13px] font-bold text-fairway">Plus</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className="border-t border-white/10">
                <th scope="row" className="py-3 pr-2 text-left font-normal">{r.label}</th>
                <td className="text-center text-[13px] text-white/60">{r.free}</td>
                <td className={`bg-[#17301F] text-center text-[14px] font-semibold ${r.plus === 'Yes' ? 'text-flag' : ''} ${i === rows.length - 1 ? 'rounded-b-xl' : ''}`}>{r.plus}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {(['yearly', 'monthly'] as const).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={billing === b}
              onClick={() => setBilling(b)}
              className={`relative flex flex-col items-start gap-0.5 rounded-[20px] border-2 px-4 py-3.5 text-left ${billing === b ? 'border-flag' : 'border-white/15'}`}
            >
              {b === 'yearly' && <span className="absolute -top-3 right-3 rounded-full bg-flag px-2.5 py-0.5 text-[12px] font-semibold text-fairway">Save 37%</span>}
              <span className="text-[14px] text-white/70">{b === 'yearly' ? 'Yearly' : 'Monthly'}</span>
              <span className="font-mono text-[26px] font-semibold">{PLUS_PRICES[b]}</span>
              <span className="text-[12px] text-white/50">{b === 'yearly' ? '£2.50 a month' : 'a month'}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 mb-0 text-center text-[13px] text-white/50">The only thing BuddyGolf charges for. Green fees are always paid at the club.</p>
        {error && <div className="mt-3"><ErrorNote message={error} /></div>}
      </div>

      <div className="relative border-t border-white/10 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {p.active ? (
          <button type="button" onClick={() => navigate(next ?? '/', { replace: !!next })} className="min-h-14 w-full rounded-full border-2 border-flag font-semibold text-flag">
            {next ? 'Carry on' : 'Done'}
          </button>
        ) : p.trialUsed ? (
          <p className="m-0 py-2 text-center text-[14px] text-white/70">Your free trial has ended. Paid plans open soon.</p>
        ) : (
          <>
            <button type="button" disabled={busy} onClick={trial} className="min-h-14 w-full rounded-full bg-flag text-[18px] font-semibold text-fairway disabled:opacity-60">
              {busy ? 'Starting…' : `Try free for ${TRIAL_DAYS} days`}
            </button>
            <p className="m-0 mt-2 text-center text-[13px] text-white/60">
              No card needed for the trial. {p.usage.limits_on ? `Free rounds reset on ${resetDate()}.` : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
