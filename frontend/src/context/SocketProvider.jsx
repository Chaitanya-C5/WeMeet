import { createContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const socket = useMemo(() => io("http://localhost:3000", { autoConnect: false }), []);

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect(); 
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
                {children}
        </SocketContext.Provider>
    )
}

export default SocketContext;