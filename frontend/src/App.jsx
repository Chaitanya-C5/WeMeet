import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Room from './pages/Room'
import { SocketProvider } from './context/SocketProvider'
import Room1 from './pages/Room1'

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby/>} />
          <Route path="/room/:roomId" element={<Room1/>} />
        </Routes>
      </Router>
    </SocketProvider>
  )
}

export default App