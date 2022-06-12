export declare enum TILE_COLOR {
    RED = "RED",
    BLACK = "BLK",
    BLUE = "BLU",
    YELLOW = "YLW"
}
export declare enum GAME_MODE {
    SETUP = "SETUP",
    PLAYING = "PLAYING"
}
export declare enum GameActionType {
    Ready = "Ready",
    NotReady = "NotReady",
    DrawTiles = "DrawTiles",
    PlayTile = "PlayTile",
    MoveTiles = "MoveTiles"
}
export declare type BaseGameAction<AT extends GameActionType, T> = {
    type: AT;
    payload: T;
};
export declare type ReadyGameAction = BaseGameAction<GameActionType.Ready, {
    playerIndex: number;
}>;
export interface GameTileData {
    value: number;
    color: TILE_COLOR;
}
export interface GameTile {
    type: "tileNode";
    id: string;
    data: GameTileData;
}
export interface GameGridTile extends GameTile {
    position: {
        x: number;
        y: number;
    };
}
declare type TileBag = GameTile[];
export interface GameState {
    id: string;
    mode: GAME_MODE;
    bag: TileBag;
    hands: GameTile[][];
    gridTiles: GameGridTile[];
    playerCount: number;
}
export interface VisibleGameState extends Omit<GameState, "bag" | "hands"> {
    hand: GameTile[];
    bagCount: number;
}
export interface GameOptions {
    playerCount?: number;
    id?: string;
}
export declare class Crummytile {
    options: GameOptions;
    state: GameState;
    constructor(options?: GameOptions);
    private initBag;
    drawTiles(playerIndex: number, count: number): GameState;
    playTile(playerIndex: number, tileId: string): GameState;
    getState(): GameState;
    removeTilesFromBag(tileIds: string[]): GameState;
}
export {};
