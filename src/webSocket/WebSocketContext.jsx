import { createContext, useContext, useEffect, useState } from "react";

export const WSContext = createContext(null)

const WebSocketContext = ({ children }) => {
    const [websocketMessage, setWebsocketMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [websocketInstance, setWebsocketInstance] = useState(null);


    const handleSendWebsocketMessage = (message) => {
        if (!websocketInstance || websocketInstance.readyState !== WebSocket.OPEN)
            return;

        websocketInstance.send(message);
        setIsSendingMessage(true);
    };


    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3000?token=123456");

        if (!ws) return;

        ws.addEventListener("message", (event) => {
            setWebsocketMessage(event.data);
            setIsSendingMessage(false);
        });

        setWebsocketInstance(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, []);

    return (
        <WSContext value={{
            message: websocketMessage
        }
        }
        >
            {children}
        </WSContext>
    )
}

export default WebSocketContext;