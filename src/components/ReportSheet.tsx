import { useState } from 'react'
import { blockGolfer, reportReasons, sendReport, type ReportReason } from '../lib/safety'
import { Choice, field } from './controls'
import { ErrorNote, Icon, Sheet } from './ui'

// "What happened?" (design 13): report a golfer, and block them by default.
export function ReportSheet({
  open,
  onClose,
  golferId,
  golferName,
  roundId,
  onDone,
}: {
  open: boolean
  onClose: () => void
  golferId: string
  golferName: string
  roundId?: string | null
  onDone: (blocked: boolean) => void
}) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [block, setBlock] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (!reason) return
    setBusy(true)
    setError(null)
    try {
      await sendReport({ reported_id: golferId, reason, details: details.trim() || null, round_id: roundId ?? null })
      if (block) await blockGolfer(golferId)
      onDone(block)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Report ${golferName}`}>
      <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto text-fairway">
        <div>
          <h2 className="m-0 font-display text-[26px] font-extrabold tracking-[-0.03em]">What happened?</h2>
          <p className="mt-1 mb-0 text-[14px] text-muted">Reports are private. {golferName} won’t know who sent it. We review every one within 24 hours.</p>
        </div>
        <div role="radiogroup" aria-label="Reason" className="divide-y divide-line-soft border-y border-line-soft">
          {reportReasons.map((r) => (
            <Choice key={r.value} name="report-reason" label={r.label} checked={reason === r.value} onSelect={() => setReason(r.value)} />
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] font-semibold">Anything else? <span className="font-normal text-muted">(optional)</span></span>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={1000}
            className={`${field.replace('rounded-full', 'rounded-[18px]')} block w-full py-3 text-[16px]`}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="size-6 shrink-0 accent-green" />
          <span className="text-[15px]">Also block them. You won’t see each other’s games.</span>
        </label>
        {error && <ErrorNote message={error} />}
        <button
          type="button"
          disabled={!reason || busy}
          onClick={send}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-danger font-semibold text-white disabled:opacity-50"
        >
          <Icon name="shield" size={18} />
          {busy ? 'Sending…' : 'Send report'}
        </button>
      </div>
    </Sheet>
  )
}
