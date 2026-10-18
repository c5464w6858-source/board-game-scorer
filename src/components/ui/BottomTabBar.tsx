import { NavLink, useLocation } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

const tab = (to: string, label: string, icon: IconName, end = false) => ({ to, label, icon, end })
const left = [tab('/', 'Home', 'home', true), tab('/discover', 'Discover', 'compass')]
const right = [tab('/chats', 'Chats', 'chat'), tab('/me', 'You', 'user')]

// Screens drawn on the dark fairway surface get a matching dark tab bar.
const darkRoutes = ['/']

function TabLink({ to, label, icon, end, dark }: ReturnType<typeof tab> & { dark: boolean }) {
  const on = dark ? 'font-semibold text-flag' : 'font-semibold text-green'
  const off = dark ? 'text-muted-dark' : 'text-muted'
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? on : off}`}
    >
      <Icon name={icon} />
      {label}
    </NavLink>
  )
}

export function BottomTabBar() {
  const dark = darkRoutes.includes(useLocation().pathname)
  return (
    <nav
      aria-label="Main"
      className={`fixed inset-x-0 bottom-0 z-[1000] mx-auto grid max-w-[480px] grid-cols-5 items-center border-t px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] ${
        dark ? 'border-white/10 bg-fairway/85 backdrop-blur-xl' : 'border-line bg-card'
      }`}
    >
      {left.map((t) => (
        <TabLink key={t.to} {...t} dark={dark} />
      ))}
      <NavLink
        to="/host"
        aria-label="Host a round"
        className={`grid size-[52px] place-items-center justify-self-center rounded-full ${dark ? 'bg-flag text-fairway' : 'bg-fairway text-flag'}`}
      >
        <Icon name="plus" strokeWidth={2.2} />
      </NavLink>
      {right.map((t) => (
        <TabLink key={t.to} {...t} dark={dark} />
      ))}
    </nav>
  )
}
