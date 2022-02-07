import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socket } from "../api/socket-client";

interface SocketTesterProps {
    socket: Socket;
}
const SocketTester = ({ socket }: SocketTesterProps) => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        socket.on("message", (data: string) => {
            setMessages((prev) => [...prev, data]);
        });
    });

    return (
        <>
            {messages.map((msg) => (
                <p>{msg}</p>
            ))}
        </>
    );
};

export default SocketTester;
