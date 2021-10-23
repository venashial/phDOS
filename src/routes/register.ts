import { Route } from '../types.ts'
import { sockets } from '../sockets.ts'
import generateSecret from '../lib/generateSecret.ts'
import { rooms } from '../db.ts'

export default async ({ body, socket }: Route): Promise<void> => {
  let recovered = false

  if (!socket.secret) {
    if (typeof body.recovery === 'string' && body.recovery.length > 0) {
      const code = body.recovery.substring(0, 5)
      const room = await rooms.findOne({ code })
  
      if (room !== null) {
        const index = Object.values(room.players).map(it => it.recovery).indexOf(body.recovery)
        if (index !== -1) {
          console.log(`Recovered player to ${code}`)
          recovered = true
          const secret = Object.keys(room.players)[index]
          socket.secret = secret
          sockets.set(secret, socket)
          socket.updates([
            ['code', room.code],
            ['recovery', room.players[socket.secret].recovery],
            ['state', room.state],
            ['nickname', room.players[socket.secret].nickname],
            ['isHost', room.players[socket.secret].isHost],
            ['hand', room.players[socket.secret].hand],
            [
              'players',
              Object.values(room.players).map((player) => ({
                nickname: player.nickname,
                count: Object.keys(player.hand).length,
                isHost: player.isHost,
              })),
            ]
          ])
        }
      }
    }
    
    if (!recovered) {
      console.log('Registering new player')
      const secret = generateSecret()
      socket.secret = secret
      sockets.set(secret, socket)
    }
  }
}
