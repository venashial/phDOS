import { RoomRoute } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket, room, code }: RoomRoute): Promise<void> => {
  if (!body?.target || typeof body.target !== 'string') {
    socket.json({
      error: 'No user to kick.',
    })
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

  if (targetSocket !== undefined) {
    targetSocket.json({
      type: 'redirect',
      url: '/',
      message: `Yikes, you were kicked from the room by the host.`,
    })
  }

  delete room.players[target[0]]

  room.lastActivity = new Date(Date.now()).toISOString()
  rooms.updateOne({ code }, room)

  Object.keys(room.players).forEach((player) => {
    sockets.get(player)?.updates([
      [
        'players',
        Object.values(room.players).map((player) => ({
          nickname: player.nickname,
          count: Object.keys(player.hand).length,
          isHost: player.isHost,
        })),
      ],
    ])
  })
}
