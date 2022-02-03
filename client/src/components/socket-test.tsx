import React, { useEffect, useState } from "react";
import socket from "../api/socket-client";

const SocketTester = () => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        socket.on("message", (data: string) => {
            setMessages(prev => [...prev, data]);
        });
    });

    return (
        <>
            {messages.map(msg => <p>{msg}</p>)}
        </>
    )
}

export default SocketTester;