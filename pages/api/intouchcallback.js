export default async function handler(req, res) {
    console.log('Request received:', req.method, req.url);
  
    if (req.method === 'POST') {
      try {
        console.log('Request body:', req.body);
        // Get the data from the request body
        const { jsonpayload } = req.body;
  
        // Log the callback data for debugging purposes
        console.log('Received callback data:', jsonpayload);
  
        // Extract relevant information from the jsonpayload
        const { requesttransactionid, transactionid, responsecode, status } = jsonpayload;
  
        // Process the callback data as needed
        // For example, update your database or trigger some other actions
  
        // Example: Logging the extracted information
        console.log(`Request Transaction ID: ${requesttransactionid}`);
        console.log(`Transaction ID: ${transactionid}`);
        console.log(`Response Code: ${responsecode}`);
        console.log(`Status: ${status}`);
  
        // Send a response back to the payment service
        res.status(200).json({ message: 'Callback received successfully' });
      } catch (error) {
        console.error('Error handling callback:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // If the request method is not POST, return a 405 Method Not Allowed response
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  