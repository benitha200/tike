"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Traveler {
  fullname: string;
  nationality: string;
  gender: string;
  phone_number: string;
  email: string;
}

interface Ticket {
  id: string;
  price: number;
  is_one_way: boolean;
  trip_date: string;
  canceled: boolean;
  payment_status: string;
  payment_reference: string | null;
  seat_number: string;
  routeName: string;
  inStopName: string;
  outStopName: string;
  departure_time: string;
  arrival_time: string;
  arrival_date: string;
  traveler: Traveler;
}

export default function CheckTicketPage() {
  const [phone, setPhone] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTickets([]);
    setSearched(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/check-ticket/${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("Ticket not found");
      const data = await res.json();
      setTickets(data.payload || []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || "Error fetching ticket info");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Check Your Ticket</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Checking..." : "Check Ticket"}
          </Button>
        </form>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {searched && !error && tickets.length === 0 && (
          <Alert className="mb-6">
            <AlertTitle>No Tickets Found</AlertTitle>
            <AlertDescription>No tickets found for this phone number.</AlertDescription>
          </Alert>
        )}
        {tickets.length > 0 && (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-6 bg-gray-100">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <div className="font-semibold text-lg mb-1">{ticket.routeName}</div>
                    <div className="text-sm text-gray-600">{ticket.inStopName} → {ticket.outStopName}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 md:mt-0">
                    {ticket.trip_date ? new Date(ticket.trip_date).toLocaleDateString() : ticket.arrival_date}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1"><span className="font-medium">Seat:</span> {ticket.seat_number}</div>
                    <div className="mb-1"><span className="font-medium">Departure:</span> {ticket.departure_time} ({ticket.inStopName})</div>
                    <div className="mb-1"><span className="font-medium">Arrival:</span> {ticket.arrival_time} ({ticket.outStopName})</div>
                    <div className="mb-1"><span className="font-medium">Price:</span> {ticket.price} RWF</div>
                    <div className="mb-1"><span className="font-medium">Status:</span> <span className={ticket.canceled ? "text-red-500" : ticket.payment_status === "PAID" ? "text-green-600" : "text-yellow-600"}>{ticket.canceled ? "Canceled" : ticket.payment_status}</span></div>
                  </div>
                  <div>
                    <div className="mb-1"><span className="font-medium">Passenger:</span> {ticket.traveler.fullname}</div>
                    <div className="mb-1"><span className="font-medium">Phone:</span> {ticket.traveler.phone_number}</div>
                    <div className="mb-1"><span className="font-medium">Email:</span> {ticket.traveler.email}</div>
                    <div className="mb-1"><span className="font-medium">Nationality:</span> {ticket.traveler.nationality}</div>
                    <div className="mb-1"><span className="font-medium">Gender:</span> {ticket.traveler.gender}</div>
                  </div>
                </div>
                {ticket.payment_reference && (
                  <div className="mt-2 text-xs text-gray-500">Payment Ref: {ticket.payment_reference}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
