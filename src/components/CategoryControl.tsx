import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { nextRoundIndex } from '../lib/scoring'
import type { CategoryDef, ScoreEntry } from '../types'

interface Props {
  category: CategoryDef
  sessionId: string
  playerId: string
  scores: ScoreEntry[]
}

async function upsertSingle(sessionId: string, playerId: string, category: CategoryDef, existing: ScoreEntry | undefined, value: number) {
  if (existing) {
    await supabase.from('scores').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('scores').insert({
      session_id: sessionId,
      player_id: playerId,
      category_key: category.key,
      value,
      round: null,
    })
  }
}

async function addEntry(sessionId: string, playerId: string, category: CategoryDef, value: number, round: number) {
  await supabase.from('scores').insert({
    session_id: sessionId,
    player_id: playerId,
    category_key: category.key,
    value,
    round,
  })
}

async function removeEntry(id: string) {
  await supabase.from('scores').delete().eq('id', id)
}

export function CategoryControl({ category, sessionId, playerId, scores }: Props) {
  const mine = scores.filter((s) => s.player_id === playerId && s.category_key === category.key)

  if (category.type === 'checkbox') {
    const existing = mine[0]
    const on = (existing?.value ?? 0) > 0
    return (
      <button
        type="button"
        onClick={() => upsertSingle(sessionId, playerId, category, existing, on ? 0 : 1)}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
          on ? 'border-transparent bg-[var(--game-primary)] text-white' : 'border-slate-300 bg-white text-slate-600'
        }`}
      >
        {category.label} {on ? `(+${category.weight})` : ''}
      </button>
    )
  }

  if (category.type === 'counter' && !category.repeatable) {
    const existing = mine[0]
    const count = existing?.value ?? 0
    const setCount = (n: number) => {
      const clamped = Math.max(category.min ?? 0, category.max !== undefined ? Math.min(category.max, n) : n)
      upsertSingle(sessionId, playerId, category, existing, clamped)
    }
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="text-sm text-slate-600">{category.label}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCount(count - 1)} className="h-6 w-6 rounded bg-slate-100 text-slate-700">
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{count}</span>
          <button type="button" onClick={() => setCount(count + 1)} className="h-6 w-6 rounded bg-slate-100 text-slate-700">
            +
          </button>
        </div>
      </div>
    )
  }

  if (category.type === 'number' && !category.repeatable) {
    const existing = mine[0]
    return (
      <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="text-sm text-slate-600">{category.label}</span>
        <input
          type="number"
          className="w-16 rounded border border-slate-200 px-2 py-1 text-right text-sm"
          defaultValue={existing?.value ?? 0}
          onBlur={(e) => upsertSingle(sessionId, playerId, category, existing, Number(e.target.value) || 0)}
        />
      </label>
    )
  }

  // Repeatable: number, counter, or table
  return <RepeatableCategory category={category} sessionId={sessionId} playerId={playerId} entries={mine} />
}

function RepeatableCategory({
  category,
  sessionId,
  playerId,
  entries,
}: {
  category: CategoryDef
  sessionId: string
  playerId: string
  entries: ScoreEntry[]
}) {
  const [draft, setDraft] = useState(category.options ? category.options[0].value : 0)
  const total = entries.reduce((s, e) => s + e.value, 0)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{category.label}</span>
        <span className="text-xs text-slate-400">{total * category.weight} pts</span>
      </div>
      <ul className="mb-2 space-y-1">
        {entries
          .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))
          .map((e) => (
            <li key={e.id} className="flex items-center justify-between text-sm text-slate-600">
              <span>
                {category.options?.find((o) => o.value === e.value)?.label ?? `+${e.value}`}
              </span>
              <button type="button" onClick={() => removeEntry(e.id)} className="text-xs text-slate-400 hover:text-red-500">
                remove
              </button>
            </li>
          ))}
        {entries.length === 0 && <li className="text-xs text-slate-400">No entries yet</li>}
      </ul>
      <div className="flex items-center gap-2">
        {category.options ? (
          <select
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
          >
            {category.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
          />
        )}
        <button
          type="button"
          onClick={() => addEntry(sessionId, playerId, category, draft, nextRoundIndex(category, playerId, entries))}
          className="rounded bg-[var(--game-primary)] px-3 py-1 text-sm font-medium text-white"
        >
          Add
        </button>
      </div>
      {category.helpText && <p className="mt-1 text-xs text-slate-400">{category.helpText}</p>}
    </div>
  )
}
