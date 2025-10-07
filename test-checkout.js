const http = require('http');

const postData = JSON.stringify({
  items: [{
    _id: "68e55c1791dc9c975240d75f",  // Use actual ObjectId from current database
    name: "Wireless Headphones",
    price: 29.99,
    quantity: 1
  }]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/checkout/create-checkout-session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
