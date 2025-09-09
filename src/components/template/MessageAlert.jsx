import { useContext, useEffect, useState } from "react";
import { WSContext } from "../../webSocket/WebSocketContext";

export default function MessageAlert() {
  const { message } = useContext(WSContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!message) return;
    setIsOpen(true);
    const t = setTimeout(() => setIsOpen(false), 4000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div
      className={`fixed bottom-5 right-0 w-[400px] pointer-events-none overflow-hidden`}
    >
      <div
        className={`pointer-events-auto w-full rounded-l-lg bg-red-600 p-6 text-gray-100 transition-all duration-500 ease-in-out transform
        ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}
      >
        <div className="text-sm opacity-80">Nova Mensagem:</div>
        <div className="text-lg">{message}</div>
      </div>
    </div>
  );
}
