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
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import SeatSelection from "@/components/elements/seat-selection";

interface Trip {
  id: string;
  departure_location: {
    name: string;
    country: string;
  };
  arrival_location: {
    name: string;
    country: string;
  };
  departure_time: string;
  arrival_time: string;
  price: number;
}

interface Traveler {
  id: string;
  fullname: string;
  nationality: string;
  gender: string;
  phone_number: string;
  email: string;
}



// Translation dictionary
const translations = {
  en: {
    searchPrompt: "Not your first time? Enter phone number",
    search: "Search",
    searching: "Searching...",
    passengerInfo: "Passenger Info",
    firstName: "First name",
    lastName: "Last name",
    gender: "Gender",
    genderOptions: {
      male: "Male",
      female: "Female"
    },
    contactInfo: "Contact Information",
    country: "Country",
    email: "Email",
    ticketOverview: "Ticket Overview",
    refunds: {
      title: "REFUNDS AND EXCHANGES",
      noRefunds: "No refunds",
      exchange: "Exchange date or time up to 1hr before departure"
    },
    boarding: {
      title: "BOARDING REQUIREMENTS",
      id: "National ID Card / Passport required",
      ticket: "Ticket (printed or digital)"
    },
    luggage: {
      title: "LUGGAGE",
      carryOn: "1 carry-on bag",
      carryOnWeight: "Max 10kg per carry-on bag",
      checked: "1 checked bag - free 1 extra - fees apply",
      checkedWeight: "Max 23kg per checked bag",
      checkedSize: "Max 50cm x 30cm x 78cm per checked bag"
    },
    tripSummary: {
      title: "Your Trip Summary",
      departure: "Departure",
      departureTime: "Departure time",
      arrival: "Arrival",
      arrivalTime: "Arrival Time",
      price: "Price",
      duration: "Duration"
    },
    continuePayment: "Continue to Payment"
  },
  fr: {
    searchPrompt: "Pas votre première fois ? Entrez votre numéro de téléphone",
    search: "Rechercher",
    searching: "Recherche en cours...",
    passengerInfo: "Informations sur le passager",
    firstName: "Prénom",
    lastName: "Nom",
    gender: "Genre",
    genderOptions: {
      male: "Homme",
      female: "Femme"
    },
    contactInfo: "Informations de contact",
    country: "Pays",
    email: "Email",
    ticketOverview: "Aperçu du billet",
    refunds: {
      title: "REMBOURSEMENTS ET ÉCHANGES",
      noRefunds: "Pas de remboursement",
      exchange: "Échange de date ou d'heure jusqu'à 1h avant le départ"
    },
    boarding: {
      title: "CONDITIONS D'EMBARQUEMENT",
      id: "Carte d'identité nationale / Passeport requis",
      ticket: "Billet (imprimé ou numérique)"
    },
    luggage: {
      title: "BAGAGES",
      carryOn: "1 bagage à main",
      carryOnWeight: "Max 10kg par bagage à main",
      checked: "1 bagage en soute - 1 supplémentaire payant",
      checkedWeight: "Max 23kg par bagage en soute",
      checkedSize: "Max 50cm x 30cm x 78cm par bagage en soute"
    },
    tripSummary: {
      title: "Résumé de votre voyage",
      departure: "Départ",
      departureTime: "Heure de départ",
      arrival: "Arrivée",
      arrivalTime: "Heure d'arrivée",
      price: "Prix",
      duration: "Durée"
    },
    continuePayment: "Continuer vers le paiement"
  }
};

export default function Page({ params }: { params: { id: string } }) {
  const lang = 'en';
  const router = useRouter();
  const t = translations[lang as keyof typeof translations];
  const searchParams = useSearchParams();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [residence, setResidence] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [phonenumber, setPhonenumber] = useState<string | undefined>(undefined);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [existingTraveler, setExistingTraveler] = useState<Traveler | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const tripId = params?.id;
  const dateParam = searchParams?.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : new Date();



  const handleSeatSelect = (seat: string) => {
    setSelectedSeat(seat);
  };


  useEffect(() => {
    const fetchTrip = async () => {
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
  }, [tripId]);

  const searchTraveler = async () => {
    if (!phonenumber) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}travelers`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch travelers');
      }

      const data = await response.json();
      const traveler = data.payload.find((t: Traveler) => t.phone_number === phonenumber);

      if (traveler) {
        setExistingTraveler(traveler);
        // Split fullname into first and last name
        const [firstName, ...lastNameParts] = traveler.fullname.split(' ');
        setFirstname(firstName);
        setLastname(lastNameParts.join(' '));
        setGender(traveler.gender);
        setResidence(traveler.nationality);
        setEmail(traveler.email);
      } else {
        // Clear fields if no traveler found
        setExistingTraveler(null);
        setFirstname('');
        setLastname('');
        setGender(undefined);
        setResidence(undefined);
        setEmail(undefined);
      }
    } catch (error) {
      console.error('Error searching traveler:', error);
    } finally {
      setIsSearching(false);
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trip) return;

    try {
      let travelerId;

      if (!existingTraveler) {
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
        travelerId = travelerData.payload.id;
      } else {
        travelerId = existingTraveler.id;
      }

      // Extract date from departure_time
      // const tripDate = new Date(trip.departure_time).toISOString().split('T')[0];

      // Create booking - Now including trip_date
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
          price: trip.price,
          seat_number: selectedSeat,
          trip_date: selectedDate, // Added trip_date
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      router.push(`/payment/${bookingData.payload.id}`);
    } catch (error) {
      console.error('Error submitting form:', error);
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

  if (!trip) return <div>Loading...</div>;
  const duration = calculateDuration(trip.departure_time, trip.arrival_time);


  return (
    <>
      {!selectedSeat ? (
        <SeatSelection
          onSeatSelect={handleSeatSelect}
          trip={trip}
          selectedDate={selectedDate.toISOString().split('T')[0]}
        />
      ) : (

        <div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6 py-12 bg-white">
            <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-stretch">
              <div className="w-full flex flex-col space-y-4 col-span-2">
                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t.searchPrompt}</p>
                  </div>
                  <div className="flex flex-row p-6 space-x-4">
                    <Input
                      value={phonenumber}
                      onChange={(e) => setPhonenumber(e.target.value)}
                      className="w-full"
                      placeholder="Enter phone number"
                      required
                    />
                    <Button
                      type="button"
                      onClick={searchTraveler}
                      disabled={isSearching}
                    >
                      {isSearching ? `${t.searching}...` : t.search}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">Passenger Info</p>
                  </div>
                  <div className="flex flex-col md:flex-row p-6 space-y-4 md:space-y-0 md:space-x-4">
                    <Input
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      className="w-full md:w-2/6"
                      placeholder={t.firstName}
                      required
                    />
                    <Input
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="w-full md:w-2/6"
                      placeholder={t.lastName}
                      required
                    />
                    <div className="w-full md:w-2/6">
                      <Select value={gender} onValueChange={(value) => setGender(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={t.gender} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="male">{t.genderOptions.male}</SelectItem>
                            <SelectItem value="female">{t.genderOptions.female}</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t.contactInfo}</p>
                  </div>
                  <div className="space-y-2 p-6">
                    <Input
                      placeholder={t.country}
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      required
                    />
                    <Input
                      placeholder={t.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">

                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t.ticketOverview}</p>
                  </div>
                  <div className="space-y-2 p-6 text-xs text-gray-500">
                    <p className="font-semibold">{t.refunds.title}</p>
                    <ul>
                      <li>{t.refunds.noRefunds}</li>
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
                    <p className="text-sm font-medium">Your Trip Summary</p>
                  </div>
                  <div className="space-y-4 p-6">
                    <p>
                      Departure: <b>{trip?.departure_location.name}</b>
                    </p>
                    <p>
                      Departure time: <b>{trip?.departure_time}</b>
                    </p>
                    <p>
                      Arrival: <b>{trip?.arrival_location.name}</b>
                    </p>
                    <p>
                      Arrival Time: <b>{trip?.arrival_time}</b>
                    </p>
                    <p>
                      Price: <b>{trip?.price} RWF</b>
                    </p>
                    <p>
                      Duration: <b>{duration}</b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form >
        </div>
      )}
    </>
  );
}
