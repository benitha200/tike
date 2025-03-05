// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Cookies from "js-cookie";
// import { v4 as uuidv4 } from 'uuid';

// interface Trip {
//   id: string;
//   departure_location: {
//     name: string;
//   };
//   arrival_location: {
//     name: string;
//   };
//   departure_time: string;
//   arrival_time: string;
//   price: number;
// }

// export default function Booking() {
//   const params = useParams();
//   const router = useRouter();
  
//   const [firstname, setFirstname] = useState("");
//   const [lastname, setLastname] = useState("");
//   const [gender, setGender] = useState<string | undefined>(undefined);
//   const [residence, setResidence] = useState<string | undefined>(undefined);
//   const [email, setEmail] = useState<string | undefined>(undefined);
//   const [phonenumber, setPhonenumber] = useState<string | undefined>(undefined);
//   const [trip, setTrip] = useState<Trip | null>(null);

//   useEffect(() => {
//     const fetchTrip = async () => {
//       const tripId = params?.id as string;
      
//       if (tripId) {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}trips/${tripId}`, {
//             headers: {
//               'Authorization': `Bearer ${Cookies.get('token')}`
//             }
//           });
          
//           if (!response.ok) {
//             throw new Error('Failed to fetch trip');
//           }
          
//           const data = await response.json();
//           setTrip(data.payload);
//         } catch (error) {
//           console.error('Error fetching trip:', error);
//         }
//       }
//     };

//     fetchTrip();
//   }, [params?.id]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!trip) return;

//     try {
//       // 1. Create traveler
//       const travelerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}travelers`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${Cookies.get('token')}`
//         },
//         body: JSON.stringify({
//           idempotency_key: uuidv4(), 
//           fullname: `${firstname} ${lastname}`,
//           gender,
//           nationality: residence,
//           email,
//           phone_number: phonenumber,
//           dob: "2000-02-01"
//         }),
//       });

//       if (!travelerResponse.ok) {
//         throw new Error('Failed to create traveler');
//       }

//       const travelerData = await travelerResponse.json();
//       const travelerId = travelerData.payload.id;

//       // 2. Create booking
//       const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${Cookies.get('token')}`
//         },
//         body: JSON.stringify({
//           idempotency_key: uuidv4(),
//           is_one_way: true,
//           trip: trip.id,
//           traveler: travelerId,
//           price:trip.price,
//         }),
//       });

//       if (!bookingResponse.ok) {
//         throw new Error('Failed to create booking');
//       }

//       const bookingData = await bookingResponse.json();
      
//       // Redirect to payment page with the new booking ID
//       router.push(`/payment/${bookingData.payload.id}`);
//     } catch (error) {
//       console.error('Error submitting form:', error);
//     }
//   };

//   if (!trip) return <div>Loading...</div>;
//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="flex flex-col space-y-6 py-12 bg-white">
//         <div className="container grid grid-cols-3 gap-6 justify-items-stretch">
//           <div className="w-full flex flex-col space-y-4 col-span-2">
//             <div className="flex flex-col w-full border rounded-lg shadow-md">
//               <div className="border-b px-6 py-3">
//                 <p className="text-sm font-medium">Passenger Info</p>
//               </div>
//               <div className="flex p-6 space-x-4">
//                 <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="w-2/6" placeholder="First name" required />
//                 <Input value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-2/6" placeholder="Last name" required />
//                 <div className="w-2/6">
//                   <Select value={gender} onValueChange={(value) => setGender(value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Gender" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectGroup>
//                         <SelectItem value="male">Male</SelectItem>
//                         <SelectItem value="female">Female</SelectItem>
//                       </SelectGroup>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col w-full border rounded-lg shadow-md">
//               <div className="border-b px-6 py-3">
//                 <p className="text-sm font-medium">Your contact information</p>
//               </div>
//               <div className="space-y-2 p-6">
//                 <Input placeholder="Country" value={residence} onChange={(e) => setResidence(e.target.value)} required />
//                 <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
//                 <Input placeholder="Phone number" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} required />
//               </div>
//             </div>
//             <div className="flex flex-col w-full border rounded-lg shadow-md">
//               <div className="border-b px-6 py-3">
//                 <p className="text-sm font-medium">Ticket overview</p>
//               </div>
//               <div className="space-y-2 p-6 text-xs text-gray-500">
//                 <p className="font-semibold">REFUNDS AND EXCHANGES</p>
//                 <ul>
//                   <li>No refunds</li>
//                   <li>
//                     Exchange date or time up to{" "}
//                     <span className="font-semibold">1hr</span> before departure
//                   </li>
//                 </ul>
//                 <p className="font-semibold">BOARDING REQUIREMENTS</p>
//                 <ul>
//                   <li>National ID Card / Passport required</li>
//                   <li>Ticket (printed or digital)</li>
//                 </ul>
//                 <p className="font-semibold">LUGGAGE</p>
//                 <ul>
//                   <li>1 carry-on bag</li>
//                   <li>Max 10kg per carry-on bag</li>
//                   <li>1 checked bag - free 1 extra - fees apply</li>
//                   <li>Max 23kg per checked bag</li>
//                   <li>Max 50cm x 30cm x 78cm per checked bag</li>
//                 </ul>
//               </div>
//             </div>
//             <Button className="w-full" type="submit">
//               Continue to Payment
//             </Button>
//           </div>
//           <div className="w-full flex flex-col space-y-4">
//             <div className="flex flex-col w-full border rounded-lg shadow-md">
//               <div className="border-b px-6 py-3">
//                 <p className="text-sm font-medium">Your trip summary</p>
//               </div>
//               <div className="space-y-4 p-6">
//                 <p>
//                   Departure: <b>{trip?.departure_location.name}</b>
//                 </p>
//                 <p>
//                   Departure time: <b>{new Date(trip?.departure_time).toLocaleString()}</b>
//                 </p>
//                 <p>
//                   Arrival: <b>{trip?.arrival_location.name}</b>
//                 </p>
//                 <p>
//                   Arrival Time: <b>{new Date(trip?.arrival_time).toLocaleString()}</b>
//                 </p>
//                 <p>
//                   Price: <b>{trip?.price} RWF</b>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }

"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid';

interface Trip {
  id: string;
  departure_location: {
    name: string;
  };
  arrival_location: {
    name: string;
  };
  departure_time: string;
  arrival_time: string;
  price: number;
}

export default function Booking() {
  const params = useParams();
  const router = useRouter();
  
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [residence, setResidence] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [phonenumber, setPhonenumber] = useState<string | undefined>(undefined);
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const tripId = params?.id as string;
      
      if (tripId) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}trips/${tripId}`, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch trip');
          }
          
          const data = await response.json();
          setTrip(data.payload);
        } catch (error) {
          console.error('Error fetching trip:', error);
        }
      }
    };

    fetchTrip();
  }, [params?.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trip) return;

    try {
      // 1. Create traveler
      const travelerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}travelers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({
          idempotency_key: uuidv4(), 
          fullname: `${firstname} ${lastname}`,
          gender,
          nationality: residence,
          email,
          phone_number: phonenumber,
          dob: "2000-02-01"
        }),
      });

      if (!travelerResponse.ok) {
        throw new Error('Failed to create traveler');
      }

      const travelerData = await travelerResponse.json();
      const travelerId = travelerData.payload.id;

      // 2. Create booking
      const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({
          idempotency_key: uuidv4(),
          is_one_way: true,
          trip: trip.id,
          traveler: travelerId,
          price:trip.price,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      
      // Redirect to payment page with the new booking ID
      router.push(`/payment/${bookingData.payload.id}`);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!trip) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 py-12 bg-white">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-stretch">
        <div className="w-full flex flex-col space-y-4 col-span-2">
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-6 py-3">
              <p className="text-sm font-medium">Passenger Info</p>
            </div>
            <div className="flex flex-col md:flex-row p-6 space-y-4 md:space-y-0 md:space-x-4">
              <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="w-full md:w-2/6" placeholder="First name" required />
              <Input value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-full md:w-2/6" placeholder="Last name" required />
              <div className="w-full md:w-2/6">
                <Select value={gender} onValueChange={(value) => setGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-6 py-3">
              <p className="text-sm font-medium">Your contact information</p>
            </div>
            <div className="space-y-2 p-6">
              <Input placeholder="Country" value={residence} onChange={(e) => setResidence(e.target.value)} required />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
              <Input placeholder="Phone number" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-6 py-3">
              <p className="text-sm font-medium">Ticket overview</p>
            </div>
            <div className="space-y-2 p-6 text-xs text-gray-500">
              <p className="font-semibold">REFUNDS AND EXCHANGES</p>
              <ul>
                <li>No refunds</li>
                <li>
                  Exchange date or time up to{" "}
                  <span className="font-semibold">1hr</span> before departure
                </li>
              </ul>
              <p className="font-semibold">BOARDING REQUIREMENTS</p>
              <ul>
                <li>National ID Card / Passport required</li>
                <li>Ticket (printed or digital)</li>
              </ul>
              <p className="font-semibold">LUGGAGE</p>
              <ul>
                <li>1 carry-on bag</li>
                <li>Max 10kg per carry-on bag</li>
                <li>1 checked bag - free 1 extra - fees apply</li>
                <li>Max 23kg per checked bag</li>
                <li>Max 50cm x 30cm x 78cm per checked bag</li>
              </ul>
            </div>
          </div>
          <Button className="w-full" type="submit">
            Continue to Payment
          </Button>
        </div>
        <div className="w-full flex flex-col space-y-4">
          <div className="flex flex-col w-full border rounded-lg shadow-md">
            <div className="border-b px-6 py-3">
              <p className="text-sm font-medium">Your trip summary</p>
            </div>
            <div className="space-y-4 p-6">
              <p>
                Departure: <b>{trip?.departure_location.name}</b>
              </p>
              <p>
                Departure time: <b>{new Date(trip?.departure_time).toLocaleString()}</b>
              </p>
              <p>
                Arrival: <b>{trip?.arrival_location.name}</b>
              </p>
              <p>
                Arrival Time: <b>{new Date(trip?.arrival_time).toLocaleString()}</b>
              </p>
              <p>
                Price: <b>{trip?.price} RWF</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}