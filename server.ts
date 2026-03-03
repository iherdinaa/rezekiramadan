import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SHEET_WEBHOOK_URL = process.env.VITE_SHEET_WEBHOOK_URL || '';

app.post('/api/submit', async (req, res) => {
  if (!SHEET_WEBHOOK_URL) {
    console.error('[v0] VITE_SHEET_WEBHOOK_URL is not set.');
    res.status(500).json({ status: 'error', message: 'Webhook URL not configured.' });
    return;
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      // Follow redirects — Apps Script often redirects to the execution URL
      redirect: 'follow',
    });

    const text = await response.text();
    console.log('[v0] Apps Script response:', text);

    res.json({ status: 'success', message: 'Data forwarded to sheet.' });
  } catch (err) {
    console.error('[v0] Failed to forward to Apps Script:', err);
    res.status(500).json({ status: 'error', message: String(err) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[v0] API server running on port ${PORT}`);
});
