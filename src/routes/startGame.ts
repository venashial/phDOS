import { RoomRoute, Stack } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default ({ body, socket, room, code }: RoomRoute): void => {
  room.state = 'game'

  room.lastActivity = new Date(Date.now()).toISOString()
  rooms.updateOne({ code }, room)

  Object.keys(room.players).forEach((player) => {
    sockets.get(player)?.updates([
      [
        'state',
        'game'
      ]
    ])
  })
}
