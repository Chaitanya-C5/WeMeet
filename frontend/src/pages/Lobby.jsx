import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'

function Lobby() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [room, setRoom] = useState('')
  const navigate = useNavigate()
  const socket = useSocket()

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    socket.emit("join-room", { name, email, room })
  }, [email, name, room, socket])

  const handleJoinRoom = useCallback((data) => {
    const { roomId } = data
    navigate(`/room/${roomId}`)
  }, [navigate])

  

  useEffect(() => {
    socket.on("room", handleJoinRoom)    
    
    return () => {
        socket.off("room", handleJoinRoom)
    }
  },[socket, handleJoinRoom])

  return (
    <div className='flex w-full h-screen items-center flex-col my-10'>
        <h1 className='font-bold mb-10 text-3xl'>Welcome to the Lobby!</h1>
        <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
            <input type="text" 
                placeholder="Name" 
                required
                className='p-2 border border-gray-300 rounded-md w-60'
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input type="email" 
                placeholder="Email" 
                required
                className='p-2 border border-gray-300 rounded-md w-60'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="room" 
                placeholder="Enter Room Number" 
                required
                className='p-2 border border-gray-300 rounded-md w-60'
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <button 
                className='bg-black text-white p-2 rounded-md w-60'>
                Join Room
            </button>
        </form>
    </div>
  )
}

export default Lobby