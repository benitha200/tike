import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { bookingId, amount, phoneNumber } = req.body;

    try {
      // Call your backend API to process the payment
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
        },
        body: JSON.stringify({ payment_status: true }),
      });

      if (response.ok) {
        res.status(200).json({ message: 'Payment successful' });
      } else {
        res.status(400).json({ message: 'Payment failed' });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}