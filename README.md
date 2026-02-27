# Dutch Card Game

A fully playable MVP of the Dutch card game built with React and Tailwind CSS.

## Features

- 52-card deck (no jokers) with automatic shuffling
- Support for 2-4 players
- Each player receives 4 face-down cards
- Interactive draw and discard piles
- Turn-based gameplay with card swapping mechanics
- Matching cards rule: discard cards of the same rank as the top discard
- Scoring system: Ace=1, 2-10=face value, J=11, Q=12, K=13
- Beautiful, responsive UI with smooth card flip animations
- Scoreboard tracking round and total scores



1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Backend Setup

### WebSocket Server

The game uses a WebSocket server (Socket.IO) to handle multiplayer functionality, real-time game state synchronization, and player communication.

### Running the Backend

Start the backend server:

```bash
npm run server
```

The backend server will run on [http://localhost:5000](http://localhost:5000) by default.

**Environment Variables:**
- `PORT` - Backend server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `VERCEL_URL` - Vercel URL for production deployment

### Backend Features

- Room-based multiplayer lobbies
- Real-time game state broadcasting via WebSocket
- Player connection/disconnection handling
- Game event management (draw, swap, discard, Dutch calls)
- Automatic room cleanup when empty

## How to Play

1. **Setup**: Choose the number of players (2-4) and click "Start Game"
2. **Deal**: Each player receives 4 face-down cards
3. **Turn**: On your turn:
   - Draw a card from the draw pile OR take the top card from the discard pile
   - Select one of your face-down cards to swap (it will flip to reveal)
   - The swapped card goes to the discard pile
   - If you have a card matching the top discard's rank, you can click it to discard immediately
4. **End Turn**: Click "End Turn" to pass to the next player
5. **Call Dutch**: Click "Call Dutch" to end the round and calculate scores
6. **Scoring**: Points are calculated based on remaining cards in hand
7. **New Round**: Click "New Round" to start a fresh game

## Game Rules

- Players take turns drawing/swapping cards
- Matching cards can be discarded immediately when the top discard matches
- The goal is to minimize points in your hand
- Lower total score wins over multiple rounds

## Technologies

- React 18.2.0
- Tailwind CSS 3.3.6
- Create React App

## Project Structure

```
src/
  components/
    Card.js          - Card component with flip animation
    PlayerHand.js    - Player hand display
    GameCenter.js    - Draw and discard piles
    Scoreboard.js    - Score display
  utils/
    cardUtils.js     - Card utilities (deck, shuffle, scoring)
  App.js             - Main game component with logic
  index.js           - App entry point
  index.css          - Global styles and animations

server/
  index.js           - Socket.IO WebSocket server
                      - Handles multiplayer rooms
                      - Manages real-time game state

api/
  socket.js          - Vercel serverless function wrapper for Socket.IO
```

