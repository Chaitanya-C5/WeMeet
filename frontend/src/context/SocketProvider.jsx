import { createContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const socket = useMemo(() => io("https://wemeet-backend-bxjm.onrender.com", { autoConnect: false }), []);

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