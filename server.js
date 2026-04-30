const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Fallback route to serve index.html for all other requests (useful for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running and listening on 0.0.0.0:${PORT}`);
});
