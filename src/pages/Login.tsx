import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LoginSunset } from './login/LoginSunset'

export function Login() {
  const { session } = useAuth()
  if (session) return <Navigate to="/" replace />
  return <LoginSunset />
}
