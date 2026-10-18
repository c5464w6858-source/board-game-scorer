import groupImg from '../../assets/login-group.jpg'
import { Logo } from '../../components/ui'
import { FreeLine, LoginForm } from './LoginForm'

// Option 1: the group photo fills the screen; the form sits on a frosted card.
export function LoginSunset() {
  return (
    <main className="relative mx-auto flex min-h-full max-w-[480px] flex-col overflow-hidden bg-fairway text-white">
      <img src={groupImg} alt="" className="absolute inset-x-0 top-0 h-[62%] w-full object-cover object-[60%_30%]" />
      <div className="absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-fairway/55 via-fairway/10 to-fairway" />

      <header className="relative flex items-center gap-2.5 px-5 pt-5">
        <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.35)]">
          <Logo size={36} />
        </span>
        <span className="font-display text-[21px] font-extrabold tracking-[-0.02em] [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
          BuddyGolf
        </span>
      </header>

      <div className="relative mt-auto flex flex-col gap-5 px-4 pt-40 pb-6">
        <div className="px-1 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
          <h1 className="m-0 font-display text-[38px] leading-[1] font-extrabold tracking-[-0.04em]">
            Golf’s better
            <br />
            with buddies.
          </h1>
          <p className="mt-2 mb-0 text-[15px] font-medium text-white/90">Find a four near you, or fill your own.</p>
        </div>
        <section aria-label="Sign in" className="rounded-[28px] bg-clubhouse/95 p-5 text-fairway shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
          <LoginForm />
        </section>
        <FreeLine tone="dark" />
      </div>
    </main>
  )
}
