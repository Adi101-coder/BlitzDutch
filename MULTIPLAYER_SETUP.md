# 🎮 Multiplayer Setup Guide

Complete guide to set up and run the WebSocket multiplayer server for Blitz Dutch.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## 🚀 Quick Start

### Option 1: Run Both Client and Server Together

```bash
# Install concurrently (if not already installed)
npm install -g concurrently

# Run both client and server
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Start Server:**
```bash
npm run server
```

**Terminal 2 - Start Client:**
```bash
npm start
```

## 🎯 How to Use Multiplayer

### Creating a Room

1. Navigate to `/lobby` page
2. Enter your player name
3. Click "Create Room"
4. Share the 6-character room code with friends

### Joining a Room

1. Navigate to `/lobby` page
2. Enter your player name
3. Enter the room code
4. Click "Join Room"

### Starting the Game

1. Wait for all players to join
2. Players click "Ready"
3. Host clicks "Start Game"
4. Game begins!

## 🔧 Configuration

### Server Port

Default: `3001`

To change, create `.env` file:
```
PORT=3001
```

### Client Socket URL

Default: `http://localhost:3001`

To change, create `.env` file in root:
```
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 📡 Server Features

### Room Management
- ✅ Create rooms with unique codes
- ✅ Join existing rooms
- ✅ Leave rooms
- ✅ Auto-cleanup empty rooms

### Player Management
- ✅ Track connected players
- ✅ Handle disconnections
- ✅ Ready status tracking
- ✅ Host assignment

### Game Synchronization
- ✅ Real-time game state updates
- ✅ Action broadcasting
- ✅ Turn management
- ✅ Score synchronization

## 🌐 Deployment

### Deploy Server to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create blitz-dutch-server

# Deploy
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
```

### Deploy Client to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add REACT_APP_SOCKET_URL
# Enter your Heroku server URL
```

### Deploy to Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

## 🧪 Testing Multiplayer

### Test Locally

1. Open two browser windows
2. Window 1: Create room
3. Window 2: Join room with code
4. Both players ready
5. Start game

### Test with Friends

1. Deploy server to cloud
2. Update `REACT_APP_SOCKET_URL`
3. Share deployed client URL
4. Create/join rooms

## 🐛 Troubleshooting

### Server won't start

```bash
# Check if port is in use
npx kill-port 3001

# Restart server
npm run server
```

### Client can't connect

1. Check server is running
2. Verify `REACT_APP_SOCKET_URL` is correct
3. Check browser console for errors
4. Verify CORS settings

### Players not syncing

1. Check network connection
2. Refresh both browsers
3. Check server logs
4. Verify Socket.IO versions match

### Room not found

1. Verify room code is correct
2. Check if room expired
3. Create new room

## 📊 Monitoring

### Check Server Health

```bash
curl http://localhost:3001/health
```

### Check Active Rooms

```bash
curl http://localhost:3001/room/ABC123
```

### Server Logs

Server logs show:
- Player connections/disconnections
- Room creation/deletion
- Game events
- Errors

## 🔒 Security Notes

- Room codes are randomly generated
- No authentication required (add if needed)
- CORS configured for localhost
- Update CORS for production

## 📚 API Reference

### Socket Events

**Client Emits:**
- `create-room` - Create new room
- `join-room` - Join existing room
- `leave-room` - Leave current room
- `player-ready` - Toggle ready status
- `start-game` - Start game (host only)
- `game-action` - Send game action
- `update-game-state` - Update state

**Server Emits:**
- `room-updated` - Room changed
- `game-started` - Game began
- `game-action` - Action from player
- `game-state-updated` - State changed
- `player-disconnected` - Player left

## 💡 Tips

1. **Room Codes**: 6 characters, uppercase
2. **Max Players**: 10 per room
3. **Auto-cleanup**: Empty rooms deleted
4. **Host Powers**: Only host can start game
5. **Reconnection**: Automatic with delays

## 🎓 Next Steps

1. Add authentication
2. Implement game logic sync
3. Add chat functionality
4. Create leaderboards
5. Add spectator mode

## 📞 Support

For issues or questions:
1. Check server logs
2. Check browser console
3. Review this guide
4. Check Socket.IO documentation

---

**Happy Gaming! 🎮**
