import { Route } from '../types.ts'
import { sockets } from '../sockets.ts'
import generateSecret from '../lib/generateSecret.ts'

export default ({ socket }: Route): void => {
  if (!socket.secret) {
    const secret = generateSecret()
    socket.secret = secret
    sockets.set(secret, socket)
    socket.json({
      type: 'update',
      store: 'self',
      data: { secret },
    })
  }

  console.log(sockets)
}
