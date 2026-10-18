import { useEffect, type ReactNode } from 'react'

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-fairway/50"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[480px] rounded-t-[28px] bg-card px-5 pt-3 pb-8"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {children}
      </section>
    </div>
  )
}
