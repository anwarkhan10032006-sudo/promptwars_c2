const express = require('express');
const path = require('path');
const app = express();

// Serve all static files (HTML, CSS, JS) from the root directory
app.use(express.static(__dirname));

// Fallback route so all requests return index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// The server MUST listen on process.env.PORT and bind to "0.0.0.0"
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server is successfully listening on 0.0.0.0:${process.env.PORT}`);
});
