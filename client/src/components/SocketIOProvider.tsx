import React from "react";

import io from "../api/socket-client"

const SocketIOContext = React.createContext(io);

export default SocketIOContext;