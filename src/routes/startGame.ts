import { RoomRoute, Stack } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket, room, code }: RoomRoute): Promise<void> => {

  /*
  Object.keys(room.players).forEach(player => {
    const hand: Stack = {}
    const cards = deckArray.splice(0, 6)
    cards.forEach((card, index) => {
      hand[index] = deck[index]
    })
    console.log(hand)
    room.players[player].hand = hand
  })
  */

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
