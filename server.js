const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Your Firebase Realtime Database URL (no trailing slash)
const FIREBASE_URL = "https://scroll-or-soul-default-rtdb.firebaseio.com";

function keyToPath(key) {
  // Turns "stw:scores" into "stw/scores" so it becomes a Firebase path
  return String(key).replace(/:/g, '/');
}

app.get('/api/kv', async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'missing key' });
    const r = await fetch(`${FIREBASE_URL}/${keyToPath(key)}.json`);
    const data = await r.json(); // null, or whatever was stored
    res.json({ value: data === null || data === undefined ? null : JSON.stringify(data) });
  } catch (e) {
    console.error('GET /api/kv failed:', e);
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/kv', async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key) return res.status(400).json({ error: 'missing key' });
    const parsed = JSON.parse(value);
    const r = await fetch(`${FIREBASE_URL}/${keyToPath(key)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    });
    res.json({ ok: r.ok });
  } catch (e) {
    console.error('POST /api/kv failed:', e);
    res.status(500).json({ error: String(e) });
  }
});

// Simple health check so you can confirm the server + Firebase link are alive
app.get('/api/health', async (req, res) => {
  try {
    const r = await fetch(`${FIREBASE_URL}/__health__.json`);
    res.json({ server: 'ok', firebaseReachable: r.ok });
  } catch (e) {
    res.json({ server: 'ok', firebaseReachable: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Scroll or Soul server listening on port ' + PORT));
