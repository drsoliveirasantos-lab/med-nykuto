#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = process.cwd();
const port = Number(process.env.MED_NYKUTO_TEST_PORT || 4173);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

http.createServer((request, response) => {
  let pathname = '/';
  try { pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname); }
  catch (_) { response.writeHead(400).end('Bad request'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if(target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end('Forbidden'); return; }
  fs.stat(target, (statError, stat) => {
    const file = !statError && stat.isDirectory() ? path.join(target, 'index.html') : target;
    fs.readFile(file, (error, body) => {
      if(error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found'); return; }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    });
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Med Nykuto test server listening on http://127.0.0.1:${port}`);
});
