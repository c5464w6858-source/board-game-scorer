import { useCallback, useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
  reload: () => void
}

// Runs `load` on mount and whenever `deps` change; `reload` re-runs it.
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true
    load().then(
      (data) => live && setState({ data, error: null, loading: false }),
      (e: Error) => live && setState({ data: null, error: e.message, loading: false }),
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
