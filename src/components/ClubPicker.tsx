import { useEffect, useState } from 'react'
import { searchCourses, type Course } from '../lib/courses'
import { field } from './controls'
import { glassCard } from './surfaces'
import { Icon } from './ui'

// Search the UK course list and pick one, e.g. a golfer's home club.
export function ClubPicker({ club, onChange }: { club: Course | null; onChange: (c: Course | null) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])

  useEffect(() => {
    if (query.trim().length < 2) return setResults([])
    let live = true
    searchCourses(query).then(
      (r) => live && setResults(r),
      () => live && setResults([]),
    )
    return () => {
      live = false
    }
  }, [query])

  if (club)
    return (
      <div className={`${glassCard} flex items-center gap-3 p-3.5 text-fairway ring-2 ring-green/45`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-fairway text-flag">
          <Icon name="tee" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{club.name}</span>
          {club.town && <span className="block truncate text-[13px] text-muted">{club.town}</span>}
        </span>
        <button type="button" onClick={() => onChange(null)} className="min-h-11 shrink-0 text-[13px] font-semibold text-green">
          Change
        </button>
      </div>
    )

  return (
    <div className="flex flex-col gap-2">
      <label className="relative block">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"><Icon name="search" size={18} /></span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for your home club"
          placeholder="Club, town or postcode"
          className={`${field} w-full pl-11 text-[16px]`}
        />
      </label>
      {results.length > 0 && (
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
          {results.slice(0, 8).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c)
                setQuery('')
              }}
              className="block min-h-11 w-full px-4 py-2.5 text-left"
            >
              <span className="block font-semibold">{c.name}</span>
              {c.town && <span className="block text-[13px] text-muted">{c.town}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
