import { Database } from 'https://deno.land/x/aloedb@0.9.0/mod.ts';
import { Room } from './types.ts'
import pruneRooms from './lib/pruneRooms.ts'

// @ts-ignore: Deno refuses to start with
export const rooms = new Database<Room>('./rooms.json');

pruneRooms()