import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { Phone } from 'lucide-react';
import ReactPlayer from 'react-player'
import peer from '../service/peer';

function Room1() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [mySocketId, setMySocketId] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [users, setUsers] = useState([]);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const getSocketId = useCallback(({ socketId }) => {
    setMySocketId(socketId);
  }, []);

  const handleUsers = useCallback((users) => {
    setUsers(users);
  }, []);

  useEffect(() => {
    console.log(users);
  }, [users]);

  const handleCall = useCallback(async (remoteSocketId) => {
    setRemoteSocketId(remoteSocketId);
    const stream = await peer.getMediaStream();
    setLocalStream(stream);
    console.log("Local stream:", stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    await peer.addLocalStream(stream);
    const offer = await peer.getOffer();
    socket.emit("call-user", { to: remoteSocketId, from: mySocketId, offer });
  }, [mySocketId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    setIncomingOffer(offer);
  }, []);

  const handleAnswerCall = useCallback(async () => {
    const stream = await peer.getMediaStream();
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    await peer.addLocalStream(stream);
    const answer = await peer.getAnswer(incomingOffer);
    socket.emit("accept-call", { to: remoteSocketId, from: mySocketId, answer });
  }, [incomingOffer, mySocketId, remoteSocketId, socket]);

  const handleCallAccepted = useCallback(async ({ answer }) => {
    await peer.setRemoteDescription(answer);
  }, []);

  const handleICECandidate = useCallback(({ candidate }) => {
    if (candidate) {
      peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  useEffect(() => {
    
    peer.peer.ontrack = (event) => {
      console.log("Remote stream received:", event.streams[0]);
      const remoteStream = event.streams[0];
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
  }, []);

//   useEffect(() => {
//     const func = async() => {
//         const stream = await peer.getMediaStream();
//         setLocalStream(stream);
//         console.log("Local stream:", stream);
//         if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         }
//         await peer.addLocalStream(stream);
//     }
//     func()
//   }, [])

  useEffect(() => {
    peer.peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice-candidate", { to: remoteSocketId, candidate: event.candidate });
      }
    };
    return () => {
      peer.peer.onicecandidate = null;
    };
  }, [remoteSocketId, socket]);

  useEffect(() => {
    socket.emit("getSocketId");
    socket.on("socket-id", getSocketId);
    socket.on("user-joined", handleUsers);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleICECandidate);

    return () => {
      socket.off("socket-id", getSocketId);
      socket.off("user-joined", handleUsers);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleICECandidate);
    };
  }, [socket, getSocketId, handleUsers, handleIncommingCall, handleCallAccepted, handleICECandidate]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    
  }, [socket]);
  

  return (
    <div className="flex w-full h-screen items-center flex-col bg-gray-900">
      <h1 className="font-bold text-2xl text-white my-8">Room ID: <span className="text-blue-400">{roomId}</span></h1>
      {users.length > 1 && (
        <div className="flex flex-col gap-4 max-w-md w-full mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
          {users.map(user => (
            user.socketId !== mySocketId && (
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

      {remoteSocketId && (
        <div className="mt-4">
          <button 
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors cursor-pointer"
            onClick={handleAnswerCall}
          >
            Answer Call
          </button>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {localStream && (
          <ReactPlayer playing muted url={localStream} className="w-1/2 h-auto border border-green-500 rounded-md" />
        )}
        {remoteStream && (
          <ReactPlayer playing muted url={remoteStream} className="w-1/2 h-auto border border-blue-500 rounded-md" />
        )}
      </div>
    </div>
  );
}

export default Room1;