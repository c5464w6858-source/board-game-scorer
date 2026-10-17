import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses', end: false },
]

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-xl flex-1 p-4 pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-green-200 bg-white">
        <div className="mx-auto flex max-w-xl">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-sm font-semibold ${isActive ? 'text-green-700' : 'text-slate-500'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
