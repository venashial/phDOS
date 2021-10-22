import { Route } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket }: Route): Promise<void> => {
  if (typeof body.code !== 'string') {
    socket.json({ error: 'Missing room code' })
    return
  }

  const room = await rooms.findOne({ code: body.code })

  if (room === null) {
    socket.json({ error: "That room doesn't exist" })
    return
  }

  socket.updates([
    ['recovery', ''],
    ['code', ''],
    ['nickname', ''],
    ['state', 'profile'],
    ['isHost', false]
  ])
  socket.json({
    type: 'redirect',
    url: '/',
    message: `You left the room.`,
  })

  if (room.players[socket.secret].isHost) {
    const newHost = Object.entries(room.players).find(
      (player) => player[1].isHost === false
    )

    if (newHost !== undefined && newHost[0] !== undefined) {
      room.players[newHost[0]].isHost = true

      sockets.get(newHost[0])?.updates([
        [
          'overlay',
          {
            show: true,
            style: 'warning',
            message:
              'You were randomly picked to become the host of this room.',
          },
        ],
        ['isHost', true],
      ])

      delete room.players[socket.secret]

      room.lastActivity = new Date(Date.now()).toISOString()
      rooms.updateOne({ code: body.code }, room)

      Object.keys(room.players).forEach((player) => {
        sockets.get(player)?.updates([
          [
            'players',
            Object.values(room.players).map((player) => ({
              nickname: player.nickname,
              count: Object.keys(player.hand).length,
            })),
          ],
        ])
      })
    } else {
      rooms.deleteOne({ code: body.code })
    }
  }
}
