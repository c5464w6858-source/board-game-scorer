import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider, useAuth } from './lib/auth'
import { CourseDetail } from './pages/CourseDetail'
import { Courses } from './pages/Courses'
import { Chats } from './pages/Chats'
import { Discover } from './pages/Discover'
import { HostFlow } from './pages/host/HostFlow'
import { HostRound } from './pages/host/HostRound'
import { HostTime } from './pages/host/HostTime'
import { HostRequests } from './pages/HostRequests'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { ProfileEdit } from './pages/ProfileEdit'
import { RoundChat } from './pages/RoundChat'
import { ResetPassword } from './pages/ResetPassword'
import { RoundDetail } from './pages/RoundDetail'
import { Login } from './pages/Login'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/:option" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route element={<HostFlow />}>
            <Route path="/host" element={<HostRound />} />
            <Route path="/host/time" element={<HostTime />} />
          </Route>
          <Route path="/rounds/:id" element={<RoundDetail />} />
          <Route path="/rounds/:id/requests" element={<HostRequests />} />
          <Route path="/rounds/:id/chat" element={<RoundChat />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/me/edit" element={<ProfileEdit />} />
          <Route path="/golfers/:id" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
