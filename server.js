const http = require('http'), 
   {parse} = require('querystring'), 
   {readFileSync} = require('fs'),
   sk = readFileSync('config/sk.txt', 'utf8');


const {charges} = require("stripe")(sk);

const hostname = '127.0.0.1';
const port = 4000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });
  req.on('end', () => {
    const {id, amount, currency} = JSON.parse(body);
    const charge = charges.create({
      amount : amount,
      currency: currency,
      description: 'nodejs charge',
      source: id,
    });
    res.end('ok');
});
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});