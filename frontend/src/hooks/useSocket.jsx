import { useContext } from 'react';
import SocketContext from '../context/SocketProvider';

export const useSocket = () => {
    const socket = useContext(SocketContext);  
    return socket;
}