// "use client";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { DatePicker } from "@/components/ui/datepicker";
// import Image from "next/image";
// import Link from "next/link";
// import { useTranslation } from "react-i18next";
// import { MdAirlineSeatReclineExtra, MdArrowForwardIos } from "react-icons/md";
// import { PiBusDuotone, PiClockCountdownDuotone, PiPlugChargingDuotone, PiWifiHigh } from "react-icons/pi";

// export default function Listings() {
//   interface Trip {
//     id: string;
//     departure_location: {
//       id: string;
//       name: string;
//       country: string;
//     };
//     arrival_location: {
//       id: string;
//       name: string;
//       country: string;
//     };
//     departure_time: string;
//     arrival_time: string;
//     price: string;
//   }

//   interface Location {
//     id: string;
//     name: string;
//   }

//   const searchParams = useSearchParams();
//   const initialDepartureLocation = searchParams?.get("departure") || "";
//   const initialArrivalLocation = searchParams?.get("arrival") || "";
//   const initialDate = searchParams?.get("date") || new Date().toISOString().split('T')[0];

//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [departureLocation, setDepartureLocation] = useState<string>(initialDepartureLocation);
//   const [arrivalLocation, setArrivalLocation] = useState<string>(initialArrivalLocation);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
//   const { t } = useTranslation();

//   const calculateDuration = (departureTime: string, arrivalTime: string) => {
//     const [depHours, depMinutes] = departureTime.split(':').map(Number);
//     const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

//     let durationMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
//     if (durationMinutes < 0) durationMinutes += 24 * 60;

//     const hours = Math.floor(durationMinutes / 60);
//     const minutes = durationMinutes % 60;

//     if (hours === 0) {
//       return `${minutes} ${t('minutes')}`;
//     } else if (minutes === 0) {
//       return `${hours} ${t('hour', { count: hours })}`;
//     } else {
//       return `${hours} ${t('hour', { count: hours })} ${minutes} ${t('minutes')}`;
//     }
//   };

//   useEffect(() => {
//     const fetchLocations = () => {
//       const headers = new Headers();
//       // headers.append("Authorization", `Bearer YOUR_AUTH_TOKEN_HERE`);

//       fetch(`${process.env.NEXT_PUBLIC_API_URL}locations/`, {
//         method: "GET",
//         headers,
//       })
//         .then(response => response.json())
//         .then(data => setLocations(data.payload))
//         .catch(error => console.error("Error fetching locations:", error));
//     };

//     const fetchTrips = () => {
//       const headers = new Headers();
//       headers.append("Authorization", `Bearer YOUR_AUTH_TOKEN_HERE`);

//       const formattedDate = selectedDate.toISOString().split('T')[0];

//       fetch(`${process.env.NEXT_PUBLIC_API_URL}trips/?date=${formattedDate}`, {
//         method: "GET",
//         headers,
//       })
//         .then(response => response.json())
//         .then(data => {
//           const tripsData: Trip[] = data.payload;
//           const filteredTrips = tripsData.filter(
//             (trip: Trip) => trip.departure_location.id === departureLocation && trip.arrival_location.id === arrivalLocation
//           );
//           console.log(data);
//           console.log(filteredTrips);
//           setTrips(filteredTrips);
//         })
//         .catch(error => console.error("Error fetching trips:", error));
//     };

//     fetchLocations();

//     if (departureLocation && arrivalLocation) {
//       fetchTrips();
//     }
//   }, [departureLocation, arrivalLocation, selectedDate]);

//   const handleDateChange = (date: Date | undefined) => {
//     if (date) {
//       setSelectedDate(date);
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-6 py-12 bg-white">
//       <div className="border-b pb-12">
//         <div className="container flex flex-col md:flex-row md:space-x-1">
//           <div className="w-full md:w-3/6 h-16 flex flex-col md:flex-row md:space-x-1 mt-3">
//             <div className="mb-6 w-full">
//               <select
//                 id="departureLocation"
//                 className="text-sm h-16 rounded-lg block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 value={departureLocation}
//                 onChange={(e) => setDepartureLocation(e.target.value)}
//               >
//                 <option value="">{t("origin")}</option>
//                 {locations.map(location => (
//                   <option key={location.id} value={location.id}>
//                     {location.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="mb-6 w-full">
//               <select
//                 id="arrivalLocation"
//                 className="text-sm rounded-lg block h-16 w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 value={arrivalLocation}
//                 onChange={(e) => setArrivalLocation(e.target.value)}
//               >
//                 <option value="">{t("destination")}</option>
//                 {locations.map(location => (
//                   <option key={location.id} value={location.id}>
//                     {location.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className="w-full md:w-2/6 mt-3 flex">
//             <div className="w-full">
//               <DatePicker
//                 className="w-full h-16"
//                 date={selectedDate}
//                 onDateChange={(date) => {
//                   if (date) {
//                     setSelectedDate(date);
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container w-full flex flex-col items-center space-y-4">
//         {trips.length > 0 ? (
//           trips.map(trip => {
//             const duration = calculateDuration(trip.departure_time, trip.arrival_time);

//             const formatTimeForDisplay = (timeStr: string) => {
//               const [hours, minutes] = timeStr.split(':');
//               const date = new Date();
//               date.setHours(parseInt(hours, 10));
//               date.setMinutes(parseInt(minutes, 10));
//               return date.toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//               });
//             };

//             return (
//               <div key={trip.id} className="bg-white p-3 rounded-lg shadow-lg drop-shadow-lg w-full md:w-1/2 flex flex-col space-y-10">
//                 <div className="flex flex-col md:flex-row justify-between items-start">
//                   <Image
//                     src={"/buses/trinity.jpeg"}
//                     className="h-6 w-32 rounded-lg"
//                     width={200}
//                     height={100}
//                     alt=""
//                   />
//                   <div className="flex flex-col md:flex-row justify-between space-x-6">
//                     <div>
//                       <p className="text-2xl font-semibold">
//                         {formatTimeForDisplay(trip.departure_time)}
//                       </p>
//                       <p className="font-light">{trip.departure_location.name} {t("station")}</p>
//                       <p className="text-sm font-medium">{trip.departure_location.country}</p>
//                     </div>
//                     <svg className="fill-inherit" width="36" viewBox="0 0 36 12" xmlns="http://www.w3.org/2000/svg">
//                       <path
//                         fillRule="evenodd"
//                         clipRule="evenodd"
//                         d="M30.3431 0L35.7071 5.29396C36.0976 5.68448 36.0976 6.31765 35.7071 6.70817L30.3431 12L29 10.6579L32.66 7.00107H18V5.00107H32.66L29 1.34421L30.3431 0ZM2 5H0V7H2V5ZM4 5H8V7H4V5ZM16 5H10V7H16V5Z"
//                         fill="currentColor"
//                       ></path>
//                     </svg>
//                     <div>
//                       <p className="text-2xl font-semibold">
//                         {formatTimeForDisplay(trip.arrival_time)}
//                       </p>
//                       <p className="font-light">{trip.arrival_location.name} {t("station")}</p>
//                       <p className="text-sm font-medium">{trip.arrival_location.country}</p>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="flex items-center space-x-2">
//                       <PiClockCountdownDuotone /> <span>{duration}</span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex flex-col md:flex-row justify-between items-center">
//                   <div className="space-y-2">
//                     <p className="flex items-center space-x-2">
//                       <PiBusDuotone /> <span>{t("bus")}</span>
//                     </p>
//                     <p className="flex items-center space-x-2">
//                       <PiWifiHigh />
//                       <PiPlugChargingDuotone />
//                       <MdAirlineSeatReclineExtra />
//                     </p>
//                   </div>
//                   <Button>
//                     <Link
//                       // href={`/booking/${trip.id}?date=${selectedDate.toISOString().split('T')[0]}`}
//                       href={`/booking/${trip.id}?date=${new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]}`}
//                       className="flex items-center space-x-2"
//                     >
//                       <span>{trip.price} RWF</span>
//                       <MdArrowForwardIos />
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <p>{t("No Trips Found")}</p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
    departure_location: {
      id: string;
      name: string;
      country: string;
    };
    arrival_location: {
      id: string;
      name: string;
      country: string;
    };
    departure_time: string;
    arrival_time: string;
    price: string;
  }

  interface Location {
    id: string;
    name: string;
  }

  const searchParams = useSearchParams();
  const initialDepartureLocation = searchParams?.get("departure") || "";
  const initialArrivalLocation = searchParams?.get("arrival") || "";
  const initialDate = searchParams?.get("date") || new Date().toISOString().split('T')[0];

  const [trips, setTrips] = useState<Trip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departureLocation, setDepartureLocation] = useState<string>(initialDepartureLocation);
  const [arrivalLocation, setArrivalLocation] = useState<string>(initialArrivalLocation);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
  const { t } = useTranslation();

  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

    let durationMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes} ${t('minutes')}`;
    } else if (minutes === 0) {
      return `${hours} ${t('hour', { count: hours })}`;
    } else {
      return `${hours} ${t('hour', { count: hours })} ${minutes} ${t('minutes')}`;
    }
  };

  useEffect(() => {
    const fetchLocations = () => {
      const headers = new Headers();
      fetch(`${process.env.NEXT_PUBLIC_API_URL}locations/`, {
        method: "GET",
        headers,
      })
        .then(response => response.json())
        .then(data => setLocations(data.payload))
        .catch(error => console.error("Error fetching locations:", error));
    };

    const fetchTrips = () => {
      const headers = new Headers();
      const formattedDate = selectedDate.toISOString().split('T')[0];

      fetch(`${process.env.NEXT_PUBLIC_API_URL}trips/?date=${formattedDate}`, {
        method: "GET",
        headers,
      })
        .then(response => response.json())
        .then(data => {
          const tripsData: Trip[] = data.payload;
          const filteredTrips = tripsData.filter(
            (trip: Trip) => trip.departure_location.id === departureLocation && trip.arrival_location.id === arrivalLocation
          );
          setTrips(filteredTrips);
        })
        .catch(error => console.error("Error fetching trips:", error));
    };

    fetchLocations();

    if (departureLocation && arrivalLocation) {
      fetchTrips();
    }
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
        <div className="max-w-3xl mx-auto space-y-6">
          {trips.length > 0 ? (
            trips.map(trip => (
              <div 
                key={trip.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              >
                <div className="p-6">
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
                        <span className="text-2xl font-semibold">
                          {formatTimeForDisplay(trip.departure_time)}
                        </span>
                        <span className="text-gray-600">{trip.departure_location.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center text-gray-400 space-x-2">
                        <PiClockCountdownDuotone className="w-5 h-5" />
                        <span className="text-sm">
                          {calculateDuration(trip.departure_time, trip.arrival_time)}
                        </span>
                      </div>
                      <div className="w-full flex justify-center items-center my-2">
                        <div className="h-px w-full bg-gray-200 flex-1" />
                        <PiBusDuotone className="mx-2 text-blue-500" />
                        <div className="h-px w-full bg-gray-200 flex-1" />
                      </div>
                      <div className="flex space-x-4 text-gray-400">
                        <PiWifiHigh className="w-5 h-5" />
                        <PiPlugChargingDuotone className="w-5 h-5" />
                        <MdAirlineSeatReclineExtra className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <span className="text-2xl font-semibold">
                          {formatTimeForDisplay(trip.arrival_time)}
                        </span>
                        <div className="text-gray-600">{trip.arrival_location.name}</div>
                      </div>
                      
                      <Button className="mt-4 w-full md:w-auto">
                        <Link
                          href={`/booking/${trip.id}?date=${new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]}`}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>{trip.price} RWF</span>
                          <MdArrowForwardIos />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <PiBusDuotone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No Trips Found")}</h3>
              <p className="mt-2 text-sm text-gray-500">
                {t("Try adjusting your search criteria")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}