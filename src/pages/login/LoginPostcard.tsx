import highfiveImg from '../../assets/login-highfive.jpg'
import { Logo } from '../../components/ui'
import { FreeLine, LoginForm } from './LoginForm'

// Option 2: light and airy, with the photo framed like a postcard and a centred brand.
export function LoginPostcard() {
  return (
    <main className="mx-auto flex min-h-full max-w-[480px] flex-col gap-5 bg-card px-5 pt-5 pb-6">
      <div className="relative h-[190px] overflow-hidden rounded-[28px]">
        <img src={highfiveImg} alt="" className="size-full object-cover object-[55%_35%]" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-green">BuddyGolf</span>
        </div>
        <h1 className="m-0 font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.04em]">
          Never play short of a four.
        </h1>
        <p className="m-0 text-[15px] text-muted">Join open games or host your own. Hosting is free.</p>
      </div>

      <LoginForm />
      <div className="mt-auto">
        <FreeLine />
      </div>
    </main>
  )
}
