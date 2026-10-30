# Clinic Management System
Complete Node.js + Express + SQLite clinic queue application.

## Run on a computer
1. Install Node.js 18 or newer.
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm start`
5. Visit `http://localhost:3000`

## Deploy
Deploy as a **Node.js Web Service**, not a static website.
- Build command: `npm install`
- Start command: `npm start`

The SQLite database is created automatically at `data/clinic.db`.
**Hosting warning:** free hosting filesystems may be temporary and can erase SQLite data after restarts/redeploys. For persistent SQLite on Render, attach a persistent disk mounted at `/var/data` and set `DATA_DIR=/var/data`. For fully free persistent cloud storage, the app needs conversion to a hosted PostgreSQL database.

## Files
- `server/index.js` - Express API and SQLite database
- `public/index.html` - UI
- `public/style.css` - styling
- `public/app.js` - frontend logic
