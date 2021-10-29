import { Socket } from './types.ts'

import { rooms } from './db.ts'

// Route imports
import register from './routes/register.ts'
import create from './routes/create.ts'
import join from './routes/join.ts'
import move from './routes/move.ts'
import kick from './routes/kick.ts'
import leave from './routes/leave.ts'
import startGame from './routes/startGame.ts'

const routes = {
  register,
  create,
  join,
  move,
  kick,
  leave,
  startGame,
}

export const sockets = new Map<string, Socket>()

// HTTP server for WS
const port = Deno.args[0] || '8080'
const server = Deno.listen({ port: parseInt(port) })
console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`)

for await (const conn of server) {
  serveHttp(conn)
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn)

  for await (const requestEvent of httpConn) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const path = new URL(requestEvent.request.url).pathname
    if (
      path === '/ws' &&
      requestEvent.request.headers.get('upgrade') === 'websocket'
    ) {
      const { socket: sock, response } = Deno.upgradeWebSocket(
        requestEvent.request
      )
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
      //socket.onopen = () => console.log('socket opened')
      socket.onmessage = async (ev) => {
        if (typeof ev.data === 'string') {
          try {
            const data: {
              route: keyof typeof routes
              body: Record<string, unknown>
              secret?: string
            } = JSON.parse(ev.data)

            if (['create', 'register', 'join'].includes(data.route)) {
              // @ts-ignore: Route is already limited to not RoomRoutes
              await routes[data.route]({ body: data.body, socket })
            } else if (
              typeof data.body.code === 'string' &&
              (await rooms.count({ code: data.body.code })) === 0
            ) {
              socket.json({ error: "That room doesn't exist." })
            } else {
              if (typeof data.body.code !== 'string') {
                socket.json({ error: "That room doesn't exist." })
                return
              }
              const room = await rooms.findOne({ code: data.body.code })

              if (room === null) {
                socket.json({ error: "That room doesn't exist" })
                return
              }

              if (!Object.keys(room.players).includes(socket.secret)) {
                socket.json({ error: "You aren't in that room" })
                return
              }

              await routes[data.route]({
                body: data.body,
                socket,
                room,
                code: data.body.code,
              })
            }
          } catch (e) {
            socket.json({ error: e.message })
          }
        }
      }
      socket.onerror = (ev) => {
        console.log('socket errored:', ev)
      }
      socket.onclose = (ev) => {
        const { code, reason } = ev
        console.log('Websocket closed', code, reason)
        if (socket.secret) {
          sockets.delete(socket.secret)
        }
      }
      requestEvent.respondWith(response)
    } else {
      requestEvent.respondWith(
        new Response('This is a phDOS server.', {
          status: 200,
        })
      )
    }
  }
}
