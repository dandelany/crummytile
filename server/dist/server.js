"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const WS_PORT = 5601;
const io = new socket_io_1.Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    // ...
    console.log('connection!!');
});
io.listen(WS_PORT);
console.log(`Listening on port ${WS_PORT}...`);
//# sourceMappingURL=server.js.map