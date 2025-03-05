// const express = require('express');
// const next = require('next');

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   // Middleware to enable CORS
//   server.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3002'); // Replace with your frontend origin
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     next();
//   });

//   server.all('*', (req, res) => {
//     return handle(req, res);
//   });

//   server.listen(3000, (err) => {
//     if (err) throw err;
//     console.log('> Ready on http://localhost:3000');
//   });
// });

const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json());

  // Middleware to enable CORS
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Replace with your frontend origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  // Add the callback endpoint
  // server.post('/callback', (req, res) => {
  //   const { jsonpayload } = req.body;

  //   if (jsonpayload) {
  //     const { requesttransactionid, transactionid, responsecode, status } = jsonpayload;

  //     console.log('Callback received:');
  //     console.log(`Request Transaction ID: ${requesttransactionid}`);
  //     console.log(`Transaction ID: ${transactionid}`);
  //     console.log(`Response Code: ${responsecode}`);
  //     console.log(`Status: ${status}`);

  //     // Here you can add your logic to handle the payment status
  //     // For example, update your database, notify the user, etc.

  //     // Send an appropriate response back to the payment service
  //     res.status(200).json({ message: 'Callback received successfully' });
  //   } else {
  //     res.status(400).json({ message: 'Invalid callback data' });
  //   }
  // });


  server.post('/callback', (req, res) => {
    const { jsonpayload } = req.body;

    if (jsonpayload) {
        const { requesttransactionid, transactionid, responsecode, status } = jsonpayload;

        console.log('Callback received:');
        console.log(`Request Transaction ID: ${requesttransactionid}`);
        console.log(`Transaction ID: ${transactionid}`);
        console.log(`Response Code: ${responsecode}`);
        console.log(`Status: ${status}`);

        // Here you can add your logic to handle the payment status
        // For example, update your database, notify the user, etc.

        // Send the required response back to the payment service
        res.status(200).json({
            message: 'success',
            success: true,
            request_id: requesttransactionid
        });
    } else {
        res.status(400).json({ message: 'Invalid callback data' });
    }
});

  // Handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
