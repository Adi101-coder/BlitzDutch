// This is a Vercel serverless function that handles Socket.io connections
// Make sure your server can be imported and used here

const socketHandler = require('../server/index.js');

module.exports = socketHandler;
