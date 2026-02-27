# 🚀 Deployment Guide - Play Online with Friends

## Quick Deploy (Easiest Method)

### Option A: Render + Vercel (Recommended - FREE)

#### 1️⃣ Deploy Server to Render

**Step 1: Prepare Your Code**
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Deploy on Render**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `blitz-dutch-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Copy your server URL (e.g., `https://blitz-dutch-server.onrender.com`)

#### 2️⃣ Deploy Frontend to Vercel

**Step 1: Create Environment Variable**

Create `.env` file in root:
```
REACT_APP_SOCKET_URL=https://your-server-url.onrender.com
```

Replace with your actual Render URL!

**Step 2: Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add Environment Variable:
   - Key: `REACT_APP_SOCKET_URL`
   - Value: Your Render server URL
7. Click "Deploy"
8. Wait 2-3 minutes
9. Get your app URL (e.g., `https://blitz-dutch.vercel.app`)

**Step 3: Update Server CORS**

Go back to Render dashboard:
1. Click your service
2. Go to "Environment"
3. Add environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: Your Vercel URL
4. Or update `server/index.js` CORS settings with your Vercel URL

#### 3️⃣ Test Your Deployment

1. Open your Vercel URL in browser
2. Go to `/lobby`
3. Create a room
4. Share the URL + room code with a friend
5. Friend joins the room
6. Play together!

---

### Option B: Railway (Alternative - FREE)

#### Deploy Everything on Railway

**Step 1: Deploy Server**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
6. Set start command: `node server/index.js`
7. Deploy and copy server URL

**Step 2: Deploy Frontend**
1. Click "New" → "GitHub Repo" (same repo)
2. Add environment variable:
   - `REACT_APP_SOCKET_URL=your-railway-server-url`
3. Set build command: `npm run build`
4. Set start command: `npx serve -s build`
5. Deploy and get frontend URL

---

### Option C: Heroku (Paid but Reliable)

#### Deploy Server
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create blitz-dutch-server

# Deploy
git push heroku main

# Set environment
heroku config:set NODE_ENV=production

# Get URL
heroku open
```

#### Deploy Frontend
```bash
# Create frontend app
heroku create blitz-dutch-app

# Set environment
heroku config:set REACT_APP_SOCKET_URL=https://blitz-dutch-server.herokuapp.com

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main
```

---

## 🎮 How to Play with Friends

### After Deployment:

1. **Share Your App URL**
   - Send your Vercel/Railway URL to friends
   - Example: `https://blitz-dutch.vercel.app`

2. **Create a Room**
   - You: Go to `/lobby`
   - Click "Create Room"
   - Get 6-character room code (e.g., `ABC123`)

3. **Friend Joins**
   - Friend: Opens your app URL
   - Goes to `/lobby`
   - Enters room code
   - Clicks "Join Room"

4. **Start Playing**
   - Both click "Ready"
   - Host clicks "Start Game"
   - Enjoy!

---

## 🔧 Troubleshooting

### Server Issues

**Problem**: Server not responding
```bash
# Check server logs on Render
# Go to Render dashboard → Your service → Logs
```

**Problem**: CORS errors
```javascript
// Update server/index.js CORS settings
cors: {
  origin: ["https://your-vercel-app.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true
}
```

### Frontend Issues

**Problem**: Can't connect to server
1. Check `REACT_APP_SOCKET_URL` is correct
2. Verify server is running
3. Check browser console for errors

**Problem**: Environment variable not working
```bash
# Redeploy on Vercel
vercel --prod

# Or rebuild on Render
# Click "Manual Deploy" → "Deploy latest commit"
```

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Render (Server)**
- ✅ Free forever
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Takes 30-60s to wake up
- ✅ 750 hours/month free

**Vercel (Frontend)**
- ✅ Free forever
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN

**Total Cost**: $0/month 🎉

### Upgrade Options:

If you need better performance:
- **Render**: $7/month (no sleep)
- **Railway**: $5/month (500 hours)
- **Heroku**: $7/month (no sleep)

---

## 📱 Mobile Access

Your deployed app works on mobile browsers!

1. Open app URL on phone
2. Add to home screen (optional)
3. Play anywhere

---

## 🔒 Security Notes

### Before Going Public:

1. **Add Rate Limiting**
```bash
npm install express-rate-limit
```

2. **Add Authentication** (optional)
```bash
npm install jsonwebtoken
```

3. **Environment Variables**
- Never commit `.env` files
- Use platform environment settings

---

## 📊 Monitoring

### Check Server Health:
```bash
curl https://your-server.onrender.com/health
```

### Check Active Rooms:
```bash
curl https://your-server.onrender.com/room/ABC123
```

---

## 🎯 Quick Checklist

Before sharing with friends:

- [ ] Server deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Test create/join room
- [ ] Test gameplay
- [ ] Share URL with friends!

---

## 🆘 Need Help?

### Common Issues:

1. **"Room not found"**
   - Server might be sleeping (Render free tier)
   - Wait 30-60 seconds and try again

2. **"Connection failed"**
   - Check server URL in environment variables
   - Verify server is running

3. **"CORS error"**
   - Update server CORS settings
   - Add your frontend URL to allowed origins

### Still Stuck?

1. Check server logs
2. Check browser console
3. Verify all URLs are correct
4. Try redeploying both services

---

## 🎉 Success!

Once deployed, you can:
- ✅ Play with friends anywhere
- ✅ Share a single URL
- ✅ No installation needed
- ✅ Works on mobile
- ✅ Free hosting

**Enjoy your game! 🎮**
