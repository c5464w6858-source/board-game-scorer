import photo from '../../assets/login-group.jpg'
import { Logo } from '../../components/ui'
import { Actions, NextRoundHole, Picks, Requests, Section } from './blocks'
import { Bell, Greeting } from './parts'
import type { HomeData } from './useHomeData'

// Frosted white card over the photo, like the login form.
const card =
  'rounded-[22px] border border-white/50 bg-white/75 text-fairway backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_36px_-20px_rgba(0,0,0,0.55)]'

// B: the login treatment. The photo fills the screen behind a green tint and
// every card is frosted glass over it.
export function HomeFullPhoto({ d }: { d: HomeData }) {
  return (
    <div className="relative -mx-5 -mt-5 px-5 pt-5 pb-4 text-white">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] overflow-hidden bg-fairway">
        <img src={photo} alt="" className="absolute inset-0 size-full object-cover object-[42%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,33,21,0.78)_0%,rgba(13,47,27,0.6)_40%,rgba(11,33,21,0.85)_100%)]" />
      </div>

      <div className="relative flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]">
              <Logo size={36} />
            </span>
            <Greeting name={d.name} onDark />
          </div>
          <Bell waiting={d.waiting} className="border border-white/20 bg-white/10 text-white backdrop-blur" />
        </header>
        <Actions onDark />
        <Section title="Next on the tee" onDark><NextRoundHole d={d} card={card} /></Section>
        <Requests d={d} card={card} onDark />
        <Picks d={d} card={card} onDark />
      </div>
    </div>
  )
}
