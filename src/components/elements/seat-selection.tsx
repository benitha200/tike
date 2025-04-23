import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Trip {
  id: string | number;
}

interface SeatStatus {
  available: string[];
  booked: string[];
  total: number;
  paymentStatus: {
    [key: string]: string;
  };
}

interface SeatSelectionProps {
  onSeatSelect?: (seat: string) => void;
  trip: Trip;
  selectedDate: string;
  inStopId: string;
  outStopId: string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onSeatSelect, trip, selectedDate, inStopId,outStopId }) => {
  const { t } = useTranslation("booking");
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [seatStatus, setSeatStatus] = useState<SeatStatus>({
    available: [],
    booked: [],
    total: 0,
    paymentStatus: {}
  });

  useEffect(() => {
    const fetchSeatStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}bookings/seats/${trip.id}?date=${selectedDate}&instopid=${inStopId}&outstopid=${outStopId}`,
          {
            headers: { 
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const seatData = data.payload.payload;
          setSeatStatus({
            available: seatData.available || [],
            booked: seatData.booked || [],
            total: seatData.total || 0,
            paymentStatus: seatData.paymentStatus || {}
          });
        }
      } catch (error) {
        console.error('Error fetching seat status:', error);
        setSeatStatus({
          available: [],
          booked: [],
          total: 0,
          paymentStatus: {}
        });
      }
    };

    fetchSeatStatus();
    const interval = setInterval(fetchSeatStatus, 10000);

    return () => clearInterval(interval);
  }, [trip.id, selectedDate, inStopId, outStopId]);

  const getSeatStatus = (seatLabel: string): 'paid' | 'pending' | 'failed' | 'selected' | 'available' => {
    const paymentState = seatStatus.paymentStatus[seatLabel];
    
    if (paymentState === 'PENDING') return 'pending';
    if (paymentState === 'FAILED') return 'failed';
    if (seatStatus.booked.includes(seatLabel)) return 'paid';
    if (selectedSeat === seatLabel) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: ReturnType<typeof getSeatStatus>): string => {
    switch (status) {
      case 'paid':
        return 'bg-red-500 text-white border-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'failed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'selected':
        return 'bg-blue-100 text-blue-700 border-blue-700';
      default:
        return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
    }
  };

  const handleSeatClick = (seatLabel: string): void => {
    const status = getSeatStatus(seatLabel);
    if (status === 'paid' || status === 'pending') return;
    setSelectedSeat(seatLabel);
    if (onSeatSelect) onSeatSelect(seatLabel);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-black text-white px-6 py-4">
        <h2 className="text-xl font-bold">{t('selectYourSeat')}</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 bg-gray-100 p-4 mx-4 my-6 rounded-lg [&>*:nth-child(4n-1)]:mr-6">
        {[...Array(10)].map((_, row) => 
          [...Array(4)].map((_, col) => {
            const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
            const status = getSeatStatus(seatLabel);

            return (
              <button
                key={seatLabel}
                onClick={() => handleSeatClick(seatLabel)}
                onMouseEnter={() => setHoveredSeat(seatLabel)}
                onMouseLeave={() => setHoveredSeat(null)}
                disabled={status === 'paid' || status === 'pending'}
                className={`
                  relative w-full h-12 rounded-lg border border-gray-200
                  flex items-center justify-center font-semibold
                  ${getSeatColor(status)}
                  ${hoveredSeat === seatLabel ? 'scale-105 shadow-md z-10' : ''}
                  transition-all duration-200
                `}
              >
                {seatLabel}
              </button>
            );
          })
        )}
      </div>

      <div className="flex justify-center gap-6 p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
          <span className="text-sm text-gray-600">{t('available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
          <span className="text-sm text-gray-600">{t('pendingPayment')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded"></div>
          <span className="text-sm text-gray-600">{t('booked')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">{t('failedPayment')}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;