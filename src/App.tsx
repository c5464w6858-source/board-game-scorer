import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Join } from './pages/Join'
import { Session } from './pages/Session'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join" element={<Join />} />
      <Route path="/session/:joinCode" element={<Session />} />
    </Routes>
  )
}

export default App
