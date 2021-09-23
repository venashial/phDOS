import {
  WebSocket,
} from 'https://deno.land/std@0.108.0/ws/mod.ts'

export interface Socket extends WebSocket {
  json: (data: unknown) => void,
  secret: string,
}

export interface Route {
  body: Record<string, unknown>,
  socket: Socket,
}