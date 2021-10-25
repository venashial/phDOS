import { RoomRoute } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket, room, code }: RoomRoute): Promise<void> => {
  socket.updates([
    ['recovery', ''],
    ['code', ''],
    ['nickname', ''],
    ['state', 'profile'],
    ['isHost', false],
  ])
  socket.json({
    type: 'redirect',
    url: '/',
    message: `You left the room.`,
  })

  if (room.players[socket.secret].isHost) {
    // Host left
    const newHost = Object.entries(room.players).find(
      (player) => player[1].isHost === false
    )
    if (newHost !== undefined && newHost[0] !== undefined) {
      // Assign new host
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
    } else {
      // Delete room
      await rooms.deleteOne({ code })
      return
    }
  }

  delete room.players[socket.secret]

  room.lastActivity = new Date(Date.now()).toISOString()
  await rooms.updateOne({ code }, room)

  Object.keys(room.players).forEach((player) => {
    sockets.get(player)?.updates([
      [
        'players',
        Object.values(room.players).map((player) => ({
          nickname: player.nickname,
          count: Object.keys(player.hand).length,
          isHost: player.isHost,
          connected: player.connected,
        })),
      ],
    ])
  })
}
