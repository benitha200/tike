"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import QRCode from "react-qr-code";
import {IntouchApi} from "intouch-payments";

export default function Payment() {

  function generateRequestTransactionId() {
    const randomId = Math.floor(Math.random() * 900) + 100;
  
    return randomId;
  }
 
  const handlePayment = async () => {
    try {
      const response = await fetch('/api/requestpayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: "100",
          mobilephone: '250785283918',
          transactionId: generateRequestTransactionId(),
          username:"testa",
          requesttransactionid:generateRequestTransactionId(),
          password:"e5d96a680907dac57b36e0d5e74c528733d5a6f61a8c4bfaf23f04505d8572c4",
          timestamp:"20220314173905",
          callbackurl:"https://b4b3-105-179-8-146.ngrok-free.app/api/intouchcallback"
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-6 py-12 bg-white">
      <div className="container grid grid-cols-3 gap-6 justify-items-stretch">
        <div className="w-full flex flex-col space-y-4 col-span-2">
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Payment Method</p>
            </div>
            <div className="space-y-4 p-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="mobile">
                  <AccordionTrigger>
                    <h4 className="text-sm font-semibold">Mobile</h4>
                  </AccordionTrigger>
                  <AccordionContent className="p-1">
                    <Input className="w-full" placeholder="250700000000" />
                  </AccordionContent>
                </AccordionItem>
                {/* <AccordionItem value="card">
                  <AccordionTrigger>
                    <h4 className="text-sm font-semibold">Bank Card</h4>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-1 flex flex-col space-y-4">
                      <Input className="w-full" placeholder="Name on card" />
                      <Input className="w-full" placeholder="Card Number" />
                      <div className="flex space-x-4">
                        <Input className="w-1/2" placeholder="Expiry Date" />
                        <Input className="w-1/2" placeholder="CVV" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem> */}
              </Accordion>
            </div>
          </div>
          {/* <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Billing Information</p>
            </div>
            <div className="space-y-4 p-4">
              <Input placeholder="Billing Address" />
              <div className="flex space-x-4">
                <Input placeholder="City" />
                <Input placeholder="Country" />
              </div>
            </div>
          </div> */}
          {/* <Button className="w-full">
            <Link href={"/payment"}>Pay now</Link>
          </Button> */}
          <Button className="w-full" onClick={handlePayment}>
            Pay now
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
                  value={`This is a test!`}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <hr />
              <p>
                Name: <b>Kevin Kayisire</b>
              </p>
              <p>
                Departure: <b>Kigali</b> (August 16, 2023)
              </p>
              <p>
                Arrival: <b>Musanze</b> (August 16, 2023)
              </p>
              <p>
                Bus Operator: <b>Trinity</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
