import { Logo } from '../../components/ui'
import { Actions, NextRoundPhoto, Picks, Requests, Section } from './blocks'
import { Bell, Greeting } from './parts'
import type { HomeData } from './useHomeData'

const card = 'rounded-[22px] border border-[#DAD7CC] bg-card shadow-[0_12px_28px_-18px_rgba(14,31,22,0.4)]'

// C: a light page; the next round is a large photo card like a magazine cover.
export function HomePhotoCard({ d }: { d: HomeData }) {
  return (
    <div className="relative -mx-5 -mt-5 px-5 pt-5 pb-4">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-gradient-to-b from-[#F4F2EC] to-[#E9E6DD]" />
      <div className="relative flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <Greeting name={d.name} />
          </div>
          <Bell waiting={d.waiting} className="border border-[#DAD7CC] bg-card text-fairway" />
        </header>
        <Actions onDark={false} />
        <Section title="Next on the tee"><NextRoundPhoto d={d} /></Section>
        <Requests d={d} card={card} />
        <Picks d={d} card={card} />
      </div>
    </div>
  )
}
