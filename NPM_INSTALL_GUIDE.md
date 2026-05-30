# npm Installation Commands

Complete list of npm install commands for all parts of the application.

## Frontend Installation

### Clean Install (Recommended)

```bash
# Remove old dependencies
rm -r node_modules
rm package-lock.json

# Fresh install
npm install

# Verify installation
npm start
```

### Quick Install

```bash
npm install
```

**Installs:**
- React 18.3.1
- Socket.IO Client 4.7.2
- Material-UI 6.1.1
- React Router 6.26.2
- And all dependencies (~400+ packages)

**Result:** `node_modules/` folder (~500 MB)

---

## Backend Installation

### In `server/` Directory

```bash
cd server
npm install
```

**Installs:**
- Express 4.18.2
- Socket.IO 4.7.2
- CORS middleware
- Nodemon (dev only)

**Result:** `server/node_modules/` folder (~100 MB)

---

## Full Stack Installation (All at Once)

```bash
# Option 1: Sequential
npm install
cd server && npm install && cd ..

# Option 2: Using npm script (if configured)
npm run install-all
```

---

## Android Development Setup

### Java Development Kit (JDK)

```bash
# Windows - verify installation
java -version

# Should output:
# openjdk version "17.0.x" ...
```

### Android SDK

```bash
# Verify Android SDK Manager
${ANDROID_HOME}\cmdline-tools\latest\bin\sdkmanager.bat --list

# Install build tools
${ANDROID_HOME}\cmdline-tools\latest\bin\sdkmanager.bat "build-tools;34.0.0"

# Install platform
${ANDROID_HOME}\cmdline-tools\latest\bin\sdkmanager.bat "platforms;android-34"
```

### Capacitor

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios
```

---

## Development Mode (with Auto-Reload)

### Backend with Nodemon

```bash
cd server
npm run dev

# Or install nodemon globally
npm install -g nodemon
nodemon server.js
```

### Frontend (Default)

```bash
npm start
# React Scripts automatically watches for changes
```

---

## Production Build

### Frontend Build

```bash
npm run build

# Optimized output in ./build directory
# Size: ~200 KB (gzipped)
```

### Backend Production

No special build needed (Node.js runs `.js` files directly), but optimize:

```bash
# Install compression middleware
npm install compression

# Update server.js to use compression
```

---

## Complete Installation Script (PowerShell)

```powershell
# One-command setup for Windows
Write-Host "Installing Decentralized Chat App..."

# Frontend
Write-Host "Installing frontend dependencies..."
npm install

# Backend
Write-Host "Installing backend dependencies..."
cd server
npm install
cd ..

# Capacitor Android
Write-Host "Installing Capacitor Android..."
npm install @capacitor/android

Write-Host "Installation complete! Run 'npm start' and 'cd server && npm start' in separate terminals."
```

---

## Complete Installation Script (Bash)

```bash
#!/bin/bash
# One-command setup for macOS/Linux

echo "Installing Decentralized Chat App..."

# Frontend
echo "Installing frontend dependencies..."
npm install

# Backend
echo "Installing backend dependencies..."
cd server
npm install
cd ..

# Capacitor
echo "Installing Capacitor..."
npm install @capacitor/cli @capacitor/core

echo "✅ Installation complete!"
echo "Start backend: cd server && npm start"
echo "Start frontend: npm start"
```

---

## Individual Package Installation

If you need individual packages:

```bash
# Frontend packages
npm install socket.io-client@4.7.2
npm install @mui/material @mui/icons-material
npm install react-router-dom@6.26.2

# Backend packages
npm install express@4.18.2
npm install socket.io@4.7.2
npm install cors@2.8.5

# Development tools
npm install -D nodemon
npm install -D @types/node
npm install -D eslint prettier
```

---

## Dependency Tree

### Frontend (`package.json`)

```
React 18.3.1
├── @mui/material 6.1.1
│   ├── @emotion/react
│   └── @emotion/styled
├── socket.io-client 4.7.2
├── react-router-dom 6.26.2
├── framer-motion 11.5.6
└── [other utils]
```

### Backend (`server/package.json`)

```
Node.js 14+
├── Express 4.18.2
├── Socket.IO 4.7.2
│   ├── Engine.IO
│   └── Socket.IO-Parser
├── CORS 2.8.5
└── [other utils]
```

---

## Troubleshooting npm Install

### Issue: "npm: command not found"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Close and reopen terminal
3. Verify: `node --version`

### Issue: "Permission denied"

**Windows:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Mac/Linux:**
```bash
# Use sudo (not recommended) or fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue: "npm ERR! code EACCES"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Retry install
npm install
```

### Issue: Slow installation

**Optimize:**
```bash
# Use npm ci (faster, more reliable for CI/CD)
npm ci

# Or use yarn (alternative package manager)
npm install -g yarn
yarn install
```

### Issue: Duplicate dependency error

**Solution:**
```bash
npm ls socket.io-client  # Check versions
npm install socket.io-client@4.7.2  # Force correct version
npm dedupe  # Remove duplicates
```

---

## Verify Installations

### Frontend Check

```bash
npm list socket.io-client
npm list @mui/material
npm list react
```

### Backend Check

```bash
cd server
npm list express
npm list socket.io
npm list cors
```

### Package Sizes

```bash
# Frontend
npm list --all | tail -20

# Backend
cd server && npm list --all | tail -20
```

---

## Update Dependencies (Optional)

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update socket.io-client

# Update to latest major version
npm install socket.io-client@latest
```

---

## Clean Uninstall & Reinstall

```bash
# Complete clean
rm -r node_modules package-lock.json
rm -r server/node_modules server/package-lock.json

# Fresh install
npm install
cd server && npm install
```

---

## CI/CD Installation (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: cd server && npm ci
      - run: npm run build
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install frontend dependencies |
| `cd server && npm install` | Install backend dependencies |
| `npm start` | Start frontend dev server |
| `npm run build` | Build optimized production frontend |
| `cd server && npm start` | Start backend server |
| `cd server && npm run dev` | Start backend with auto-reload |
| `npm list` | Show installed packages |
| `npm outdated` | Check for updates |
| `npm cache clean --force` | Clear npm cache |

---

## Post-Installation Setup

After running `npm install`:

1. ✅ Verify Socket.IO client installed: `ls node_modules | grep socket.io`
2. ✅ Verify Express installed: `ls server/node_modules | grep express`
3. ✅ Start backend: `cd server && npm start`
4. ✅ Start frontend: `npm start`
5. ✅ Open browser: `http://localhost:3000`

---

**Installation complete! Happy coding! 🚀**
