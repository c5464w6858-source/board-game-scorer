import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

// Each tab lights up in its section's colour (see components/tones.ts).
const tab = (to: string, label: string, icon: IconName, pill: string, text: string, end = false) => ({ to, label, icon, pill, text, end })
const left = [tab('/', 'Home', 'home', 'bg-fairway text-flag', 'text-fairway', true), tab('/discover', 'Discover', 'compass', 'bg-links text-links-soft', 'text-links')]
const right = [tab('/chats', 'Chats', 'chat', 'bg-lake text-lake-soft', 'text-lake'), tab('/me', 'You', 'user', 'bg-heather text-heather-soft', 'text-heather')]

function TabLink({ to, label, icon, pill, text, end }: ReturnType<typeof tab>) {
  return (
    <NavLink to={to} end={end} className="flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] no-underline">
      {({ isActive }) => (
        <>
          <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? pill : 'text-muted'}`}>
            <Icon name={icon} size={20} />
          </span>
          <span className={isActive ? `font-semibold ${text}` : 'text-muted'}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomTabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[1000] mx-auto grid max-w-[480px] grid-cols-5 items-center border-t border-line bg-card px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {left.map((t) => (
        <TabLink key={t.to} {...t} />
      ))}
      <NavLink
        to="/host"
        aria-label="Host a round"
        className="grid size-[52px] place-items-center justify-self-center rounded-full bg-fairway text-flag"
      >
        <Icon name="plus" strokeWidth={2.2} />
      </NavLink>
      {right.map((t) => (
        <TabLink key={t.to} {...t} />
      ))}
    </nav>
  )
}
