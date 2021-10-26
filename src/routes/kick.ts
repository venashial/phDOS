import { RoomRoute } from '../types.ts'
import { rooms } from '../db.ts'
import { sockets } from '../sockets.ts'
import { publicizePlayers, updateAll } from "../lib/updateAll.ts";

export default ({ body, socket, room, code }: RoomRoute): void => {
  if (!body?.target || typeof body.target !== 'string') {
    socket.json({
      error: 'No user to kick.',
    })
    return
  }

  const target = Object.entries(room.players).find(
    (player) => player[1].nickname === body.target
  )

  if (target === undefined) {
    socket.json({ error: "That target doesn't exist" })
    return
  }

  const targetSocket = sockets.get(target[0])

  if (targetSocket !== undefined) {
    if (target[1].connected) {
      targetSocket.updates([
        ['recovery', ''],
        ['code', ''],
        ['nickname', ''],
        ['state', 'profile'],
        ['isHost', false],
        //TODO: Client needs to forget values
      ])
      targetSocket.json({
        type: 'redirect',
        url: '/',
        message: `Yikes, you were kicked from the room by the host.`,
      })
    }
    sockets.delete(target[0])
  }

  delete room.players[target[0]]

  room.log.push({
    time: (new Date(Date.now())).toISOString(),
    message: `${body.nickname} was kicked by ${room.players[socket.secret].nickname} from the game.`,
  })

  room.lastActivity = new Date(Date.now()).toISOString()
  rooms.updateOne({ code }, room)

  updateAll(room, [
    ['players', publicizePlayers(room)],
    ['log', room.log],
  ])
}
