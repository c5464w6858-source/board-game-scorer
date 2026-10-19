import type { ReactNode } from 'react'
import { ToneContext, tones, type Tone } from './tones'

// The shared page look: a photo behind a tinted header, then a light sheet of
// cards over it, with the photo fading out. The tone sets the colours for each
// part of the app, so pages in different tabs don't look alike.
export function PhotoPage({ header, children, tone = 'green' }: { header: ReactNode; children: ReactNode; tone?: Tone }) {
  const t = tones[tone]
  return (
    <ToneContext.Provider value={tone}>
      <div className="relative -mx-5 -mt-5">
        <div aria-hidden="true" className={`fixed inset-0 mx-auto max-w-[480px] ${t.page}`} />
        <img
          src={t.photo}
          alt=""
          aria-hidden="true"
          className="absolute inset-x-0 -top-[170px] h-[1050px] w-full object-cover object-[42%_center] [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]"
        />

        <section className="relative overflow-hidden px-5 pt-5 pb-14 text-white">
          {/* Tint over the photo, darker behind the title. */}
          <div aria-hidden="true" className={`absolute inset-0 ${t.tint}`} />
          <div className="relative">{header}</div>
        </section>

        <div className="relative -mt-7 flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-t-[30px] px-5 pt-6 pb-4">
          <div aria-hidden="true" className={`absolute inset-0 overflow-hidden rounded-t-[30px] bg-gradient-to-b backdrop-blur-[2px] ${t.sheet}`}>
            <div className={`absolute top-24 -left-20 size-72 rounded-full blur-3xl ${t.blobs[0]}`} />
            <div className={`absolute top-[42%] -right-24 size-72 rounded-full blur-3xl ${t.blobs[1]}`} />
            <div className={`absolute bottom-10 left-10 size-64 rounded-full blur-3xl ${t.blobs[2]}`} />
          </div>
          {children}
        </div>
      </div>
    </ToneContext.Provider>
  )
}
