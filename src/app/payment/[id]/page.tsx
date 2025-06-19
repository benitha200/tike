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
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { FailedCrossAnimation, SuccessTickAnimation } from "@/components/animations/StatusAnimation";

interface Booking {
  id: string;
  departure_time: string;
  arrival_time: string;
  trip_date: string;
  arrival_date: string;
  inStopName: string;
  outStopName: string;
  price: number;
  canceled: boolean;
  payment_status: string;
  routeName: string;
  traveler: {
    fullname: string;
  };
  trip: {
    id: string;
    
  };
}

interface PaymentStatus {
  status: 'idle' | 'pending' | 'success' | 'failed' | 'timeout';
  message: string;
}

export default function Payment() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'idle',
    message: ''
  });
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds = 1 minute
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailPopup, setShowFailPopup] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const params = useParams();

  // Load timer from localStorage or initialize
  useEffect(() => {
    if (!params?.id) return;

    const timerKey = params?.id ? `paymentTimer_${params.id}` : '';
    const savedTime = localStorage.getItem(timerKey);
    const savedEndTime = localStorage.getItem(`${timerKey}_endTime`);

    if (savedTime && savedEndTime) {
      const endTime = parseInt(savedEndTime);
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTime - now;

      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        // Timer expired
        setTimeLeft(0);
        localStorage.removeItem(timerKey);
        localStorage.removeItem(`${timerKey}_endTime`);
        if (paymentStatus.status === 'idle') {
          setPaymentStatus({
            status: 'timeout',
            message: 'Payment time has expired. Please start a new booking.'
          });
        }
      }
    } else {
      // Initialize new timer
      const endTime = Math.floor(Date.now() / 1000) + 60;
      localStorage.setItem(timerKey, '60');
      localStorage.setItem(`${timerKey}_endTime`, endTime.toString());
      setTimeLeft(60);
    }
  }, [params?.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!params?.id || timeLeft <= 0) return;

    const timerKey = params?.id ? `paymentTimer_${params.id}` : '';
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(timerKey, newTime.toString());
        
        if (newTime <= 0) {
          clearInterval(timer);
          localStorage.removeItem(timerKey);
          localStorage.removeItem(`${timerKey}_endTime`);
          if (paymentStatus.status === 'idle' || paymentStatus.status === 'pending') {
            setPaymentStatus({
              status: 'timeout',
              message: 'Payment time has expired. Please start a new booking.'
            });
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [params?.id, timeLeft, paymentStatus.status]);

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

  useEffect(() => {
    if (booking?.canceled || booking?.payment_status === "FAILED") {
      const timerKey = `paymentTimer_${params?.id}`;
      localStorage.removeItem(timerKey);
      localStorage.removeItem(`${timerKey}_endTime`);
    }
  }, [booking?.canceled, booking?.payment_status, params?.id]);


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
            // Clear the timer on success
            const timerKey = params?.id ? `paymentTimer_${params.id}` : '';
            localStorage.removeItem(timerKey);
            localStorage.removeItem(`${timerKey}_endTime`);
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
      setShowPhoneError(true);
      return;
    }

    if (timeLeft <= 0) {
      setPaymentStatus({
        status: 'timeout',
        message: 'Payment time has expired. Please start a new booking.'
      });
      return;
    }

    try {
      setPaymentStatus({
        status: 'pending',
        message: 'Processing payment...'
      });

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
        setPaymentStatus({
          status: 'failed',
          message: data.metaData.message || 'Payment Failed'
        });
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
        //console.error('Invalid date:', dateTimeStr);
        return 'Invalid date';
      }
      return date.toLocaleString();
    } catch (error) {
      //console.error('Error formatting date:', error);
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

  // Move this up so all hooks are before any return
  useEffect(() => {
    if (paymentStatus.status === 'success') {
      setShowSuccessPopup(true);
      setShowFailPopup(false);
      setShowTimeoutPopup(false);
      setShowPhoneError(false);
    } else if (paymentStatus.status === 'failed') {
      setShowFailPopup(true);
      setShowSuccessPopup(false);
      setShowTimeoutPopup(false);
      setShowPhoneError(false);
    } else if (paymentStatus.status === 'timeout') {
      setShowTimeoutPopup(true);
      setShowSuccessPopup(false);
      setShowFailPopup(false);
      setShowPhoneError(false);
    } else {
      setShowSuccessPopup(false);
      setShowFailPopup(false);
      setShowTimeoutPopup(false);
      setShowPhoneError(false);
    }
  }, [paymentStatus.status]);

  // Helper to render QR code and add to PDF
  const renderQRCodeToPDF = async (doc: jsPDF) => {
    const qrDiv = document.createElement("div");
    qrDiv.style.position = "absolute";
    qrDiv.style.left = "-9999px";
    document.body.appendChild(qrDiv);

    const root = createRoot(qrDiv);
    root.render(
      <React.Fragment>
        <QRCode
          size={160}
          value={bookingDetails}
          bgColor="#ffffff"
          fgColor="#1e293b"
          level="H"
        />
      </React.Fragment>
    );

    setTimeout(async () => {
      const canvas = await html2canvas(qrDiv, { backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 120, 35, 70, 70);
      root.unmount();
      document.body.removeChild(qrDiv);
      doc.save("ticket.pdf");
    }, 500);
  };

  const handleDownloadPDF = () => {
    if (!booking) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 58, 138); // blue-800
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Bus Ticket", 105, 20, { align: "center" });

    // Main Info Box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(10, 35, 90, 90, 5, 5, "F");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    let y = 45;
    const lineGap = 10;
    doc.text(`Name:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(booking.traveler.fullname, 45, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Route:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(booking.routeName, 45, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Departure:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(booking.inStopName, 45, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Departure Time:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(booking.departure_time, 60, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Arrival:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(booking.outStopName, 45, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Arrival Time:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text( booking.arrival_time, 60, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Duration:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(calculateDuration(booking.departure_time, booking.arrival_time), 45, y);
    doc.setFont("helvetica", "normal");
    y += lineGap;
    doc.text(`Price:`, 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${booking.price} RWF`, 45, y);

    // Decorative line
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1);
    doc.line(10, 130, 200, 130);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-400
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for choosing Tike. Have a safe journey!", 105, 140, { align: "center" });

    // Add QR code
    renderQRCodeToPDF(doc);
  };

  // Render loading state if booking is not yet loaded
  if (!booking) return <div>Loading...</div>;

  const duration = calculateDuration(booking.departure_time, booking.arrival_time);
  const bookingDetails = JSON.stringify({
    Name: booking.traveler.fullname,
    Departure: booking.inStopName,
    Departure_time: formatDateTime(booking.departure_time),
    Arrival: booking.outStopName,
    Arrival_time: formatDateTime(booking.arrival_time),
  });

  // Format time left as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col space-y-6 py-12 bg-white">
      {/* Payment Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
              onClick={() => setShowSuccessPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* Tick animation */}
            <SuccessTickAnimation />
            <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
              Thank you for your payment!
            </h2>
            <p className="text-lg text-center">Your payment was successful. We appreciate your business.</p>
            <Button
              className="mt-6 px-6 py-3 "
              onClick={handleDownloadPDF}
            >
              Save Ticket 
            </Button>
          </div>
        </div>
      )}
      {/* Payment Failure Popup */}
      {showFailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
              onClick={() => setShowFailPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <FailedCrossAnimation />
            <h2 className="text-3xl font-bold mb-6 text-center text-red-700">
              Sorry, payment failed
            </h2>
            <p className="text-lg text-center">{paymentStatus.message || 'There was a problem processing your payment. Please try again.'}</p>
          </div>
        </div>
      )}
      {/* Payment Timeout Popup */}
      {showTimeoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
              onClick={() => setShowTimeoutPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center text-orange-700">
              Payment Time Expired
            </h2>
            <p className="text-lg text-center">Payment time has expired. Please start a new booking.</p>
          </div>
        </div>
      )}
      {/* Phone Number Error Popup */}
      {showPhoneError && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
              onClick={() => setShowPhoneError(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center text-red-700">
              Please enter a valid phone number
            </h2>
            <p className="text-lg text-center">A valid phone number is required to process your payment.</p>
          </div>
        </div>
      )}

      {/* Timer display at the top */}
      {!booking?.canceled && booking?.payment_status !== "FAILED" && (
          <div className="container">
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Time remaining to complete payment: {formatTime(timeLeft)}
              </h2>
              {/* Custom progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    timeLeft > 30 ? "bg-green-500" : 
                    timeLeft > 10 ? "bg-yellow-500" : "bg-red-500"
                  }`} 
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

      <div className="container grid grid-cols-3 gap-6 justify-items-stretch">
        <div className="w-full flex flex-col space-y-4 col-span-2">
        {paymentStatus.message && (
          <Alert className={`${
            paymentStatus.status === 'success' ? 'bg-green-50 border-green-200' :
            paymentStatus.status === 'failed' ? 'bg-red-50 border-red-200' :
            paymentStatus.status === 'pending' ? 'bg-blue-50 border-blue-200' :
            paymentStatus.status === 'timeout' ? 'bg-orange-50 border-orange-200' : ''
          }`}>
            {paymentStatus.status === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            )}
            <AlertDescription>
              {booking?.canceled === true ? 'This booking has been canceled' :
              booking?.payment_status === "FAILED" ? 'This booking payment has failed' :
              paymentStatus.message}
            </AlertDescription>
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
                      disabled={paymentStatus.status === 'pending' || timeLeft <= 0}
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
                value={booking.price}
                readOnly
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={
              paymentStatus.status === 'pending' || 
              paymentStatus.status === 'success' ||
              timeLeft <= 0 ||
              booking?.canceled === true ||
              booking?.payment_status === "FAILED"
            }
          >
            {paymentStatus.status === 'pending' ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : timeLeft <= 0 ? 'Time Expired' : 
              booking?.canceled === true ? 'Booking Canceled' :
              booking?.payment_status === "FAILED" ? 'Payment Failed' : 
              'Pay now'}
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
                <p>Departure: <b>{booking.inStopName}</b></p>
                <p>Departure time: <b>{booking.departure_time}</b></p>
                <p>Arrival: <b>{booking.outStopName}</b></p>
                <p>Arrival Time: <b>{booking.arrival_time}</b></p>
                <p>Duration: <b>{duration}</b></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secret button to open success popup in development mode */}
      {process.env.NODE_ENV === "development" && (
        <button
          style={{ position: "fixed", bottom: 20, left: 20, zIndex: 10000, opacity: 0.2 }}
          onClick={() => setShowSuccessPopup(true)}
          aria-label="Open Success Popup (Dev Only)"
        >
          Dev Popup
        </button>
      )}
    </div>
  );
}

