
"use client"
import React from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type SelectSeatEventHandler = (seatId: string) => void;

interface SeatData {
  total: number;
  available: string[];
  booked: string[];
  paymentStatus: {
    [key: string]: string;
  };
}

interface Props {
  handleSelectSeat: SelectSeatEventHandler;
  seatData?: SeatData;
}

export default function SeatLayout(props: Props) {
  const { handleSelectSeat, seatData } = props;
  const [availableSeats, setAvailableSeats] = useState<Set<string>>(new Set());
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [pendingSeats, setPendingSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (seatData) {
      setAvailableSeats(new Set(seatData.available));
      setBookedSeats(new Set(seatData.booked));
      
      // Create set of pending seats
      const pending = new Set(
        seatData.booked.filter(
          seat => seatData.paymentStatus[seat] === "PENDING"
        )
      );
      setPendingSeats(pending);
    }
  }, [seatData]);

  const getSeatColor = (seatLabel: string) => {
    if (bookedSeats.has(seatLabel)) {
      if (pendingSeats.has(seatLabel)) {
        return "bg-yellow-400"; // Pending seats
      }
      return "bg-red-400"; // Booked and paid seats
    }
    return "bg-emerald-400"; // Available seats
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const columns = [1, 2, 3, 4];

  return (
    <div className="flex flex-col items-center space-y-4 border-slate-300 border-2 rounded-t-3xl rounded-b-2xl">
      <div className="bg-gray-300 p-4 rounded-t-3xl w-64 text-center font-bold">
        Driver
      </div>
      <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4 rounded-xl">
        {rows.map((row) => (
          <React.Fragment key={row}>
            {columns.map((col) => {
              const seatLabel = `${row}${col}`;
              const isBooked = bookedSeats.has(seatLabel);
              const isPending = pendingSeats.has(seatLabel);
              
              return (
                <Popover key={seatLabel}>
                  <PopoverTrigger>
                    <div
                      className={`w-12 h-12 flex items-center justify-center text-white font-bold rounded-md cursor-pointer ${getSeatColor(
                        seatLabel
                      )}`}
                    >
                      {seatLabel}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button
                      onClick={() => handleSelectSeat(seatLabel)}
                      disabled={isBooked}
                    >
                      {isBooked
                        ? `Seat ${isPending ? 'Pending' : 'Booked'}`
                        : `Book Seat: ${seatLabel}`}
                    </Button>
                  </PopoverContent>
                </Popover>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="flex gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-400 rounded-sm"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded-sm"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}