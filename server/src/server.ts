import { Server } from "socket.io";

const WS_PORT = 5601;

const io = new Server({
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