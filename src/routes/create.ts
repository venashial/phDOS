import { Route } from '../types.ts'
import getCode from '../lib/getCode.ts'
import validateNickname from '../lib/validateNickname.ts'
import generateSecret from '../lib/generateSecret.ts'
import { rooms } from '../db.ts'
import makeDeck from '../lib/makeDeck.ts'
import shuffle from '../lib/shuffle.ts'
import dealCards from '../lib/dealCards.ts'
import { publicizePlayers } from "../lib/updateAll.ts";

export default async ({ body, socket }: Route): Promise<void> => {
  if (body.nickname && typeof body.nickname === 'string') {
    if (!validateNickname(body.nickname)) {
      socket.json({
        error:
          "That nickname won't work. Make sure it is less than 16 characters and does't have any special symbols.",
      })
      return
    }
  } else {
    socket.json({ error: 'Missing nickname.' })
    return
  }

  const code = await getCode()

  const room = {
    code,
    lastActivity: (new Date(Date.now())).toISOString(),
    state: 'lobby',
    players: {
      [socket.secret]: {
        nickname: body.nickname,
        recovery: code + generateSecret(),
        hand: {},
        isHost: true,
        connected: true,
      },
    },
    piles: {
      discard: {},
      draw: shuffle(makeDeck()),
    },
    log: [
      {
        time: (new Date(Date.now())).toISOString(),
        message: `${body.nickname} created this room.`,
      }
    ],
  }

  const { draw, hand } = dealCards(room.piles.draw)

  room.players[socket.secret].hand = hand
  room.piles.draw = draw

  await rooms.insertOne(room)

  socket.updates([
    ['code', room.code],
    ['recovery', room.players[socket.secret].recovery],
    [
      'players',
      publicizePlayers(room),
    ],
    ['state', 'lobby'],
    ['nickname', body.nickname],
    ['hand', room.players[socket.secret].hand],
  ])
}
