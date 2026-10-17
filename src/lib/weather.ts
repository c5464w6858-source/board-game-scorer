// Free forecast from Open-Meteo (no key). Only shown within 7 days of tee time.
export interface Forecast {
  temp: number
  label: string
}

const WITHIN_MS = 7 * 864e5

function describe(code: number, wind: number) {
  if (code >= 95) return 'storms'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 51) return 'rain'
  if (code >= 45) return 'fog'
  if (wind >= 25) return 'breezy'
  if (code === 0 || code === 1) return 'sun'
  return 'cloud'
}

export async function fetchForecast(lat: number, lon: number, iso: string): Promise<Forecast | null> {
  const when = new Date(iso)
  const ahead = when.getTime() - Date.now()
  if (ahead < 0 || ahead > WITHIN_MS) return null
  const day = iso.slice(0, 10)
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FLondon&start_date=${day}&end_date=${day}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const { hourly } = await res.json()
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false }).format(when),
    )
    return {
      temp: Math.round(hourly.temperature_2m[hour]),
      label: describe(hourly.weather_code[hour], hourly.wind_speed_10m[hour]),
    }
  } catch {
    return null
  }
}
