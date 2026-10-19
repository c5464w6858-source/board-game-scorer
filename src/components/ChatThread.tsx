import { useEffect, useState, type FormEvent } from 'react'
import { Avatar, ErrorNote, Icon } from './ui'
import { field } from './controls'
import { glassCard } from './surfaces'
import { teeTime } from '../lib/format'
import { fetchMessages, sendMessage, subscribeToMessages, type Message } from '../lib/chat'
import type { RoundRow } from '../lib/rounds'
import { acceptedPlayers } from '../lib/rounds'

// Round chat with live updates. Only the host and accepted players can read or write.
export function ChatThread({ round, userId }: { round: RoundRow; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetchMessages(round.id).then(
      (m) => live && setMessages(m),
      (e: Error) => live && setError(e.message),
    )
    const off = subscribeToMessages(round.id, (m) =>
      setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m])),
    )
    return () => {
      live = false
      off()
    }
  }, [round.id])

  // Scroll to the newest message. The page bottom sits under the pinned composer and tab bar.
  useEffect(() => window.scrollTo({ top: document.documentElement.scrollHeight }), [messages.length])

  const people = new Map<string, { name: string; avatar: string | null }>()
  if (round.host) people.set(round.host_id, { name: round.host.display_name ?? 'Host', avatar: round.host.avatar_url })
  for (const p of acceptedPlayers(round))
    people.set(p.user_id, { name: p.profile?.display_name ?? 'Golfer', avatar: p.profile?.avatar_url ?? null })

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    setError(null)
    try {
      await sendMessage(round.id, draft)
      setDraft('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex min-h-48 flex-col gap-2.5" aria-live="polite">
        {messages.length === 0 && (
          <div className={`${glassCard} flex flex-col items-center gap-2 px-5 py-6 text-center text-fairway`}>
            <span className="grid size-12 place-items-center rounded-full bg-green-tint text-green"><Icon name="chat" size={22} /></span>
            <div className="font-display text-[18px] font-bold">No messages yet</div>
            <p className="m-0 text-[14px] text-muted">Say hello and sort out the day: lifts, buggies, a drink after.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.user_id === userId
          const who = people.get(m.user_id)
          // Only show the avatar and name on the first of a run from the same person.
          const first = messages[i - 1]?.user_id !== m.user_id
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${first ? 'mt-1.5' : ''}`}>
              {!mine && (first ? <Avatar name={who?.name ?? 'Golfer'} src={who?.avatar} size={30} /> : <span className="w-[30px] shrink-0" />)}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 text-[15px] ${
                  mine
                    ? 'rounded-[20px] rounded-br-md bg-fairway text-white shadow-[0_8px_18px_-10px_rgba(14,31,22,0.7)]'
                    : 'rounded-[20px] rounded-bl-md border border-white/90 bg-white/85 text-fairway shadow-[0_4px_12px_-6px_rgba(14,31,22,0.3)] backdrop-blur'
                }`}
              >
                {!mine && first && <div className="text-[12px] font-semibold text-green-dark">{who?.name ?? 'Golfer'}</div>}
                <div className="break-words">{m.body}</div>
                <div className={`mt-0.5 text-right font-mono text-[11px] ${mine ? 'text-flag/80' : 'text-muted'}`}>{teeTime(m.created_at)}</div>
              </div>
            </div>
          )
        })}
      </div>
      {error && <ErrorNote message={error} />}

      {/* Composer pinned just above the tab bar. */}
      <div className="h-20" aria-hidden="true" />
      <form
        onSubmit={send}
        className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto max-w-[480px] bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6 pb-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-fairway p-1.5 pl-2 shadow-[0_16px_32px_-16px_rgba(14,31,22,0.7)]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            aria-label="Message"
            placeholder="Message the group"
            className={`${field} min-h-11 min-w-0 flex-1 border-transparent text-[16px]`}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#DBF79A] to-flag text-fairway disabled:opacity-40"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
