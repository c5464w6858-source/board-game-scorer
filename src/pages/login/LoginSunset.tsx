import { AuthShell } from './AuthShell'
import { LoginForm } from './LoginForm'

export function LoginSunset() {
  return (
    <AuthShell
      label="Sign in"
      title={
        <>
          Golf’s better
          <br />
          with buddies.
        </>
      }
      subtitle="Find a four near you, or fill your own."
    >
      <LoginForm />
    </AuthShell>
  )
}
