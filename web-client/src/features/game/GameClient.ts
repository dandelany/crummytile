import { NodeChange } from "react-flow-renderer";
import { io, Socket } from "socket.io-client";

const {hostname} = window.location;
const wsPort = 5601
const wsUrl = `ws://${hostname}:${wsPort}`;

export type GridTileChangesMessage = {
  playerIndex: number,
  changes: NodeChange[]
}

type GameClientCallbacks = {
  onConnect?: () => void,
  onDisconnect?: () => void,
  onGridTileChanges?: (changeMsg: GridTileChangesMessage) => void
}

export interface GameResponseSuccess {
  id: string,
  playerIndex: number,
  players: string[]
}
export type GameResponse = GameResponseSuccess & {err: string};

export class GameClient {
  socket: Socket;
  callbacks: GameClientCallbacks;
  
  hasGame: boolean;
  isHost: boolean;

  constructor() {
    // connect to socket.io server
    const socket = io(wsUrl);
    socket.on('connect', this.handleConnect);
    socket.on('disconnect', this.handleDisconnect);
    
    this.socket = socket;
    this.hasGame = false;
    this.isHost = true;
    this.callbacks = {};

    this.socket.on("game/tile-changes-room", (changes: any) => {
      // console.log('got changes from room', changes)
    })
  }
  private handleConnect = () => {
    console.log('connected! @_@');
    if(this.callbacks.onConnect) this.callbacks.onConnect();
  }
  private handleDisconnect = () => {
    console.warn('disconnected ._.');
    if(this.callbacks.onDisconnect) this.callbacks.onDisconnect();
  }
  private handleGridTileChanges = (changeMsg: GridTileChangesMessage) => {
    if(this.callbacks.onGridTileChanges) this.callbacks.onGridTileChanges(changeMsg);
  }

  attachCallbacks(callbacks: GameClientCallbacks) {
    Object.assign(this.callbacks, callbacks);
  }

  hostGame(): Promise<GameResponseSuccess> {
    console.log('called host');
    return new Promise((resolve, reject) => {
      this.socket.timeout(4000).emit('game/host', 'dan', (err: any, response: GameResponse) => {
        if(err || (response && response.err)) {
          reject(err ? err : response.err);
        } else {
          console.log('got response!', response);
          this.hasGame = true;
          this.isHost = true;

          const gameId = response.id;

          this.socket.on("game/tile-changes-room", (changes: any) => {
            console.log('got changes from room', changes);
            this.handleGridTileChanges(changes);
          })
          
          resolve(response);
        }
      });
    });
  }
  joinGame(): Promise<GameResponseSuccess> {
    console.log('called join');
    return new Promise((resolve, reject) => {
      this.socket.timeout(4000).emit('game/join', 'dan', (err: any, response: GameResponse) => {
        if(err || (response && response.err)) {
          reject(err ? err : response.err);
        } else {
          console.log('got join response!', response);
          this.hasGame = true;
          this.isHost = false;

          const gameId = response.id;

          this.socket.on("game/tile-changes-room", (changes: any) => {
            console.log('got changes from room', changes);
            this.handleGridTileChanges(changes);
          });
          resolve(response);
        }
      });
    });
  }
  

  sendGridTileChanges(changeMsg: GridTileChangesMessage) {
    this.socket.emit('game/tile-changes', changeMsg);
  }
}

// singleton
let gameClient: GameClient;
export function getGameClient(): GameClient {
  if(!gameClient) gameClient = new GameClient();
  return gameClient;
}