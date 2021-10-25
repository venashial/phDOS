import { RoomRoute, Card } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

/** Move a card to and from: a player's hand, the discard pile, & the draw pile */
export default ({ body, socket, room, code }: RoomRoute): void => {
  let movedCard: Card | undefined = undefined
  let cardIndex = ''
  const logMessage: string[] = []
  logMessage[0] = room.players[socket.secret].nickname

  if (body.source === 'draw') {
    cardIndex = Object.keys(room.piles.draw)[0]
    movedCard = room.piles.draw[cardIndex]
    delete room.piles.draw[cardIndex]
    logMessage[1] = 'drew a card'
  } else if (body.source === 'discard') {
    cardIndex = Object.keys(room.piles.discard)[0]
    movedCard = room.piles.discard[cardIndex]
    delete room.piles.discard[cardIndex]
    logMessage[1] = 'took a card from the discard pile'
  } else if (body.source === 'hand' && typeof body.cardIndex === 'string') {
    cardIndex = body.cardIndex
    movedCard = room.players[socket.secret].hand[cardIndex]
    delete room.players[socket.secret].hand[cardIndex]
    logMessage[1] = `played a ${movedCard.color} ${movedCard.symbol}`
  }

  if (!movedCard || !cardIndex) {
    socket.json({ error: "Couldn't move those cards" })
    return
  }

  if (body.destination === 'draw') {
    room.piles.draw = { [cardIndex]: movedCard, ...room.piles.draw }
    logMessage[2] = 'and put it in the draw pile'
  } else if (body.destination === 'discard') {
    room.piles.discard = { [cardIndex]: movedCard, ...room.piles.discard }
    logMessage[2] = 'to the discard pile'
  } else if (body.destination === 'hand') {
    room.players[socket.secret].hand[cardIndex] = movedCard
    logMessage[2] = 'to their hand'
  }

  room.lastActivity = new Date(Date.now()).toISOString()
  rooms.updateOne({ code }, room)

  if ([body.destination, body.source].includes('discard')) {
    Object.keys(room.players).forEach((player) => {
      sockets.get(player)?.updates([['discard', room.piles.discard]])
    })
  }

  socket.updates([['hand', room.players[socket.secret].hand]])

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
