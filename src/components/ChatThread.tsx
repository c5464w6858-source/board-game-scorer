import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Avatar, ErrorNote, Icon } from './ui'
import { fetchMessages, sendMessage, subscribeToMessages, type Message } from '../lib/chat'
import type { RoundRow } from '../lib/rounds'
import { acceptedPlayers } from '../lib/rounds'

// Round chat with live updates. Only the host and accepted players can read or write.
export function ChatThread({ round, userId }: { round: RoundRow; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)

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

  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [messages.length])

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
    <div className="flex flex-col gap-3">
      <div className="flex min-h-48 flex-col gap-2.5" aria-live="polite">
        {messages.length === 0 && <p className="m-0 py-8 text-center text-muted">No messages yet. Say hello.</p>}
        {messages.map((m) => {
          const mine = m.user_id === userId
          const who = people.get(m.user_id)
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              <Avatar name={who?.name ?? 'Golfer'} src={who?.avatar} size={28} />
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${mine ? 'bg-green text-white' : 'bg-chip'}`}>
                {!mine && <div className="text-xs font-semibold text-muted">{who?.name ?? 'Golfer'}</div>}
                <div className="break-words">{m.body}</div>
              </div>
            </div>
          )
        })}
        <div ref={end} />
      </div>
      {error && <ErrorNote message={error} />}
      <form onSubmit={send} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          aria-label="Message"
          placeholder="Message the group"
          className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-card px-4"
        />
        <button type="submit" aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-full bg-green text-white">
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  )
}
