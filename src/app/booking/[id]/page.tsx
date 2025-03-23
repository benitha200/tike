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
import { useTranslation } from "react-i18next";

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

export default function Page({ params }: { params: { id: string } }) {
  const lang = 'en';
  const router = useRouter();
  const { t, i18n } = useTranslation("booking");
  const [isClient, setIsClient] = useState(false); 
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
        const [firstName, ...lastNameParts] = traveler.fullname.split(' ');
        setFirstname(firstName);
        setLastname(lastNameParts.join(' '));
        setGender(traveler.gender);
        setResidence(traveler.nationality);
        setEmail(traveler.email);
      } else {
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
          trip_date: selectedDate,
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
                    <p className="text-sm font-medium">{t('searchPrompt')}</p>
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
                      {isSearching ? `${t('searching')}...` : t('search')}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t('passengerInfo')}</p>
                  </div>
                  <div className="flex flex-col md:flex-row p-6 space-y-4 md:space-y-0 md:space-x-4">
                    <Input
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      className="w-full md:w-2/6"
                      placeholder={t('firstName')}
                      required
                    />
                    <Input
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="w-full md:w-2/6"
                      placeholder={t('lastName')}
                      required
                    />
                    <div className="w-full md:w-2/6">
                      <Select value={gender} onValueChange={(value) => setGender(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={t('gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="male">{t('genderOptions.male')}</SelectItem>
                            <SelectItem value="female">{t('genderOptions.female')}</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t('contactInfo')}</p>
                  </div>
                  <div className="space-y-2 p-6">
                    <Input
                      placeholder={t('country')}
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      required
                    />
                    <Input
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t('ticketOverview')}</p>
                  </div>
                  <div className="space-y-2 p-6 text-xs text-gray-500">
                    <p className="font-semibold">{t('refunds.title')}</p>
                    <ul>
                      <li>{t('refunds.noRefunds')}</li>
                      <li>
                        {t('refunds.exchange', { time: '1' })}</li>
                    </ul>
                    <p className="font-semibold">{t('boarding.title')}</p>
                    <ul>
                      <li>{t('boarding.id')}</li>
                      <li>{t('boarding.ticket')}</li>
                    </ul>
                    <p className="font-semibold">{t('luggage.title')}</p>
                    <ul>
                      <li>{t('luggage.carryOn')}</li>
                      <li>{t('luggage.carryOnWeight')}</li>
                      <li>{t('luggage.checked')}</li>
                      <li>{t('luggage.checkedWeight')}</li>
                      <li>{t('luggage.checkedSize')}</li>
                    </ul>
                  </div>
                </div>

                <Button className="w-full" type="submit">
                  {t('continuePayment')}
                </Button>
              </div>

              <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col w-full border rounded-lg shadow-md">
                  <div className="border-b px-6 py-3">
                    <p className="text-sm font-medium">{t('tripSummary.title')}</p>
                  </div>
                  <div className="space-y-4 p-6">
                    <p>
                      {t('departure')}: <b>{trip?.departure_location.name}</b>
                    </p>
                    <p>
                      {t('departureTime')}: <b>{trip?.departure_time}</b>
                    </p>
                    <p>
                      {t('arrival')}: <b>{trip?.arrival_location.name}</b>
                    </p>
                    <p>
                      {t('arrivalTime')}: <b>{trip?.arrival_time}</b>
                    </p>
                    <p>
                      {t('price')}: <b>{trip?.price} RWF</b>
                    </p>
                    <p>
                      {t('duration')}: <b>{duration}</b>
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
