"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { MdAirlineSeatReclineExtra, MdArrowForwardIos } from "react-icons/md";
import { PiBusDuotone, PiClockCountdownDuotone, PiPlugChargingDuotone, PiWifiHigh } from "react-icons/pi";

export default function Listings() {
  interface Trip {
    id: string;
    route: Route;
    departure_time: string;
  }
  
  interface Route {
    id: string;
    departure_location: Location;
    arrival_location: Location;
    total_price: number;
    total_duration: string;
    routeStops: RouteStops[];
  }

  interface RouteStops {
    id: string;
    stopName: string;
    stopOrder: number;
    duration: number;
    price: number;
  }

  interface Location {
    id: string;
    name: string;
  }
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDepartureLocation = searchParams?.get("departure") || "";
  const initialArrivalLocation = searchParams?.get("arrival") || "";
  const initialDate = searchParams?.get("date") || new Date().toISOString().split('T')[0];

  const [trips, setTrips] = useState<Trip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departureLocation, setDepartureLocation] = useState<string>(initialDepartureLocation);
  const [arrivalLocation, setArrivalLocation] = useState<string>(initialArrivalLocation);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [selectedStops, setSelectedStops] = useState<Record<string, { inStop: string | null; outStop: string | null }>>({});
  const { t } = useTranslation("listings");

  // Toggle stop selection for a trip
  const toggleTripExpansion = (tripId: string) => {
    setExpandedTripId(expandedTripId === tripId ? null : tripId);
  };

  // Handle stop selection
  const handleStopSelection = (tripId: string, stopType: 'inStop' | 'outStop', stopId: string) => {
    setSelectedStops(prev => {
      const currentSelection = prev[tripId] || { inStop: null, outStop: null };
      
      // If selecting inStop, ensure outStop comes after it
      if (stopType === 'inStop') {
        const trip = trips.find(t => t.id === tripId);
        const selectedStop = trip?.route.routeStops.find(s => s.id === stopId);
        const currentOutStop = trip?.route.routeStops.find(s => s.id === currentSelection.outStop);
        
        if (currentOutStop && selectedStop && currentOutStop.stopOrder <= selectedStop.stopOrder) {
          return {
            ...prev,
            [tripId]: { inStop: stopId, outStop: null }
          };
        }
      }
      
      return {
        ...prev,
        [tripId]: {
          ...currentSelection,
          [stopType]: currentSelection[stopType] === stopId ? null : stopId
        }
      };
    });
  };

  // Handle booking with selected stops
  const handleBooking = (tripId: string) => {
    const stops = selectedStops[tripId];
    if (!stops?.inStop || !stops?.outStop) return;
    
    router.push(
      `/booking/${tripId}?date=${new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]}` +
      `&inStop=${stops.inStop}&outStop=${stops.outStop}`
    );
  };

  // Check if a stop can be selected as outStop based on inStop
  const isOutStopValid = (tripId: string, stopId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;
    
    const currentInStop = selectedStops[tripId]?.inStop;
    if (!currentInStop) return true;
    
    const inStopData = trip.route.routeStops.find(s => s.id === currentInStop);
    const outStopData = trip.route.routeStops.find(s => s.id === stopId);
    
    return inStopData && outStopData && outStopData.stopOrder > inStopData.stopOrder;
  };

  // Calculate price for selected stops
  const calculatePrice = (tripId: string) => {
    const stops = selectedStops[tripId];
    if (!stops?.inStop || !stops?.outStop) return null;
    
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;
    
    const inStop = trip.route.routeStops.find(s => s.id === stops.inStop);
    const outStop = trip.route.routeStops.find(s => s.id === stops.outStop);
    
    if (!inStop || !outStop) return null;
    
    return Math.abs(outStop.price - inStop.price);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const headers = new Headers();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}locations/`, {
          method: "GET",
          headers,
        });
        const data = await response.json();
        setLocations(data.payload || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!departureLocation || !arrivalLocation) return;
      
      try {
        setLoadingTrips(true);
        const headers = new Headers();
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}trips/?date=${formattedDate}`, 
          { method: "GET", headers }
        );
        const data = await response.json();
        const tripsData: Trip[] = data.payload || [];
        const filteredTrips = tripsData.filter(
          trip => trip.route.departure_location.id === departureLocation && 
                 trip.route.arrival_location.id === arrivalLocation
        );
        setTrips(filteredTrips);
        setExpandedTripId(null);
        setSelectedStops({});
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [departureLocation, arrivalLocation, selectedDate]);

  const formatTimeForDisplay = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loadingLocations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PiBusDuotone className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-4 text-gray-500">{t("Loading locations...")}</p>
        </div>
      </div>
    );
  }

  function showTripArrivalTime(departure_time: string, total_duration: string): string {
    const totalMinutes = parseInt(total_duration, 10);
    const departure = new Date(`1970-01-01T${departure_time}`);
    departure.setMinutes(departure.getMinutes() + totalMinutes);
    const arrivalTimeStr = `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}`;
    return arrivalTimeStr;
  }

  function showStopArrivalTime(trip : Trip,stop: RouteStops): string {
  const departure = new Date(`1970-01-01T${trip.departure_time}`);
  const stopOrder = stop.stopOrder;

  let totalDuration = 0;
  for (let i = 0; i < stopOrder; i++) {
    const previousStop = trip.route.routeStops.find(s => s.stopOrder === i);
    if (previousStop) {
    totalDuration +=  previousStop.duration;
    }
  }

  departure.setMinutes(departure.getMinutes() + totalDuration+stop.duration);
  const departureTimeStr = `${String(departure.getHours()).padStart(2, '0')}` + ":" + `${String(departure.getMinutes()).padStart(2, '0')}`;
  return departureTimeStr;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <select
                id="departureLocation"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
              >
                <option value="">{t("origin")}</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-5">
              <select
                id="arrivalLocation"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700"
                value={arrivalLocation}
                onChange={(e) => setArrivalLocation(e.target.value)}
              >
                <option value="">{t("destination")}</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <DatePicker
                date={selectedDate}
                onDateChange={date => date && setSelectedDate(date)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loadingTrips ? (
          <div className="max-w-3xl mx-auto flex justify-center py-12">
            <div className="text-center">
              <PiBusDuotone className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
              <p className="mt-4 text-gray-500">{t("Loading trips...")}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {trips.length > 0 ? (
              trips.map(trip => (
                <div 
                  key={trip.id} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden"
                >
                    <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleTripExpansion(trip.id)}
                    >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-4">
                      <Image
                        src="/buses/trinity.jpeg"
                        className="rounded-lg object-cover"
                        width={80}
                        height={40}
                        alt="Bus company logo"
                      />
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-sm md:text-base">{trip.route.departure_location.name}</span>
                        <span className="text-xl md:text-2xl font-semibold">
                        {formatTimeForDisplay(trip.departure_time)}
                        </span>
                      </div>
                      </div>

                        <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center text-gray-400 space-x-2">
                          <PiClockCountdownDuotone className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="text-xs md:text-sm  sm:inline">
                          {trip.route.total_duration} {t('mins')}
                          </span>
                        </div>
                        <div className="w-full flex justify-center items-center my-2">
                          <div className="h-px w-full bg-gray-200 flex-1" />
                          <PiBusDuotone className="mx-2 text-blue-500" />
                          <div className="h-px w-full bg-gray-200 flex-1" />
                        </div>
                        <div className="flex space-x-2 md:space-x-4 text-gray-400">
                          <PiWifiHigh className="w-4 h-4 md:w-5 md:h-5 hidden sm:inline" />
                          <PiPlugChargingDuotone className="w-4 h-4 md:w-5 md:h-5 hidden sm:inline" />
                          <MdAirlineSeatReclineExtra className="w-4 h-4 md:w-5 md:h-5 hidden sm:inline" />
                        </div>
                        </div>

                      <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <div className="text-gray-600 text-sm md:text-base">{trip.route.arrival_location.name}</div>
                        <span className="text-xl md:text-2xl font-semibold">
                        {showTripArrivalTime(trip.departure_time, trip.route.total_duration)}
                        </span>
                      </div>
                      
                      <Button 
                        className="mt-4 w-full md:w-auto text-sm md:text-base"
                        onClick={(e) => {
                        e.stopPropagation();
                        if (expandedTripId === trip.id) {
                          handleBooking(trip.id);
                        } else {
                          toggleTripExpansion(trip.id);
                        }
                        }}
                      >
                        {expandedTripId === trip.id ? 
                        t("BOOK NOW") : 
                        t("SELECT STOPS")}
                        <MdArrowForwardIos className="ml-1 md:ml-2" />
                      </Button>
                      </div>
                    </div>
                    </div>

                    {expandedTripId === trip.id && (
                      <div className="border-t border-gray-200 p-6">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Boarding Points Section */}
                          <div>
                            <h3 className="font-medium mb-3">Select Boarding Point</h3>
                            <div className="relative">
                              <div className="flex space-x-4 pb-4 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                                {trip.route.routeStops.map(stop => (
                                  <div
                                    key={`in-${stop.id}`}
                                    className={`flex-shrink-0 w-64 p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedStops[trip.id]?.inStop === stop.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStopSelection(trip.id, 'inStop', stop.id);
                                    }}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{stop.stopName}</p>
                                        <p className="text-sm text-gray-500">
                                          Stop #{stop.stopOrder} • Departure: {showStopArrivalTime(trip, stop)}
                                        </p>
                                      </div>
                                      {selectedStops[trip.id]?.inStop === stop.id && (
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Alighting Points Section */}
                          <div>
                            <h3 className="font-medium mb-3">Select Alighting Point</h3>
                            <div className="relative">
                              <div className="flex space-x-4 pb-4 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                                {trip.route.routeStops.map(stop => {
                                  const isValid = isOutStopValid(trip.id, stop.id);
                                  return (
                                    <div
                                      key={`out-${stop.id}`}
                                      className={`flex-shrink-0 w-64 p-3 border rounded-lg transition-colors ${
                                        !isValid
                                          ? "border-gray-100 bg-gray-50 cursor-not-allowed"
                                          : selectedStops[trip.id]?.outStop === stop.id
                                            ? "border-blue-500 bg-blue-50 cursor-pointer"
                                            : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                                      }`}
                                      onClick={(e) => {
                                        if (!isValid) return;
                                        e.stopPropagation();
                                        handleStopSelection(trip.id, 'outStop', stop.id);
                                      }}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className={`font-medium ${!isValid ? "text-gray-400" : ""}`}>
                                            {stop.stopName}
                                          </p>
                                          <p className={`text-sm ${!isValid ? "text-gray-300" : "text-gray-500"}`}>
                                            Stop #{stop.stopOrder} • Arrival: {showStopArrivalTime(trip, stop)}
                                          </p>
                                        </div>
                                        {selectedStops[trip.id]?.outStop === stop.id && (
                                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {calculatePrice(trip.id) && (
                          <div className="mt-4 flex justify-between items-center">
                            <div className="font-medium">
                              Selected Price: {calculatePrice(trip.id)} RWF
                            </div>
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBooking(trip.id);
                              }}
                              disabled={!selectedStops[trip.id]?.inStop || !selectedStops[trip.id]?.outStop}
                            >
                              Continue to Booking
                              <MdArrowForwardIos className="ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))
            ) : (
              !loadingLocations && (
                <div className="text-center py-12">
                  <PiBusDuotone className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No Trips Found")}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {t("Try adjusting your search criteria")}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}