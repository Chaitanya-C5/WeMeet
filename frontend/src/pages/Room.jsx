import React from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { Phone } from 'lucide-react'
import peer from '../service/peer'

const Room = () => {
  const { roomId } = useParams()
  const socket = useSocket()
  const [users, setUsers] = useState([])
  const [myStream, setMyStream] = useState(null)
  const [userSocketId, setUserSocketId] = useState(null)
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)

  const handleRoomJoin = useCallback(( users ) => {
    setUsers(users)
    alert(`${users[users.length-1].name} has joined the room`)
  }, [])

  const handleCall = useCallback(async (remoteSocketId) => {
    peer.reset();
    setRemoteSocketId(remoteSocketId)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    const offer = await peer.getOffer()
    socket.emit("call-user", { remoteSocketId, offer })
    setMyStream(stream)
  }, [socket])

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);


  const handleIncommingCall = useCallback(async ({ offer, socketId }) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
  
    setMyStream(stream);
    await peer.peer.setRemoteDescription(offer);
    const answer = await peer.getAnswer(offer);
    socket.emit("answer-call", { socketId, answer });
  
    stream.getTracks().forEach(track => peer.peer.addTrack(track, stream));
  }, [socket]);

  const handleSocketId = useCallback((socketId) => {
    setUserSocketId(socketId)
  }, [])

  const handleCallAccepted = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer)
    if (myStream) {
      sendStreams();
    }
  }, [myStream, sendStreams])

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer()
    socket.emit("negotiation:needed", { offer, remoteSocketId: remoteSocketId })
  },[remoteSocketId, socket])

  const handleIncomingNegotiationNeeded = useCallback(async ({ offer, socketId }) => {
    await peer.peer.setRemoteDescription(offer)
    const answer = await peer.getAnswer(offer)
    socket.emit("negotiation:done", { answer, socketId })
  },[socket])

  const handleNegotiationCompleted = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer)
  },[])

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
      }
    });
  }, [])

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded)
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded)
    }
  },[handleNegotiationNeeded, socket])

  useEffect(() => {
      socket.emit("getSocketId")
      socket.on("socket-id", handleSocketId)
      socket.on("user-joined", handleRoomJoin)
      socket.on("incomming:call", handleIncommingCall)
      socket.on("call-accepted", handleCallAccepted)
      socket.on("negotiation-needed", handleIncomingNegotiationNeeded)
      socket.on("negotiation:done", handleNegotiationCompleted)
      
      return () => {
          socket.off("user-joined", handleRoomJoin)
          socket.off("socket-id", handleSocketId)
          socket.off("incomming:call", handleIncommingCall)
          socket.off("call-accepted", handleCallAccepted)
          socket.off("negotiation-needed", handleIncomingNegotiationNeeded)
          socket.off("negotiation:done", handleNegotiationCompleted)
      }
    }, [socket, handleRoomJoin, handleSocketId, handleIncommingCall, handleCallAccepted, handleIncomingNegotiationNeeded, handleNegotiationCompleted])

  return (
    <div className="flex w-full h-screen items-center flex-col bg-gray-900">
      <h1 className="font-bold text-2xl text-white my-8">Room ID: <span className="text-blue-400">{roomId}</span></h1>
      {myStream !== null && (
        <button 
          className="mt-4 p-2 bg-blue-500 text-white rounded-lg"
          onClick={sendStreams}
        >
          Send Stream
        </button>
      )}
      {users.length > 1 && (
        <div className="flex flex-col gap-4 max-w-md w-full mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
          {users.map(user => (
            user.socketId !== userSocketId && (
              <div key={user.socketId} className="flex justify-between items-center p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                <p className="text-lg font-medium text-white">{user.name.toUpperCase()}</p>
                <button 
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors cursor-pointer"
                  onClick={() => handleCall(user.socketId)}>
                  <Phone size={20} />
                </button>
              </div>
            )
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full px-4">
        {myStream && (
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-2xl text-white my-4">My Stream</h1>
            <ReactPlayer 
              playing 
              muted 
              url={myStream} 
              height="auto"
              width="100%"
              className="w-full max-w-md h-[300px] sm:h-[400px] bg-black rounded-lg" 
            />
          </div>
        )}
        {remoteStream && (
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-2xl text-white my-4">Remote Stream</h1>
            <ReactPlayer 
              playing 
              muted 
              url={remoteStream} 
              height="auto"
              width="100%"
              className="w-full max-w-md h-[300px] sm:h-[400px] bg-black rounded-lg" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;