import type { ReactNode } from 'react'
import photo from '../assets/login-group.jpg'

// The look shared by Home and Discover: the login's photo behind a green
// header, then a light sheet of cards over it, with the photo fading out.
// tone="navy" is the Societies & trips look: navy over the photo and a warm cream sheet.
export function PhotoPage({ header, children, tone = 'green' }: { header: ReactNode; children: ReactNode; tone?: 'green' | 'navy' }) {
  const navy = tone === 'navy'
  return (
    <div className="relative -mx-5 -mt-5">
      <div aria-hidden="true" className={`fixed inset-0 mx-auto max-w-[480px] ${navy ? 'bg-[#EFE9DC]' : 'bg-[#ECEAE3]'}`} />
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 -top-[170px] h-[1050px] w-full object-cover object-[42%_center] [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]"
      />

      <section className="relative overflow-hidden px-5 pt-5 pb-14 text-white">
        {/* Green tint over the photo, darker behind the title. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            navy
              ? 'bg-[linear-gradient(180deg,rgba(10,19,38,0.92)_0%,rgba(15,28,51,0.8)_55%,rgba(23,42,74,0.72)_100%)]'
              : 'bg-[linear-gradient(180deg,rgba(11,33,21,0.87)_0%,rgba(13,47,27,0.74)_55%,rgba(15,66,36,0.67)_100%)]'
          }`}
        />
        <div className="relative">{header}</div>
      </section>

      <div className="relative -mt-7 flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-t-[30px] px-5 pt-6 pb-4">
        <div aria-hidden="true" className={`absolute inset-0 overflow-hidden rounded-t-[30px] bg-gradient-to-b backdrop-blur-[2px] ${
            navy ? 'from-[#F8F4EA]/75 via-[#F4EEE2]/90 to-[#EFE9DC]' : 'from-[#F4F2EC]/70 via-[#F0EEE7]/85 to-[#ECEAE3]'
          }`}>
          <div className={`absolute top-24 -left-20 size-72 rounded-full blur-3xl ${navy ? 'bg-[#9FB3D6]/40' : 'bg-[#9DC39A]/45'}`} />
          <div className={`absolute top-[42%] -right-24 size-72 rounded-full blur-3xl ${navy ? 'bg-gold/35' : 'bg-flag/35'}`} />
          <div className={`absolute bottom-10 left-10 size-64 rounded-full blur-3xl ${navy ? 'bg-[#C9D3E6]/40' : 'bg-[#B7D3B0]/40'}`} />
        </div>
        {children}
      </div>
    </div>
  )
}
