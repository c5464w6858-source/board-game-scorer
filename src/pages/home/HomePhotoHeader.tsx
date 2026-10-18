import photo from '../../assets/login-group.jpg'
import { Logo } from '../../components/ui'
import { Actions, NextRoundHole, Picks, Requests, Section } from './blocks'
import { Bell, Greeting } from './parts'
import type { HomeData } from './useHomeData'

// Frosted white card used on the light sheet.
const card =
  'rounded-[22px] border border-white/90 bg-white/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(14,31,22,0.06),0_16px_32px_-20px_rgba(14,31,22,0.45)]'

// A: the photo behind a green header, running down behind a light sheet of
// cards and fading out.
export function HomePhotoHeader({ d }: { d: HomeData }) {
  return (
    <div className="relative -mx-5 -mt-5">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-[#ECEAE3]" />
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 -top-[170px] h-[1050px] w-full object-cover object-[42%_center] [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]"
      />

      <section className="relative overflow-hidden px-5 pt-5 pb-14 text-white">
        {/* Green tint over the photo, darker behind the greeting. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,33,21,0.87)_0%,rgba(13,47,27,0.74)_55%,rgba(15,66,36,0.67)_100%)]" />
        <header className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]">
              <Logo size={36} />
            </span>
            <Greeting name={d.name} onDark />
          </div>
          <Bell waiting={d.waiting} className="border border-white/15 bg-white/10 text-white backdrop-blur" />
        </header>
        <div className="mt-6"><Actions onDark /></div>
      </section>

      <div className="relative -mt-7 flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-t-[30px] px-5 pt-6 pb-4">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-t-[30px] bg-gradient-to-b from-[#F4F2EC]/70 via-[#F0EEE7]/85 to-[#ECEAE3] backdrop-blur-[2px]">
          <div className="absolute top-24 -left-20 size-72 rounded-full bg-[#9DC39A]/45 blur-3xl" />
          <div className="absolute top-[42%] -right-24 size-72 rounded-full bg-flag/35 blur-3xl" />
          <div className="absolute bottom-10 left-10 size-64 rounded-full bg-[#B7D3B0]/40 blur-3xl" />
        </div>
        <Section title="Next on the tee"><NextRoundHole d={d} card={card} /></Section>
        <Requests d={d} card={card} />
        <Picks d={d} card={card} />
      </div>
    </div>
  )
}
