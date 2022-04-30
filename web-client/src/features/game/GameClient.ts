import { io, Socket } from "socket.io-client";

const {hostname} = window.location;
const wsPort = 5601
const wsUrl = `ws://${hostname}:${wsPort}`;

type GameClientOptions = {
  onConnect?: () => void,
  onDisconnect?: () => void,
}

export class GameClient {
  socket: Socket;
  options: GameClientOptions;

  constructor(options: GameClientOptions = {}) {
    console.log('hello I am a game client');
    // connect to socket.io server
    const socket = io(wsUrl);
    socket.on('connect', this.handleConnect);
    socket.on('disconnect', this.handleDisconnect);
    
    this.options = options;
    this.socket = socket;
  }
  private handleConnect = () => {
    console.log('connected! @_@');
    if(this.options.onConnect) this.options.onConnect();
  }
  private handleDisconnect = () => {
    console.warn('disconnected ._.', this.options);
    if(this.options.onDisconnect) this.options.onDisconnect();
  }
}

// singleton
let gameClient: GameClient;
export function getGameClient(options: GameClientOptions): GameClient {
  if(!gameClient) gameClient = new GameClient(options);
  return gameClient;
}