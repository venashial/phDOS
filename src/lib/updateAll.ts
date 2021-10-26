import { Room } from '../types.ts'
import { sockets } from '../sockets.ts'

interface publicPlayer {
  nickname: string,
  count: number,
  isHost: boolean,
  connected: boolean,
}

export function publicizePlayers(room: Room): publicPlayer[] {
  return Object.values(room.players).map((player) => ({
    nickname: player.nickname,
    count: Object.keys(player.hand).length,
    isHost: player.isHost,
    connected: player.connected,
  }))
}

export function updateAll(room: Room, updates: unknown[][]): void {
  Object.keys(room.players).forEach((player) => {
    sockets.get(player)?.updates(updates)
  })
}
