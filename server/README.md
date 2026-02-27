# Blitz Dutch WebSocket Server

Real-time multiplayer server for Blitz Dutch card game.

## Features

- Room creation and management
- Real-time game state synchronization
- Player connection handling
- Automatic room cleanup
- Health check endpoint

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm run server
```

Server will run on `http://localhost:3001`

### 3. Start Client (in another terminal)
```bash
npm start
```

Client will run on `http://localhost:3000`

### 4. Run Both Together
```bash
npm run dev
```

## API Endpoints

### HTTP Endpoints

- `GET /health` - Server health check
- `GET /room/:code` - Get room information

### Socket Events

#### Client → Server

- `create-room` - Create a new game room
- `join-room` - Join existing room
- `leave-room` - Leave current room
- `player-ready` - Toggle ready status
- `start-game` - Start the game (host only)
- `game-action` - Send game action
- `update-game-state` - Update game state

#### Server → Client

- `room-updated` - Room state changed
- `game-started` - Game has started
- `game-action` - Game action from another player
- `game-state-updated` - Game state updated
- `player-disconnected` - Player left/disconnected

## Room Structure

```javascript
{
  code: "ABC123",           // 6-character room code
  host: "socket-id",        // Host player socket ID
  players: [                // Array of players
    {
      id: "socket-id",
      name: "Player 1",
      ready: false
    }
  ],
  gameState: null,          // Current game state
  started: false            // Game started flag
}
```

## Environment Variables

Create `.env` file:

```
PORT=3001
NODE_ENV=development
```

## Production Deployment

### Heroku

1. Create Heroku app
2. Add buildpack: `heroku/nodejs`
3. Set environment variables
4. Deploy: `git push heroku main`

### Railway

1. Connect GitHub repository
2. Set root directory to `/`
3. Add start command: `node server/index.js`
4. Deploy

### Render

1. Create new Web Service
2. Build command: `npm install`
3. Start command: `node server/index.js`
4. Deploy

## Testing

Test server connection:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "rooms": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3001
npx kill-port 3001
```

### Connection refused
- Check if server is running
- Verify firewall settings
- Check CORS configuration

### Players not syncing
- Check network connection
- Verify Socket.IO version compatibility
- Check browser console for errors
