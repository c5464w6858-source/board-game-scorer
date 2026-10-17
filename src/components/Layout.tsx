import { Outlet } from 'react-router-dom'
import { BottomTabBar } from './ui'

export function Layout() {
  return (
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col bg-clubhouse">
      <main className="flex-1 px-5 pt-5 pb-28">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
