import { Route } from '../types.ts'
import validateNickname from '../lib/validateNickname.ts'

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

  // TODO: Join to database

  // TODO: Set recovery

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
