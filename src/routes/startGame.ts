import { Route } from '../types.ts'
import { rooms } from '../db.ts'

export default async ({ body, socket }: Route): Promise<void> => {
  // @ts-ignore: Doesn't know that body.code was already checked
  const room = await rooms.findOne({ code: body.code })

  

  /*
  socket.json({
    type: 'update',
    store: 'code',
    data: body.code,
  })
  socket.json({
    type: 'update',
    store: 'recovery',
    data: room.players[socket.secret].recovery,
  })
  */
}
