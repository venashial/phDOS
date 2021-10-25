import { RoomRoute, Card } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

/** Move a card to and from: a player's hand, the discard pile, & the draw pile */
export default ({ body, socket, room, code }: RoomRoute): void => {
  
  Object.keys(room.players).forEach((player) => {
    const playerSocket = sockets.get(player)
    if (playerSocket) {
      playerSocket.updates([
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
    }
  })
}
