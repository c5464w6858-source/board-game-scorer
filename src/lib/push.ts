import { supabase } from './supabase'

// Public half of the VAPID key pair; the private half stays in the database vault.
const VAPID_PUBLIC_KEY = 'BOCO3VMaA_HQHT_ZEmzq5lT0ZMABqPvKB6iKOArVMB2uIVn3_kI0BUbmVfZOfE1-sbM1rN10GlF3YhC4Yeut0VA'

export type PushKind = 'requests' | 'chat' | 'buddies' | 'need_player'

export const pushKinds: { value: PushKind; label: string; hint: string }[] = [
  { value: 'requests', label: 'Join requests', hint: 'Someone asks to join your round, or a host answers you' },
  { value: 'need_player', label: 'Need a player', hint: 'A buddy, or a game when you said you’re free, is one short' },
  { value: 'chat', label: 'Round chat', hint: 'New messages in rounds you’re playing' },
  { value: 'buddies', label: 'Buddy requests', hint: 'Someone wants to be buddies, or says yes' },
]

// What this phone can do. iPhones only allow push once BuddyGolf is on the Home Screen.
export type PushSupport = 'ok' | 'install-first' | 'blocked' | 'unsupported'

export function pushSupport(): PushSupport {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const installed = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return ios && !installed ? 'install-first' : 'unsupported'
  }
  if (Notification.permission === 'denied') return 'blocked'
  return 'ok'
}

async function registration() {
  await navigator.serviceWorker.register('/sw.js')
  return navigator.serviceWorker.ready
}

export async function isPushOn() {
  if (pushSupport() !== 'ok' || Notification.permission !== 'granted') return false
  const reg = await registration()
  return (await reg.pushManager.getSubscription()) != null
}

function keyBytes(base64url: string) {
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64url.length / 4) * 4, '=')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

// Asks permission, subscribes this browser and saves it against the signed-in golfer.
export async function turnOnPush() {
  if ((await Notification.requestPermission()) !== 'granted') {
    throw new Error('Notifications are blocked for BuddyGolf. Allow them in your phone’s settings, then try again.')
  }
  const reg = await registration()
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }))
  const json = sub.toJSON()
  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh ?? '',
    p_auth: json.keys?.auth ?? '',
    p_user_agent: navigator.userAgent,
  })
  if (error) throw error
}

export async function turnOffPush() {
  const reg = await registration()
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  if (error) throw error
  await sub.unsubscribe()
}

export async function sendTestPush() {
  const { error } = await supabase.rpc('send_test_push')
  if (error) throw error
}
