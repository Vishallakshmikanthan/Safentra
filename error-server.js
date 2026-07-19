const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log('--- ERROR RECEIVED FROM BROWSER ---');
    console.log(body);
    console.log('-----------------------------------');
    res.writeHead(200);
    res.end('OK');
    process.exit(0);
  });
});
server.listen(9999, () => {
  console.log('Error server listening on 9999');
});
