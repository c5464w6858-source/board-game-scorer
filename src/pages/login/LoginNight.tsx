import teeImg from '../../assets/login-tee.jpg'
import { Logo } from '../../components/ui'
import { FreeLine, LoginForm } from './LoginForm'

// Option 3: all-dark brand screen, the tee shot dimmed behind a lime headline.
export function LoginNight() {
  return (
    <main className="relative mx-auto flex min-h-full max-w-[480px] flex-col overflow-hidden bg-fairway text-white">
      {/* The tee photo is low resolution, so it's blurred and dimmed rather than shown sharp. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[320px] overflow-hidden">
        <img src={teeImg} alt="" className="size-full scale-110 object-cover object-[30%_20%] opacity-50 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-fairway/30 via-fairway/60 via-60% to-fairway" />
      </div>

      <div className="relative flex flex-1 flex-col gap-6 px-5 pt-6 pb-6">
        <header className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-display text-[21px] font-extrabold tracking-[-0.02em]">BuddyGolf</span>
        </header>

        <div className="pt-16">
          <h1 className="m-0 font-display text-[40px] leading-[0.98] font-extrabold tracking-[-0.045em]">
            Tee it up
            <br />
            <span className="text-flag">with new buddies.</span>
          </h1>
          <p className="mt-3 mb-0 text-[15px] text-muted-dark">Golfers near you, matched on handicap, pace and time.</p>
        </div>

        <LoginForm tone="dark" />
        <div className="mt-auto">
          <FreeLine tone="dark" />
        </div>
      </div>
    </main>
  )
}
