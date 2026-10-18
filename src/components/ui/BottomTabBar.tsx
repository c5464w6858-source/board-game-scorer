import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

const tab = (to: string, label: string, icon: IconName, end = false) => ({ to, label, icon, end })
const left = [tab('/', 'Home', 'home', true), tab('/discover', 'Discover', 'compass')]
const right = [tab('/chats', 'Chats', 'chat'), tab('/me', 'You', 'user')]

function TabLink({ to, label, icon, end }: ReturnType<typeof tab>) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? 'font-semibold text-green' : 'text-muted'}`
      }
    >
      <Icon name={icon} />
      {label}
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
