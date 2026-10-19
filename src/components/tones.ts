import { createContext, useContext } from 'react'
import fairwayPhoto from '../assets/hero-green.jpg'
import groupPhoto from '../assets/login-group.jpg'

// Each part of the app has its own colour, so you can tell where you are:
// green for home and rounds, links teal for finding games and courses,
// clay for chats, heather for you and your people, navy for societies & trips.
export type Tone = 'green' | 'navy' | 'links' | 'clay' | 'heather'

export const tones: Record<
  Tone,
  { photo: string; tint: string; page: string; sheet: string; blobs: [string, string, string]; badge: string; title: string; rule: string; bar: string; fade: string }
> = {
  green: {
    photo: groupPhoto,
    tint: 'bg-[linear-gradient(180deg,rgba(11,33,21,0.87)_0%,rgba(13,47,27,0.74)_55%,rgba(15,66,36,0.67)_100%)]',
    page: 'bg-[#ECEAE3]',
    sheet: 'from-[#F4F2EC]/70 via-[#F0EEE7]/85 to-[#ECEAE3]',
    blobs: ['bg-[#9DC39A]/45', 'bg-flag/35', 'bg-[#B7D3B0]/40'],
    badge: 'bg-fairway text-flag',
    title: 'text-fairway',
    rule: 'bg-fairway/15',
    bar: 'bg-fairway',
    fade: 'from-[#ECEAE3] via-[#ECEAE3]/90',
  },
  navy: {
    photo: groupPhoto,
    tint: 'bg-[linear-gradient(180deg,rgba(10,19,38,0.92)_0%,rgba(15,28,51,0.8)_55%,rgba(23,42,74,0.72)_100%)]',
    page: 'bg-[#EFE9DC]',
    sheet: 'from-[#F8F4EA]/75 via-[#F4EEE2]/90 to-[#EFE9DC]',
    blobs: ['bg-[#9FB3D6]/40', 'bg-gold/35', 'bg-[#C9D3E6]/40'],
    badge: 'bg-navy text-gold',
    title: 'text-navy',
    rule: 'bg-gold/50',
    bar: 'bg-navy',
    fade: 'from-[#EFE9DC] via-[#EFE9DC]/90',
  },
  links: {
    photo: fairwayPhoto,
    tint: 'bg-[linear-gradient(180deg,rgba(6,38,46,0.9)_0%,rgba(10,58,68,0.76)_55%,rgba(14,80,90,0.66)_100%)]',
    page: 'bg-[#E5EDEB]',
    sheet: 'from-[#F0F6F4]/75 via-[#EAF1EF]/90 to-[#E5EDEB]',
    blobs: ['bg-[#8FC9C2]/40', 'bg-links-soft/35', 'bg-[#B5D6D0]/40'],
    badge: 'bg-links text-links-soft',
    title: 'text-links',
    rule: 'bg-links/20',
    bar: 'bg-links',
    fade: 'from-[#E5EDEB] via-[#E5EDEB]/90',
  },
  clay: {
    photo: groupPhoto,
    tint: 'bg-[linear-gradient(180deg,rgba(40,26,15,0.92)_0%,rgba(59,40,25,0.8)_55%,rgba(86,58,34,0.72)_100%)]',
    page: 'bg-[#EFE8DF]',
    sheet: 'from-[#F7F2EB]/75 via-[#F3EDE4]/90 to-[#EFE8DF]',
    blobs: ['bg-[#D4BC9C]/40', 'bg-sand/40', 'bg-[#DCCBB3]/40'],
    badge: 'bg-clay text-sand',
    title: 'text-clay',
    rule: 'bg-clay/20',
    bar: 'bg-clay',
    fade: 'from-[#EFE8DF] via-[#EFE8DF]/90',
  },
  heather: {
    photo: groupPhoto,
    tint: 'bg-[linear-gradient(180deg,rgba(30,17,40,0.92)_0%,rgba(47,29,59,0.8)_55%,rgba(68,42,84,0.72)_100%)]',
    page: 'bg-[#EEE8EE]',
    sheet: 'from-[#F6F1F5]/75 via-[#F2ECF1]/90 to-[#EEE8EE]',
    blobs: ['bg-[#C6A9C9]/40', 'bg-heather-soft/40', 'bg-[#D8C6DA]/40'],
    badge: 'bg-heather text-heather-soft',
    title: 'text-heather',
    rule: 'bg-heather/20',
    bar: 'bg-heather',
    fade: 'from-[#EEE8EE] via-[#EEE8EE]/90',
  },
}

// The page's tone, so Section headings and the action bar match without being told.
export const ToneContext = createContext<Tone>('green')
export const useTone = (override?: Tone) => {
  const tone = useContext(ToneContext)
  return tones[override ?? tone]
}
