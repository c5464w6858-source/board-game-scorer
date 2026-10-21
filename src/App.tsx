import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider, useAuth } from './lib/auth'
import { CourseDetail } from './pages/CourseDetail'
import { Courses } from './pages/Courses'
import { Chats } from './pages/Chats'
import { Discover } from './pages/Discover'
import { Buddies } from './pages/Buddies'
import { Free } from './pages/Free'
import { GroupDetail } from './pages/groups/GroupDetail'
import { GroupJoin } from './pages/groups/GroupJoin'
import { GroupNew } from './pages/groups/GroupNew'
import { GroupRound } from './pages/groups/GroupRound'
import { GroupRoundNew } from './pages/groups/GroupRoundNew'
import { Groups } from './pages/groups/Groups'
import { MatchNew } from './pages/groups/MatchNew'
import { RyderSetup } from './pages/groups/RyderSetup'
import { Calendar } from './pages/Calendar'
import { LiveScore } from './pages/LiveScore'
import { Notifications } from './pages/Notifications'
import { Plus } from './pages/Plus'
import { Recap } from './pages/Recap'
import { Safety } from './pages/Safety'
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
import { Welcome } from './pages/Welcome'
import { fetchOnboarded } from './lib/profiles'
import { useAsync } from './lib/useAsync'

// Signed-in golfers who haven't been through first-run setup go there first.
function Onboarded({ userId, children }: { userId: string; children: React.ReactNode }) {
  const onboarded = useAsync(() => fetchOnboarded(userId), [userId])
  if (onboarded.loading) return null
  // If the check fails, let them in rather than lock them out.
  return onboarded.data === false ? <Navigate to="/welcome" replace /> : <>{children}</>
}

function RequireAuth({ children, setup }: { children: React.ReactNode; setup?: boolean }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return setup ? <>{children}</> : <Onboarded userId={session.user.id}>{children}</Onboarded>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/welcome"
          element={
            <RequireAuth setup>
              <Welcome />
            </RequireAuth>
          }
        />
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
          <Route path="/rounds/:id/score" element={<LiveScore />} />
          <Route path="/rounds/:id/recap" element={<Recap />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/me/edit" element={<ProfileEdit />} />
          <Route path="/me/safety" element={<Safety />} />
          <Route path="/me/notifications" element={<Notifications />} />
          <Route path="/plus" element={<Plus />} />
          <Route path="/buddies" element={<Buddies />} />
          <Route path="/free" element={<Free />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/new" element={<GroupNew />} />
          <Route path="/groups/join/:code" element={<GroupJoin />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/rounds/new" element={<GroupRoundNew />} />
          <Route path="/groups/:id/rounds/:roundId" element={<GroupRound />} />
          <Route path="/groups/:id/rounds/:roundId/matches/new" element={<MatchNew />} />
          <Route path="/groups/:id/ryder" element={<RyderSetup />} />
          <Route path="/golfers/:id" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
