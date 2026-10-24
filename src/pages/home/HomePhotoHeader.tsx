import { PhotoPage } from '../../components/PhotoPage'
import { glassCard as card } from '../../components/surfaces'
import { Logo } from '../../components/ui'
import { Actions, MyRounds, Picks, PlusCard, Requests, UrgentAlert } from './blocks'
import { Bell, Greeting } from './parts'
import type { HomeData } from './useHomeData'

export function HomePhotoHeader({ d }: { d: HomeData }) {
  return (
    <PhotoPage
      header={
        <>
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]">
                <Logo size={36} />
              </span>
              <Greeting name={d.name} onDark />
            </div>
            <Bell waiting={d.waiting} className="border border-white/15 bg-white/10 text-white backdrop-blur" />
          </header>
          <div className="mt-5"><Actions d={d} /></div>
          <PlusCard d={d} />
        </>
      }
    >
      <UrgentAlert d={d} />
      <MyRounds d={d} card={card} />
      <Requests d={d} card={card} />
      <Picks d={d} card={card} />
    </PhotoPage>
  )
}
