import { NodeChange } from "react-flow-renderer";
import { io, Socket } from "socket.io-client";
import { GameGridTile, GameTile } from "crummytile-shared/lib/Crummytile";

const {hostname} = window.location;
const wsPort = 5601
const wsUrl = `ws://${hostname}:${wsPort}`;

export type GridTileChangesMessage = {
  playerIndex: number,
  changes: NodeChange[]
}
export type DrawTilesMessage = {
  playerIndex: number,
  hand: GameTile[]
}
export type PlayTileMessage = {
  playerIndex: number,
  tileId: string,
  gridTiles: GameGridTile[]
}


type GameClientCallbacks = {
  onConnect?: () => void,
  onDisconnect?: () => void,
  onGridTileChanges?: (changeMsg: GridTileChangesMessage) => void,
  onDrawTiles?: (drawMsg: DrawTilesMessage) => void,
  onPlayTile?: (playMsg: PlayTileMessage) => void
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
          this.socket.on("game/draw-tiles-room", (drawMsg: DrawTilesMessage) => {
            if(this.callbacks.onDrawTiles) this.callbacks.onDrawTiles(drawMsg);
          });
          this.socket.on("game/play-tile-room", (playMsg: PlayTileMessage) => {
            if(this.callbacks.onPlayTile) this.callbacks.onPlayTile(playMsg);
          });

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

          // todo don't repeat this!!!

          this.socket.on("game/tile-changes-room", (changes: any) => {
            console.log('got changes from room', changes);
            this.handleGridTileChanges(changes);
          });
          this.socket.on("game/draw-tiles-room", (drawMsg: DrawTilesMessage) => {
            if(this.callbacks.onDrawTiles) this.callbacks.onDrawTiles(drawMsg);
          });
          this.socket.on("game/play-tile-room", (playMsg: PlayTileMessage) => {
            if(this.callbacks.onPlayTile) this.callbacks.onPlayTile(playMsg);
          });

          resolve(response);
        }
      });
    });
  }
  

  sendGridTileChanges(changeMsg: GridTileChangesMessage) {
    this.socket.emit('game/tile-changes', changeMsg);
  }
  sendDrawTile(drawMsg: DrawTilesMessage) {
    this.socket.emit('game/draw-tiles', drawMsg);
  }
  sendPlayTile(playMsg: PlayTileMessage) {
    this.socket.emit('game/play-tile', playMsg);
  }
}

// singleton
let gameClient: GameClient;
export function getGameClient(): GameClient {
  if(!gameClient) gameClient = new GameClient();
  return gameClient;
}