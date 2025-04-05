import { Server } from "socket.io";
import { config } from "dotenv";

config();
const io = new Server(process.env.PORT, { cors: true });

const emailToSocket = new Map();
const socketToEmail = new Map();
const roomUsers = new Map();

io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("join-room", (data) => {
        const { name, email, room } = data;
        emailToSocket.set(email, socket.id);
        socketToEmail.set(socket.id, email);

        socket.join(room);

        const users = roomUsers.get(room) || [];
        users.push({ name, socketId: socket.id });
        roomUsers.set(room, users);

        io.to(socket.id).emit("room", { roomId: room });

        io.to(room).emit("user-joined", users);
    })

    socket.on("getSocketId", () => {
        io.to(socket.id).emit("socket-id", { socketId: socket.id });
    })

    socket.on("call-user", (data) => {
        const { to, from, offer } = data;
        io.to(to).emit("incomming:call", { from, offer })
    })

    socket.on("accept-call", (data) => {
        const { to, from, answer } = data;
        io.to(to).emit("call-accepted", { from, answer })
    })

    socket.on("ice-candidate", ({ to, candidate }) => {
        console.log(`Sending ICE candidate to ${to}`);
        io.to(to).emit("ice-candidate", { candidate });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // users.delete(socket.id);
        // io.emit("user-joined", users);
    });

    // socket.on("answer-call", (data) => {
    //     const { socketId, answer } = data;
    //     io.to(socketId).emit("call-accepted", { answer, socketId: socket.id });
    // })

    socket.on("negotiation:needed", (data) => {
        const { offer, remoteSocketId } = data;
        io.to(remoteSocketId).emit("negotiation-needed", { offer, socketId: socket.id });
    })

    socket.on("negotiation:done", (data) => {
        const { answer, socketId } = data;
        io.to(socketId).emit("negotiation:done", { answer, socketId: socket.id });
    })
})