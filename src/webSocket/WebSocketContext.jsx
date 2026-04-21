import { createContext, useEffect, useState } from "react";

export const WSContext = createContext(null)

const WS_URL = import.meta.env.VITE_WS_URL ?? ''

const WebSocketContext = ({ children }) => {
    const [websocketMessage, setWebsocketMessage] = useState("");
    const [websocketInstance, setWebsocketInstance] = useState(null);

    const handleSendWebsocketMessage = (message) => {
        if (!websocketInstance || websocketInstance.readyState !== WebSocket.OPEN)
            return;
        websocketInstance.send(message);
    };

    useEffect(() => {
        if (!WS_URL) return;

        const ws = new WebSocket(WS_URL);

        ws.addEventListener("message", (event) => {
            setWebsocketMessage(event.data);
        });

        setWebsocketInstance(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, []);

    return (
        <WSContext value={{ message: websocketMessage, send: handleSendWebsocketMessage }}>
            {children}
        </WSContext>
    )
}

export default WebSocketContext;