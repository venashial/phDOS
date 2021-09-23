import { Route } from '../types.ts'
import getCode from '../lib/getCode.ts'
import makeDeck from '../lib/makeDeck.ts'
import validateNickname from '../lib/validateNickname.ts'
import generateSecret from '../lib/generateSecret.ts'

export default ({ body, socket }: Route): void => {
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

  const room = {
    code: getCode(),
    lastActivity: Date.now(),
    state: 'lobby',
    players: {
      [socket.secret]: {
        nickname: body.nickname,
        recovery: generateSecret(),
      },
    },
    piles: {
      discard: {},
      draw: makeDeck(),
    },
    log: [],
  }

  // TODO: Add to database

  socket.json({
    type: 'update',
    store: 'code',
    data: room.code,
  })
  socket.json({
    type: 'update',
    store: 'recovery',
    data: room.players[socket.secret].recovery,
  })
}