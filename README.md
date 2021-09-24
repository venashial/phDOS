# phDOS

*The backend server for phUNO*

phDOS uses web sockets to communicate with clients.

## Structure
- `entry.ts`: start server
  - `src`
    - `socket.ts`: starts HTTP server, accepts sockets, sends incoming requests to routes
    - `routes`
      - `join.ts`: join game
      - `create.ts`: create game
      - `register.ts`: put socket in Map to allow server to send data back
    - `types.ts`: custom Typescript types
    - `lib`
      - `generateSecret.ts`: generate random secret string
      - `getCode.ts`: get an unused code for a new room
      - `makeDeck.ts`: make an empty deck of cards
      - `validateNickname.ts`: verify nickname is in proper format

## Developing

In cloned repository, run

```bash
deno run --allow-net --watch --unstable entry.ts  
```
