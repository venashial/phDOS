import { Route, Card } from '../types.ts'
import { rooms } from '../db.ts'

/** Move a card to and from: a player's hand, the discard pile, & the draw pile */
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

  if (!Object.keys(room.players).includes(socket.secret)) {
    socket.json({ error: "You are't in that room" })
    return
  }

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
  } else if (body.source === 'self' && typeof body.cardIndex === 'string') {
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
    room.piles.draw = { cardIndex: movedCard, ...room.piles.draw }
    logMessage[2] = 'and put it in the draw pile'
  } else if (body.destination === 'discard') {
    room.piles.discard = { cardIndex: movedCard, ...room.piles.discard }
    logMessage[2] = 'to the discard pile'
  } else if (body.destination === 'self') {
    room.players[socket.secret].hand[cardIndex] = movedCard
    logMessage[2] = 'to their hand'
  }

  room.lastActivity = (new Date(Date.now())).toISOString()
  rooms.updateOne({ code: body.code }, room)

  /*
  socket.json({
    type: 'update',
    store: 'code',
    data: body.code,
  })
  */
}
