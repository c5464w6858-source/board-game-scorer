const DEVICE_ID_KEY = 'bgs_device_id'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getMyPlayerId(joinCode: string): string | null {
  return localStorage.getItem(`bgs_player_${joinCode}`)
}

export function setMyPlayerId(joinCode: string, playerId: string) {
  localStorage.setItem(`bgs_player_${joinCode}`, playerId)
}
