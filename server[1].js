// Simple Express server placeholder
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => console.log(`KARBA backend running on port ${PORT}`));
