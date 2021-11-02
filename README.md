# phDOS

*The backend server for [phUNO](https://github.com/venashial/phUNO)*

phDOS uses web sockets to communicate with clients.

## Socket request format

```js
{
  type: 'update' | 'redirect'

  store: svelteStoreName, // if update
  data: anyData, // if update

  url: '/', // if redirect
  message: `Yikes, you were kicked from the room by the host.`, // if redirect
}
```

## Structure

- `entry.ts`: start server
  - `src`
    - `socket.ts`: starts HTTP server, accepts sockets, sends incoming requests to routes
    - `routes/`: contains each route
      - `register.ts`: adds the client to the Map of sockets
      - `disconnect.ts`: not currently in use
    - `types.ts`: custom Typescript types
    - `lib`
      - `generateSecret.ts`: generate random secret string
      - `getCode.ts`: get an unused code for a new room
      - `makeDeck.ts`: make an empty deck of cards
      - `validateNickname.ts`: verify nickname is in proper format

## Ease of use

Each socket have the `.json()` and `.updates()` methods to make sending store updates cleaner. The `updateAll` function uses `.updates()` on all the sockets connected to a room. The `publicizePlayers` function in the same file takes a room and spits out a client safe (no secrets) version to send to clients.

## Developing

In cloned repository, run

```bash
deno run --allow-net --watch --unstable entry.ts  
```
