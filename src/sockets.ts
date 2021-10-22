import { serve } from 'https://deno.land/std@0.108.0/http/server_legacy.ts'
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from 'https://deno.land/std@0.108.0/ws/mod.ts'

import { Socket } from './types.ts'

import { rooms } from './db.ts'

// Route imports
import register from './routes/register.ts'
import create from './routes/create.ts'
import join from './routes/join.ts'
import move from './routes/move.ts'
import kick from './routes/kick.ts'
import leave from './routes/leave.ts'

const routes = {
  register,
  create,
  join,
  move,
  kick,
  leave,
}

export const sockets = new Map<string, Socket>()

async function handleWs(sock: WebSocket) {
  const socket: Socket = Object.assign(sock)
  socket.json = function (data: unknown) {
    this.send(JSON.stringify(data))
  }
  socket.updates = function (updates) {
    updates.forEach(([store, data]) => {
      this.json({
        type: 'update',
        store,
        data,
      })
    })
  }
  try {
    for await (const ev of sock) {
      if (typeof ev === 'string') {
        // text message
        try {
          const data: {
            route: keyof typeof routes
            body: Record<string, unknown>
            secret?: string
          } = JSON.parse(ev)
          if /*
          (
            data.route !== 'register' &&
            (!socket.secret || !data.secret || socket.secret !== data.secret)
          ) {
            socket.json({ error: 'Not authorized or invalid secret.' })
          } else if
          */ (
            !['create', 'register'].includes(data.route) &&
            typeof data.body.code !== 'string'
          ) {
            socket.json({ error: 'Missing room code.' })
          } else if (
            !['create', 'register'].includes(data.route) && typeof data.body.code === 'string' &&
            (await rooms.count({ code: data.body.code })) === 0
          ) {
            socket.json({ error: "That room doesn't exist." })
          } else {
            await routes[data.route]({ body: data.body, socket })
          }
        } catch (e) {
          socket.json({ error: e.message })
        }
      } else if (ev instanceof Uint8Array) {
        // binary message
        console.log('ws:Binary', ev)
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev
        // ping
        console.log('ws:Ping', body)
      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const { code, reason } = ev
        console.log('ws:Close', code, reason)
        if (socket.secret) {
          sockets.delete(socket.secret)
        }
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`)

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error)
      if (socket.secret) {
        sockets.delete(socket.secret)
      }
    }
  }
}

// HTTP server for WS
const port = Deno.args[0] || '8080'
console.log(`websocket server is running on :${port}`)
for await (const req of serve(`:${port}`)) {
  const { conn, r: bufReader, w: bufWriter, headers } = req
  acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  })
    .then(handleWs)
    .catch(async (err) => {
      console.error(`failed to accept websocket: ${err}`)
      await req.respond({ status: 400 })
    })
}
