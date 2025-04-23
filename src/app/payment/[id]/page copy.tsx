"use client";
import React, { useState, useEffect, useRef } from 'react';
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
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";

interface Booking {
  id: string;
  departure_time: string;
  arrival_time: string;
  trip_date: string;
  arrival_date: string;
  inStopName: string;
  outStopName: string;
  price: number;
  traveler: {
    fullname: string;
  };
  trip: {
    id: string;
    route: {
      id: string;
      name: string;
    }
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

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCountdownPopup, setShowCountdownPopup] = useState<boolean>(false);

  const params = useParams();
  const previousBookingIdRef = useRef<string | null>(null);

  // Check localStorage for stored countdown and initialize it
  useEffect(() => {
    const storedCountdown = localStorage.getItem('paymentCountdown');
    if (storedCountdown) {
      setCountdown(Number(storedCountdown));
      setShowCountdownPopup(true);
    } else {
      setCountdown(60); // Default if no stored countdown
      setShowCountdownPopup(true);
    }
  }, []);

  // Reset the countdown and fetch the booking if the booking ID changes
  useEffect(() => {
    if (params?.id && params.id !== previousBookingIdRef.current) {
      // Reset countdown if new booking ID is detected
      setCountdown(60);
      setPaymentStatus({ status: 'idle', message: '' });
      setShowCountdownPopup(true);
      previousBookingIdRef.current = params.id; // Store the new booking ID

      fetchBooking(); // Fetch the new booking
    }
  }, [params?.id]);

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

  const pollPaymentStatus = async (bookingId: string, maxAttempts = 50, intervalMs = 12000): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;

      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}payments/status/${bookingId}`, {
            headers: {
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
            }
          });

          if (!response.ok) throw new Error('Failed to fetch payment status');

          const data = await response.json();
          const payment = data.payload?.payload?.metaData?.payment || data.payload?.metaData?.payment;

          if (payment?.status === "FAILED") {
            setPaymentStatus((prevStatus) => {
              if (prevStatus.status !== 'failed') {
                return { status: 'failed', message: payment?.callbackPayload?.data?.message || 'Payment failed' };
              }
              return prevStatus;
            });
            resolve(false);
            return;
          }

          if (payment?.status === "PAID") {
            setPaymentStatus((prevStatus) => {
              if (prevStatus.status !== 'success') {
                return { status: 'success', message: 'Payment successful' };
              }
              return prevStatus;
            });
            resolve(true);
            return;
          }

          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkPaymentStatus, intervalMs);
          } else {
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
            setPaymentStatus({
              status: 'failed',
              message: 'Unable to verify payment status. Please contact support.'
            });
            resolve(false);
          }
        }
      };

      checkPaymentStatus();
    });
  };

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prevCountdown) => {
        const newCountdown = prevCountdown! - 1;
        if (newCountdown <= 0) {
          setPaymentStatus({
            status: 'failed',
            message: 'Payment time expired. Please try again.',
          });
          setShowCountdownPopup(false);
          localStorage.removeItem('paymentCountdown');
          return 0;
        }
        localStorage.setItem('paymentCountdown', String(newCountdown));
        return newCountdown;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== null && countdown <= 0 && paymentStatus.status !== 'failed') {
      setPaymentStatus({
        status: 'failed',
        message: 'Payment time expired. Please try again.',
      });
      setShowCountdownPopup(false);
    }
  }, [countdown, paymentStatus.status]);

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
          amount: booking.price,
          phoneNumber: phoneNumber
        })
      });

      const data = await response.json();

      if (data.payload?.payment) {
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

        setPaymentStatus({
          status: 'pending',
          message: data.payload.itechpayResponse?.data?.message || 'Payment is being processed'
        });

        await pollPaymentStatus(booking.id);
      } else if (data.metaData && data.metaData.statusCode === "500") {
        setPaymentStatus({
          status: 'failed',
          message: data.metaData.message || 'Payment Failed'
        });

        await pollPaymentStatus(booking.id);
      } else {
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
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    } catch {
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
    return hours && minutes ? `${hours}h ${minutes}min` : hours ? `${hours}h` : `${minutes}min`;
  };

  if (!booking) return <div>Loading...</div>;

  const duration = calculateDuration(booking.departure_time, booking.arrival_time);
  const bookingDetails = JSON.stringify({
    Name: booking.traveler.fullname,
    Departure: booking.inStopName,
    Departure_time: formatDateTime(booking.departure_time),
    Arrival: booking.outStopName,
    Arrival_time: formatDateTime(booking.arrival_time),
  });

  return (
    <div className="flex flex-col space-y-6 py-12 bg-white relative">
      {showCountdownPopup && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow-md flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Please complete your payment within {countdown}s</span>
        </div>
      )}

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
              <Input placeholder="Price" type="number" value={booking.price} readOnly />
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
              <p className="text-sm font-medium">Trip Details</p>
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
                <p><strong>Route:</strong> {booking.trip?.route?.name || 'Not available'}</p>
                <p><strong>Traveler:</strong> {booking.traveler.fullname}</p>
                <p><strong>Departure:</strong> {booking.inStopName}</p>
                <p><strong>Departure Time:</strong> {formatDateTime(booking.departure_time)}</p>
                <p><strong>Arrival:</strong> {booking.outStopName}</p>
                <p><strong>Arrival Time:</strong> {formatDateTime(booking.arrival_time)}</p>
                <p><strong>Duration:</strong> {duration}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}