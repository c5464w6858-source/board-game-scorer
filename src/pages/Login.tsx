import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LoginNight } from './login/LoginNight'
import { LoginPostcard } from './login/LoginPostcard'
import { LoginSunset } from './login/LoginSunset'

// Three layouts to choose between, at /login/1, /login/2 and /login/3.
// Once one is picked, the others and this switch go.
const options = { '1': LoginSunset, '2': LoginPostcard, '3': LoginNight } as const

export function Login() {
  const { session } = useAuth()
  const { option } = useParams()
  if (session) return <Navigate to="/" replace />
  const Layout = options[(option as keyof typeof options) ?? '1'] ?? LoginSunset
  return <Layout />
}
