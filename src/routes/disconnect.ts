import { RoomRoute, Card } from '../types.ts'
import { rooms } from '../db.ts'
import { publicizePlayers, updateAll } from '../lib/updateAll.ts'

/** Move a card to and from: a player's hand, the discard pile, & the draw pile */
export default ({ body, socket, room, code }: RoomRoute): void => {
  if (room.players[socket.secret]) {
    room.players[socket.secret].connected = false

    room.log.push({
      time: new Date(Date.now()).toISOString(),
      message: `${room.players[socket.secret].nickname} got disconnected.`,
    })

    rooms.updateOne({ code }, room)

    updateAll(room, [
      ['players', publicizePlayers(room)],
      ['log', room.log],
    ])
  }
}
