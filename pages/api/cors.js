// pages/api/cors.js
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your frontend origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // Handle other requests here
  }
  