# Socket.IO Chat App - Setup & Deployment Guide

Complete step-by-step instructions for running and deploying the Socket.IO-based chat application.

## Table of Contents

1. [Local Setup](#local-setup)
2. [Running Locally](#running-locally)
3. [Testing](#testing)
4. [Building APK](#building-apk)
5. [Railway Deployment](#railway-deployment)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites

- **Node.js** 14+ ([download](https://nodejs.org/))
- **npm** 6+ (comes with Node.js)
- **Git** ([download](https://git-scm.com/))
- **Java JDK 17** (for Android APK) - [download](https://www.oracle.com/java/technologies/downloads/#java17)
- **Android SDK** (for Android APK) - included with Android Studio or downloadable separately
- **Capacitor CLI** (for iOS/Android)

### Step 1: Clone/Navigate to Repository

```bash
# If cloning fresh:
git clone https://github.com/khatarnaak-khiladi/Decentralized_Chat_App.git
cd Decentralized_Chat_App

# Or if already in the project:
cd path/to/Decentralized_Chat_App
```

### Step 2: Install Frontend Dependencies

```bash
# In project root
npm install

# This will:
# - Install React and dependencies
# - Install Socket.IO client (socket.io-client)
# - Install Material-UI components
# - Install Router and other libraries
```

### Step 3: Install Backend Dependencies

```bash
# In a new terminal, navigate to server directory
cd server
npm install

# This will:
# - Install Express
# - Install Socket.IO server
# - Install CORS middleware
```

**Result:**
- `node_modules/` in root (frontend)
- `server/node_modules/` (backend)
- Ready to run!

---

## Running Locally

### Terminal Setup

You'll need **3 terminals** running simultaneously:

**Terminal 1: Backend Server**
```bash
cd server
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════════╗
║  Socket.IO Chat Server Running                         ║
║  PORT: 3001                                            ║
║  Environment: development                              ║
║  URL: http://localhost:3001                            ║
╚════════════════════════════════════════════════════════╝
```

**Terminal 2: Frontend Development Server**
```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view recon in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Quick Start Commands

```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend (in new terminal)
npm start

# Both are now running - open http://localhost:3000 in your browser
```

---

## Testing

### Test in Browser (Same Machine)

1. **Open Two Browser Windows**
   - Window 1: `http://localhost:3000`
   - Window 2: `http://localhost:3000` (in incognito/private mode to avoid session caching)

2. **Window 1: Create Room**
   - Enter Name: "Alice"
   - Click "Create Room"
   - Note the generated code (e.g., "ABCD1234")

3. **Window 2: Join Room**
   - Enter Name: "Bob"
   - Click "Join Room" mode
   - Enter the code from Window 1
   - Click "Join with code"

4. **Test Messaging**
   - Alice (Window 1) sends: "Hello Bob!"
   - Verify Bob (Window 2) receives it immediately
   - Bob sends: "Hi Alice!"
   - Verify Alice receives it
   - Check delivery status shows "✓ Delivered"

### Test on Mobile (Same Network)

**Find Your Computer's IP:**

```bash
# On Windows (PowerShell):
ipconfig

# On Mac/Linux:
ifconfig
```

Look for local IP like `192.168.1.100`

**Update Backend Connection:**

Edit `src/services/socket.js` temporarily:

```javascript
// Change from:
const backendUrl = `http://localhost:3001`;

// To:
const backendUrl = `http://192.168.1.100:3001`;
```

**On Mobile Browser:**

1. Go to: `http://192.168.1.100:3000`
2. Create or join room
3. Verify messaging works across devices

---

## Building APK

### Prerequisites

- JDK 17 installed
- Android SDK installed
- Environment variables set:
  ```bash
  $env:JAVA_HOME = "C:\Users\YourUser\AppData\Local\jdks\jdk-17.0.18"
  $env:ANDROID_HOME = "C:\Users\YourUser\AppData\Local\Android\sdk"
  ```

### Step 1: Build Web Assets

```bash
npm run build
```

Output: `build/` directory with optimized React app

### Step 2: Update Android Assets

```bash
npx cap sync android
```

This copies the web build to Android's assets.

### Step 3: Build APK

```bash
cd android
.\gradlew.bat assembleDebug
```

For Release APK (unsigned):
```bash
.\gradlew.bat assembleRelease
```

### APK Locations

- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Install on Device

```bash
# Connect Android device via USB

# Install debug APK:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or drag-drop APK to device storage and tap to install
```

---

## Railway Deployment

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up (GitHub recommended)
3. Create a new project

### Step 2: Connect Repository

1. Railway Dashboard → "New Project"
2. Select "Deploy from GitHub"
3. Choose your repository: `Decentralized_Chat_App`
4. Click "Create"

### Step 3: Add Variables (Optional)

In Railway Project Settings → Variables:

```env
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy

Railway auto-detects Node.js project and deploys.

**Deployment runs:**
```bash
npm install
npm start
```

### Step 5: Get Public URL

Railway generates a public URL like:
```
https://decentralized-chat-app-production.railway.app
```

### Step 6: Update Frontend

**Update `src/services/socket.js`:**

```javascript
const getBackendUrl = () => {
  // For Railway deployment
  if (window.location.hostname.includes('railway.app')) {
    return window.location.origin;
  }
  // Fallback for local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  // For local network
  return `http://${window.location.hostname}:3001`;
};
```

### Step 7: Deploy Frontend

Option A: **Netlify** (Recommended)

```bash
npm run build
# Drag build/ folder to https://app.netlify.com/drop
```

Option B: **Vercel**

```bash
npm install -g vercel
npm run build
vercel --prod
```

Option C: **Railway** (Full Stack)

If deploying both frontend and backend on Railway:

```bash
# Edit Railway configuration to build and serve both
# Or use a root package.json that builds both
```

---

## Configuration

### Frontend Environment Variables

Create `.env` in project root:

```env
# Development
REACT_APP_SOCKET_SERVER=http://localhost:3001

# Production
# REACT_APP_SOCKET_SERVER=https://your-railway-app.railway.app
```

### Backend Configuration

Edit `server/server.js` for production:

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Add authentication if needed
app.use(authenticateToken);
```

### CORS Configuration

Modify `server/server.js` CORS settings for your domains:

```javascript
io.engine.opts.cors = {
  origin: [
    'http://localhost:3000',           // Local dev
    'http://192.168.1.*:3000',         // Local network
    'https://your-app.netlify.app',    // Frontend domain
    'https://your-backend.railway.app' // Backend domain
  ],
  credentials: true
};
```

---

## Troubleshooting

### Issue: "Cannot find module 'socket.io'"

**Solution:**
```bash
cd server
npm install socket.io express cors
npm start
```

### Issue: "Connection refused on localhost:3001"

**Checklist:**
1. Is backend running? Check Terminal 1
2. Correct port? (`3001` is default)
3. Firewall blocking? Try disabling temporarily
4. Try: `curl http://localhost:3001/health`

### Issue: Messages not receiving

**Check:**
1. Browser console for JavaScript errors (F12)
2. Both frontend and backend running?
3. Room code matches exactly (case-sensitive)?
4. Network tab shows WebSocket connection? (DevTools → Network → WS)

### Issue: "Cannot connect to Railway backend"

**Debug:**
```bash
# Test Railway endpoint
curl https://your-app.railway.app/health

# Check CORS errors in browser console
# Verify domain is in CORS whitelist
```

### Issue: Android APK crashes on startup

**Check:**
1. Backend URL in `socket.js` correct?
2. Internet permission in `AndroidManifest.xml`?
3. Target API level compatible?
4. Try building debug APK first

### Issue: "No localhost references" warning for Capacitor

**Solution:**

Remove all `localhost` hardcodes:

```javascript
// ❌ Bad
const socket = io('http://localhost:3001');

// ✅ Good
const socket = io(process.env.REACT_APP_SOCKET_SERVER);
```

### Issue: High Latency / Slow Messages

**Optimize:**
1. Reduce concurrent message listeners
2. Enable Socket.IO compression
3. Use Redis adapter for production
4. Check network latency: `ping https://your-app.railway.app`

---

## Quick Reference Commands

```bash
# Local Development
npm install              # Install frontend deps
cd server && npm install # Install backend deps

npm start                # Start frontend (Terminal 1)
cd server && npm start   # Start backend (Terminal 2)

# Building
npm run build            # Build for production

# Android
npx cap sync android     # Sync web build to Android
cd android && .\gradlew.bat assembleDebug  # Build APK

# Deployment
railway deploy           # Deploy to Railway
npm run build && vercel --prod  # Deploy frontend to Vercel

# Testing
curl http://localhost:3001/health  # Check backend
curl http://localhost:3001/stats   # View server stats
```

---

## Deployment Checklist

- [ ] Frontend tested locally in 2+ browsers
- [ ] Backend tested locally (health check passed)
- [ ] APK builds without errors
- [ ] All `localhost` references removed
- [ ] Backend deployed to Railway
- [ ] Frontend environment variables updated
- [ ] Frontend deployed to Netlify/Vercel
- [ ] Cross-origin messaging tested
- [ ] Mobile app tested on physical device
- [ ] Server stats endpoint working: `/stats`
- [ ] Error logs reviewed

---

## Performance Targets

- Message latency: < 200ms
- Connection time: < 500ms
- Concurrent users: 100+ per room
- Server uptime: > 99.5%
- Error rate: < 0.1%

---

## Next Steps

1. ✅ Set up locally (this guide)
2. ✅ Test in browser
3. ✅ Build and test APK
4. ✅ Deploy to Railway
5. 📝 Monitor with Railway stats
6. 🔒 Add authentication (optional)
7. 💾 Add database persistence (optional)

---

## Support & Resources

- **Socket.IO Docs**: https://socket.io/docs/
- **Express Docs**: https://expressjs.com/
- **Railway Docs**: https://docs.railway.app/
- **Capacitor Docs**: https://capacitorjs.com/docs/

---

**Happy deploying! 🚀**
