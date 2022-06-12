import { Server } from "socket.io";

const WS_PORT = 5601;

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

type GameInfo = {
  host: string
}

// let games = [];

let game = null;

let gameInfo = null;

function getTileChangeRoomName(myGame) {
  return `${myGame.id}-tile`;
}

io.on("connection", (socket) => {
  let myGameInfo = null;

  // ...
  console.log('connection!!');

  socket.on('game/list', (callback) => {
    callback([game]);
  });

  socket.on('game/create', () => {
    
  })

  socket.on("game/host", (user, callback) => {
    if(!game) {
      game = {
        id: `g${uniqId()}`,
        host: socket.id,
        players: [user],
        // playerIndex: 0
      }
    }
    myGameInfo = {
      id: game.id,
      playerIndex: 0
    }
    console.log(`game/host`, user);

    socket.join(getTileChangeRoomName(myGameInfo));

    callback({
      ...game,
      ...myGameInfo
    });
  });

  // join an existing game
  socket.on("game/join", (user, callback) => {
    console.log(`game/join`, user);
    if(!game) {
      callback({err: "Game does not exist"});
      return;
    }
    // join the game
    game.players[1] = user;
    myGameInfo = {
      id: game.id,
      playerIndex: 1
    };
    socket.join(getTileChangeRoomName(myGameInfo));

    callback({
      ...game,
      ...myGameInfo
    });
  })

  socket.on("game/tile-changes", (changeMsg) => {
    // console.log('changes', changes);
    console.log(`got tile changes ${JSON.stringify(changeMsg)}`);
    // if(game) {
    //   socket.to('game/tile-changes').emit(changes);
    // }
    
    if(myGameInfo) {
      const room = getTileChangeRoomName(myGameInfo);
      io.to(room).emit("game/tile-changes-room", changeMsg);
    }
  });

  socket.on("game/draw-tiles", (drawMsg) => {
    console.log(`got draw tile ${JSON.stringify(drawMsg)}`);
    if(myGameInfo) {
      const room = getTileChangeRoomName(myGameInfo);
      io.to(room).emit("game/draw-tiles-room", drawMsg);
    }
  });
  socket.on("game/play-tile", (playMsg) => {
    console.log(`got play tile ${JSON.stringify(playMsg)}`);
    if(myGameInfo) {
      const room = getTileChangeRoomName(myGameInfo);
      io.to(room).emit("game/play-tile-room", playMsg);
    }
  });

  // socket.on('disconnect', () => {
  //   // if socket is hosting the game
  //   // send "host disconnected" event to all players
  //   // destroy the game?
  //   if(game && game.host === socket.id) {
      
  //   }
  // });
});



io.listen(WS_PORT);
console.log(`Listening on port ${WS_PORT}...`);

function uniqId() {
  return new Date().getTime().toString(36).split('').reverse().join('');
}