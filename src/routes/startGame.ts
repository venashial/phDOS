import { RoomRoute } from '../types.ts'
import { rooms } from '../db.ts'
import { updateAll } from '../lib/updateAll.ts'

export default ({ body, socket, room, code }: RoomRoute): void => {
  room.state = 'game'

  room.log.push({
    time: new Date(Date.now()).toISOString(),
    message: `${room.players[socket.secret].nickname} started the game.`,
  })

  rooms.updateOne({ code }, room)

  updateAll(room, [
    ['state', 'game'],
    ['log', room.log],
  ])
}
