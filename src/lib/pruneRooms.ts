import { rooms } from '../db.ts'

export default async function pruneRooms() {
  const oldRooms = await rooms.findMany((room): boolean => {
  const lastLog = room.log.at(-1)
  if (lastLog) {
    return new Date(lastLog.time).valueOf() < new Date().valueOf() - (1000 * 60 * 30)
  } else {
    return false
  }
  })

  const codesToDelete = oldRooms.map(it => it.code)

  await rooms.deleteMany((room) => codesToDelete.includes(room.code))

  setTimeout(pruneRooms, 1000 * 60 * 15)
}