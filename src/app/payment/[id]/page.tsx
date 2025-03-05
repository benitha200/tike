"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";
import QRCode from "react-qr-code";
import { CheckCircle } from 'lucide-react';

interface Booking {
  id: string;
  traveler: {
    fullname: string;
  };
  trip: {
    departure_location: {
      name: string;
    };
    arrival_location: {
      name: string;
    };
    departure_time: string;
    arrival_time: string;
    price: number;
  };
}

interface PaymentStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message: string;
}

export default function Payment() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'idle',
    message: ''
  });
  const params = useParams();

  useEffect(() => {
    const fetchBooking = async () => {
      if (!params?.id) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/${params.id}/`, {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }

        const result = await response.json();
        setBooking(result.payload);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setPaymentStatus({
          status: 'failed',
          message: 'Unable to fetch booking details'
        });
      }
    };

    fetchBooking();
  }, [params?.id]);


  const pollPaymentStatus = async (bookingId: string, maxAttempts: number = 50, intervalMs: number = 12000): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}payments/status/${bookingId}`, {
            headers: {
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch payment status');
          }

          const data = await response.json();

          // Get the payment from the nested payload structure
          const payment = data.payload?.payload?.metaData?.payment ||
            data.payload?.metaData?.payment;

          // Check payment status conditions
          if (payment?.status === "FAILED") {
            setPaymentStatus({
              status: 'failed',
              message:
                payment?.callbackPayload?.data?.message ||
                'Payment failed'
            });
            resolve(false);
            return;
          }

          // Check for successful payment
          if (payment?.status === "PAID") {
            setPaymentStatus({
              status: 'success',
              message: 'Payment successful'
            });
            resolve(true);
            return;
          }

          // If not final status, continue polling
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkPaymentStatus, intervalMs);
          } else {
            // Timeout reached
            setPaymentStatus({
              status: 'failed',
              message: 'Payment processing timed out. Please try again.'
            });
            resolve(false);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);

          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkPaymentStatus, intervalMs);
          } else {
            // Timeout reached
            setPaymentStatus({
              status: 'failed',
              message: 'Unable to verify payment status. Please contact support.'
            });
            resolve(false);
          }
        }
      };

      // Start the initial polling
      checkPaymentStatus();
    });
  };

  const handlePayment = async () => {
    if (!booking || !phoneNumber) {
      setPaymentStatus({
        status: 'failed',
        message: 'Please enter a valid phone number'
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}payments/process/${booking.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          amount: booking.trip.price,
          phoneNumber: phoneNumber
        })
      });

      const data = await response.json();

      // Check for payment status in the new response structure
      if (data.payload?.payment) {
        // Check for failed payment conditions
        if (
          data.payload.payment.status === "FAILED" ||
          data.payload.payment.responseCode === "400" ||
          data.payload.itechpayResponse?.status === 400
        ) {
          setPaymentStatus({
            status: 'failed',
            message:
              data.payload.payment.callbackPayload?.data?.message ||
              data.payload.itechpayResponse?.data?.message ||
              'Payment failed'
          });
          return;
        }

        // If not failed, set pending status
        setPaymentStatus({
          status: 'pending',
          message: data.payload.itechpayResponse?.data?.message || 'Payment is being processed'
        });

        // Continue with polling payment status
        await pollPaymentStatus(booking.id);
      } else if (data.metaData &&  data.metaData.statusCode === "500" ) {
         
        // If not failed, set pending status
        setPaymentStatus({
          status: 'failed',
          // message: data.payload.itechpayResponse?.data?.message || 'Payment is being processed'
          message:data.metaData.message || 'Payment Failed'
        });

        // Continue with polling payment status
        await pollPaymentStatus(booking.id);
      } else {
        // Unexpected response structure
        throw new Error('Unexpected payment response');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to process payment'
      });
    }
  };
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateTimeStr);
        return 'Invalid date';
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };


  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
  
    let durationMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60;
  
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
  
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  // Render loading state if booking is not yet loaded
  if (!booking) return <div>Loading...</div>;

  // const duration = calculateDuration(booking.trip.departure_time, booking.trip.arrival_time);
  // const bookingDetails = JSON.stringify({
  //   Name: booking.traveler.fullname,
  //   Departure: booking.trip.departure_location.name,
  //   Departure_time: new Date(booking.trip.departure_time).toLocaleString(),
  //   Arrival: booking.trip.arrival_location.name,
  //   Arrival_time: new Date(booking.trip.arrival_time).toLocaleString(),
  // });

  const duration = calculateDuration(booking.trip.departure_time, booking.trip.arrival_time);
  const bookingDetails = JSON.stringify({
    Name: booking.traveler.fullname,
    Departure: booking.trip.departure_location.name,
    Departure_time: formatDateTime(booking.trip.departure_time),
    Arrival: booking.trip.arrival_location.name,
    Arrival_time: formatDateTime(booking.trip.arrival_time),
  });

  return (
    <div className="flex flex-col space-y-6 py-12 bg-white">
      <div className="container grid grid-cols-3 gap-6 justify-items-stretch">
        <div className="w-full flex flex-col space-y-4 col-span-2">
          {paymentStatus.message && (
            <Alert className={`${paymentStatus.status === 'success' ? 'bg-green-50 border-green-200' :
              paymentStatus.status === 'failed' ? 'bg-red-50 border-red-200' :
                paymentStatus.status === 'pending' ? 'bg-blue-50 border-blue-200' : ''
              }`}>
              {paymentStatus.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              )}
              <AlertDescription>{paymentStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Payment Method</p>
            </div>
            <div className="space-y-4 p-4">
              <Accordion type="single" collapsible defaultValue="mobile">
                <AccordionItem value="mobile">
                  <AccordionTrigger>
                    <h4 className="text-sm font-semibold">Mobile</h4>
                  </AccordionTrigger>
                  <AccordionContent className="p-1">
                    <Input
                      className="w-full"
                      placeholder="0780000000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={paymentStatus.status === 'pending'}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Billing Information</p>
            </div>
            <div className="flex space-x-8 p-4">
              <label className="pt-2 font-bold">Price</label>
              <Input
                placeholder="Price"
                type="number"
                value={booking.trip.price}
                readOnly
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={paymentStatus.status === 'pending' || paymentStatus.status === 'success'}
          >
            {paymentStatus.status === 'pending' ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Pay now'}
          </Button>
        </div>

        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Your trip summary</p>
            </div>
            <div className="space-y-4 p-4">
              <div
                style={{
                  height: "auto",
                  margin: "0 auto",
                  maxWidth: 128,
                  width: "100%",
                }}
              >
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={bookingDetails}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <hr />

              <div>
                <p>Name: <b>{booking.traveler.fullname}</b></p>
                <p>Departure: <b>{booking.trip.departure_location.name}</b></p>
                <p>Departure time: <b>{booking.trip.departure_time}</b></p>
                <p>Arrival: <b>{booking.trip.arrival_location.name}</b></p>
                <p>Arrival Time: <b>{booking.trip.arrival_time}</b></p>
                <p>Duration: <b>{duration}</b></p>
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}