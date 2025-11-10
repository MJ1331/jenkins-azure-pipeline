const http = require('http');
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.end('✅ Hello from Jenkins CI/CD deployed on Azure Web App via Docker + ACR!');
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
