import { Route } from '../types.ts'
import validateNickname from '../lib/validateNickname.ts'
import generateSecret from '../lib/generateSecret.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'
import dealCards from '../lib/dealCards.ts'
import { publicizePlayers, updateAll } from "../lib/updateAll.ts";

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

  if (Object.values(room.players).map(player => player.nickname).includes(body.nickname)) {
    socket.json({ error: `Choose a different name, someone in the room already is named "${body.nickname}"."` })
    return
  }

  room.players[socket.secret] = {
    nickname: body.nickname,
    recovery: body.code + generateSecret(),
    hand: {},
    isHost: false,
    connected: true,
  }

  const { draw, hand } = dealCards(room.piles.draw)

  room.players[socket.secret].hand = hand
  room.piles.draw = draw

  room.log.push({
    time: (new Date(Date.now())).toISOString(),
    message: `${body.nickname} joined the game.`,
  })

  rooms.updateOne({ code: body.code }, room)

  socket.updates([
    ['code', room.code],
    ['recovery', room.players[socket.secret].recovery],
    ['state', room.state],
    ['nickname', body.nickname],
    ['hand', room.players[socket.secret].hand],
    ['discard', room.piles.discard],
  ])
  updateAll(room, [
    ['players', publicizePlayers(room)],
    ['log', room.log],
  ])
}
