import { Route } from '../types.ts'
import validateNickname from '../lib/validateNickname.ts'
import generateSecret from '../lib/generateSecret.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'

export default async ({ body, socket }: Route): Promise<void> => {
  if (body?.nickname && typeof body.nickname === 'string') {
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

  if (typeof body.code !== 'string') {
    socket.json({ error: 'Missing room code' })
    return
  }

  const room = await rooms.findOne({ code: body.code })

  if (room === null) {
    socket.json({ error: "That room doesn't exist" })
    return
  }

  room.players[socket.secret] = {
    nickname: body.nickname,
    recovery: body.code + generateSecret(),
    hand: {},
    isHost: false,
  }

  room.lastActivity = (new Date(Date.now())).toISOString()
  rooms.updateOne({ code: body.code }, room)

  socket.updates([
    ['code', room.code],
    ['recovery', room.players[socket.secret].recovery],
    ['state', 'lobby'],
    ['nickname', body.nickname],
  ])
  Object.keys(room.players).forEach(player => {
    sockets.get(player)?.updates([[
      'players',
      Object.values(room.players).map((player) => ({
        nickname: player.nickname,
        count: Object.keys(player.hand).length,
      })),
    ],])
  })
}
