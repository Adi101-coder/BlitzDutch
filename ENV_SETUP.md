# 🔐 Environment Variables Setup Guide

## Backend (Render)

### Required Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets Node environment |
| `PORT` | `10000` | Port for server (Render default) |
| `ALLOWED_ORIGINS` | Your frontend URLs | CORS allowed origins |

### How to Set on Render:

**Option 1: Using render.yaml (Automatic)**
- Already configured in `render.yaml`
- Will be set automatically on deployment

**Option 2: Manual Setup in Dashboard**
1. Go to your service on Render
2. Click "Environment" tab
3. Add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
4. Click "Save Changes"

### ALLOWED_ORIGINS Format:

**Single origin:**
```
https://blitz-dutch.vercel.app
```

**Multiple origins (comma-separated):**
```
https://blitz-dutch.vercel.app,https://blitz-dutch-staging.vercel.app
```

**Allow all (not recommended for production):**
```
*
```

---

## Frontend (Vercel)

### Required Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_SOCKET_URL` | Your Render server URL | WebSocket server endpoint |

### How to Set on Vercel:

**During Initial Deployment:**
1. When creating project, go to "Environment Variables"
2. Add:
   - Name: `REACT_APP_SOCKET_URL`
   - Value: `https://your-server.onrender.com`
3. Select: Production, Preview, Development
4. Click "Add"

**After Deployment:**
1. Go to your project on Vercel
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add new variable:
   - Name: `REACT_APP_SOCKET_URL`
   - Value: `https://your-server.onrender.com`
5. Click "Save"
6. Redeploy: Go to "Deployments" → Click "..." → "Redeploy"

---

## Local Development

### Create `.env` file in root:

```bash
# Frontend
REACT_APP_SOCKET_URL=http://localhost:3001

# Backend (optional, defaults are fine)
NODE_ENV=development
PORT=3001
```

### Don't commit `.env` file!
It's already in `.gitignore`

---

## Complete Setup Checklist

### Step 1: Deploy Backend (Render)
- [ ] Deploy server to Render
- [ ] Copy server URL (e.g., `https://blitz-dutch-server.onrender.com`)
- [ ] Verify `NODE_ENV=production` is set
- [ ] Verify `PORT=10000` is set

### Step 2: Deploy Frontend (Vercel)
- [ ] Add `REACT_APP_SOCKET_URL` environment variable
- [ ] Use your Render server URL as value
- [ ] Deploy frontend
- [ ] Copy frontend URL (e.g., `https://blitz-dutch.vercel.app`)

### Step 3: Update Backend CORS
- [ ] Go to Render dashboard
- [ ] Add/Update `ALLOWED_ORIGINS` environment variable
- [ ] Set value to your Vercel URL
- [ ] Server will auto-restart

### Step 4: Test
- [ ] Open frontend URL
- [ ] Check browser console for errors
- [ ] Try creating a room
- [ ] Verify WebSocket connection

---

## Troubleshooting

### "CORS Error" in Browser Console

**Problem:** Frontend can't connect to backend

**Solution:**
1. Check `ALLOWED_ORIGINS` on Render includes your Vercel URL
2. Make sure there are no trailing slashes
3. Restart Render service after changing

**Example:**
```
✅ Correct: https://blitz-dutch.vercel.app
❌ Wrong:   https://blitz-dutch.vercel.app/
```

### "Failed to connect to server"

**Problem:** Frontend can't reach backend

**Solution:**
1. Verify `REACT_APP_SOCKET_URL` is set correctly on Vercel
2. Check Render server is running (not sleeping)
3. Test server health: `curl https://your-server.onrender.com/health`

### Environment Variable Not Working

**Problem:** Changes not taking effect

**Solution:**
1. **Vercel:** Redeploy after changing env vars
2. **Render:** Service auto-restarts, wait 1-2 minutes
3. Clear browser cache
4. Check spelling of variable names (case-sensitive!)

### Server Sleeping (Render Free Tier)

**Problem:** First request takes 30-60 seconds

**Solution:**
1. This is normal for free tier
2. Upgrade to paid plan ($7/month) to prevent sleep
3. Or use UptimeRobot to ping server every 10 minutes

---

## Environment Variable Examples

### Development (.env)
```bash
REACT_APP_SOCKET_URL=http://localhost:3001
NODE_ENV=development
PORT=3001
```

### Production (Render)
```bash
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://blitz-dutch.vercel.app
```

### Production (Vercel)
```bash
REACT_APP_SOCKET_URL=https://blitz-dutch-server.onrender.com
```

---

## Security Best Practices

### ✅ DO:
- Use specific origins in `ALLOWED_ORIGINS`
- Keep `.env` files in `.gitignore`
- Use HTTPS in production
- Rotate secrets regularly

### ❌ DON'T:
- Commit `.env` files to Git
- Use `*` for CORS in production
- Share environment variables publicly
- Hardcode sensitive data in code

---

## Quick Reference

### Check if env vars are loaded:

**Backend (Render):**
```bash
# Check logs
# Render Dashboard → Your Service → Logs
# Look for: "Server running on port 10000"
```

**Frontend (Vercel):**
```javascript
// In browser console
console.log(process.env.REACT_APP_SOCKET_URL)
// Should show your server URL
```

### Test server health:
```bash
curl https://your-server.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "rooms": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Need Help?

1. Check variable names (case-sensitive!)
2. Verify values have no extra spaces
3. Redeploy after changes
4. Check service logs for errors
5. Test with curl/Postman first

---

**Remember:** Environment variables are set per deployment platform, not in your code!
