import { Route } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket }: Route): Promise<void> => {
  if (!body?.target || typeof body.target !== 'string') {
    socket.json({
      error: 'No user to kick.',
    })
    return
  }

  if (typeof body.code !== 'string') {
    socket.json({ error: 'Missing room code' })
    return
  }

  const room = await rooms.findOne({ code: body.code })

  if (room === null) {
    socket.json({ error: "That room doesn't exist" })
    return
  }

  const target = Object.entries(room.players).find(
    (player) => player[1].nickname === body.target
  )

  if (target === undefined) {
    socket.json({ error: "That target doesn't exist" })
    return
  }

  const targetSocket = sockets.get(target[0])

  if (targetSocket === undefined) {
    socket.json({ error: "That target isn't connected" })
    return
  }

  targetSocket.json({
    type: 'redirect',
    url: '/',
    message: `Yikes, you were kicked from the room by the host.`,
  })

  delete room.players[target[0]]

  room.lastActivity = new Date(Date.now()).toISOString()
  rooms.updateOne({ code: body.code }, room)

  Object.keys(room.players).forEach((player) => {
    sockets
      .get(player)
      ?.updates([
        [
          'players',
          Object.values(room.players).map((player) => ({
            nickname: player.nickname,
            count: Object.keys(player.hand).length,
          })),
        ],
      ])
  })
}
