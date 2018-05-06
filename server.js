const http = require('http'), 
   {parse} = require('querystring'), 
   {readFileSync} = require('fs');

   var error = false;
   var sk;

   try {
      sk = readFileSync('config/sk.txt', 'utf8');
   } catch (err) {
      console.log("erreur "+ err);
      error = true;
   }


const {charges} = require("stripe")(sk);

const hostname = '127.0.0.1';
const port = 4000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/charge') {
      res.statusCode = 200;
      let body = '';
      req.on('error', (err) => {
        res.statusCode = err;
        res.end('error');
      })
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
    }else {
      res.statusCode = 404;
      res.statusMessage = 'Not found';
      res.end('error');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});