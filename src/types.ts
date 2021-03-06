export interface Socket extends globalThis.WebSocket {
  json: (data: unknown) => void,
  updates: (updates: Array<Array<unknown>>) => void,
  secret: string
}

export interface Route {
  body: Record<string, unknown>,
  socket: Socket
}

export interface RoomRoute {
  body: Record<string, unknown>,
  socket: Socket,
  room: Room,
  code: string,
}

export interface Card {
  color: string,
  symbol: string,
}

export type Stack = Record<string, Card>

export interface LogMessage {
  time: string,
  message: string,
}
export interface Room {
  code: string,
  state: string,
  players: Record<
    string,
    {
      nickname: string,
      recovery: string,
      hand: Stack,
      isHost: boolean,
      connected: boolean,
    }
  >,
  piles: {
    discard: Stack,
    draw: Stack,
  },
  log: LogMessage[],
}
