const http = require('http');

const loginData = JSON.stringify({
  email: 'merchant@example.com',
  password: 'password'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Login Response:', data);
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) {
      console.log('No cookie received.');
      return;
    }
    
    const auctionData = JSON.stringify({
      title: 'Test Auction',
      basePrice: 500.00,
      endTime: new Date(Date.now() + 86400000).toISOString()
    });
    
    const auctionReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auctions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': auctionData.length,
        'Cookie': setCookie[0]
      }
    }, (aRes) => {
      let aData = '';
      aRes.on('data', (chunk) => { aData += chunk; });
      aRes.on('end', () => {
        console.log('Auction Response:', aData);
      });
    });
    
    auctionReq.write(auctionData);
    auctionReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
