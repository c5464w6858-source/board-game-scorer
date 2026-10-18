import { useEffect, useState } from 'react'
import { searchCourses, type Course } from '../lib/courses'

const field = 'min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px]'

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

  return (
    <div className="flex flex-col gap-2">
      {club && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-green bg-card px-4 py-3">
          <span>
            <span className="block font-semibold">{club.name}</span>
            {club.town && <span className="block text-sm text-muted">{club.town}</span>}
          </span>
          <button type="button" onClick={() => onChange(null)} className="min-h-11 shrink-0 text-sm text-muted underline">
            Change
          </button>
        </div>
      )}
      {!club && (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search for your home club"
            placeholder="Club, town or postcode"
            className={field}
          />
          {results.slice(0, 8).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c)
                setQuery('')
              }}
              className="min-h-11 rounded-2xl border border-line bg-card px-4 py-2 text-left"
            >
              <span className="block font-semibold">{c.name}</span>
              {c.town && <span className="block text-sm text-muted">{c.town}</span>}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
