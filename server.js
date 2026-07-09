const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Your Google Apps Script Web App URL (the /exec link from your deployment)
const GS_URL = "https://script.google.com/macros/s/AKfycbx6eTl1MAfIGq-D9c3_cTsqPGyR_x5HWqrUwbnfwLIuucSsh9-rHvj6iA-1GW6B9tHWkQ/exec";

app.get('/api/kv', async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'missing key' });
    const r = await fetch(GS_URL + '?action=get&key=' + encodeURIComponent(key));
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error('GET /api/kv failed:', e);
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/kv', async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key) return res.status(400).json({ error: 'missing key' });
    const r = await fetch(
      GS_URL + '?action=set&key=' + encodeURIComponent(key) + '&value=' + encodeURIComponent(value)
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error('POST /api/kv failed:', e);
    res.status(500).json({ error: String(e) });
  }
});

// Simple health check so you can confirm the server + sheet link are alive
app.get('/api/health', async (req, res) => {
  try {
    const r = await fetch(GS_URL + '?action=get&key=__health__');
    const ok = r.ok;
    res.json({ server: 'ok', sheetsReachable: ok });
  } catch (e) {
    res.json({ server: 'ok', sheetsReachable: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Scroll or Soul server listening on port ' + PORT));
