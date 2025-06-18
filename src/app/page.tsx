"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

interface Location {
  id: string;
  name: string;
  arrival_location: string;
  country: string;
}

interface HomeProps {
  lang: 'en' | 'fr';
}

export default function Home({ lang = 'en' }: HomeProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation(["home", "common"]);
  const [isClient, setIsClient] = useState(false);  // Check for client-side rendering
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedLocations, setGroupedLocations] = useState(() => groupByCountry(locations));
  const [filteredDepartureLocations, setFilteredDepartureLocations] = useState<Location[]>([]);
  const [filteredArrivalLocations, setFilteredArrivalLocations] = useState<Location[]>([]);
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [selectedArrivalId, setSelectedArrivalId] = useState('');
  const [showDepartureLocations, setShowDepartureLocations] = useState(false);
  const [showArrivalLocations, setShowArrivalLocations] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);

  useEffect(() => {
    setIsClient(true);  // Set the flag when client is ready
    getLocations();
  }, []);

  useEffect(() => {
    if (!i18n.isInitialized) return;  // Wait until i18n is initialized
  }, [i18n]);

  function groupByCountry(locations: Location[]) {
    return locations.reduce((acc, location) => {
      if (!acc[location.country]) {
        acc[location.country] = [];
      }
      acc[location.country].push(location);
      return acc;
    }, {} as { [key: string]: Location[] });
  }

  function getLocations() {
    const requestOptions = {
      method: "GET",
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}locations/`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const groupedData = groupByCountry(result.payload);
        setGroupedLocations(groupedData);
        setLocations(result.payload);
      })
      .catch((error) => console.error(error));
  }

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e?.target?.value?.toLowerCase();
    setDepartureLocation(e.target.value);

    if (searchValue.length > 0) {
      const filteredLocations = Object.values(groupedLocations).flatMap((country) =>
        country.filter((location) =>
          location?.name?.toLowerCase().includes(searchValue)
        )
      );
      setFilteredDepartureLocations(filteredLocations);
      setShowDepartureLocations(true);
    } else {
      setFilteredDepartureLocations([]);
      setShowDepartureLocations(false);
    }
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e?.target?.value?.toLowerCase();
    setArrivalLocation(e.target.value);

    if (searchValue.length > 0) {
      const filteredLocations = Object.values(groupedLocations).flatMap((country) =>
        country.filter((location) =>
          location?.name?.toLowerCase().includes(searchValue)
        )
      );
      setFilteredArrivalLocations(filteredLocations);
      setShowArrivalLocations(true);
    } else {
      setFilteredArrivalLocations([]);
      setShowArrivalLocations(false);
    }
  };

  const handleSearch = () => {
    if (selectedDepartureId && selectedArrivalId) {
      const searchParams = new URLSearchParams({
        departure: selectedDepartureId,
        arrival: selectedArrivalId,
        date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
      });
      router.push(`/listings?${searchParams.toString()}`);
    } else {
      toast.info(t('locationError'));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Avoid rendering the component before translations are ready and client is mounted
  if (!isClient || !i18n.isInitialized) {
    return null;
  }

  return (
    <>
      <div className="section_home py-6 sm:py-12 px-4 sm:px-12 w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-300 opacity-70 z-0"></div>
        <Image
          src={"/illustrations/Bus-driver-amico.svg"}
          layout="fill"
          objectFit="contain"
          alt={t('backgroundAlt')}
          className="absolute inset-0 z-0 opacity-20"
        />
        <div className="relative z-10 flex flex-col space-y-6 max-w-7xl mx-auto h-96">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex flex-col space-y-4 w-full sm:w-1/2 mb-6 sm:mb-0">
              <h1 className="text-3xl sm:text-5xl font-black leading-tight sm:leading-normal text-center sm:text-left">
                {t('title')}
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                {t('subtitle')}
              </h2>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-3/6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-4 w-full">
                <div className="w-full relative">
                  <input
                    id="departure"
                    className="text-sm rounded-lg block h-16 w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                    value={departureLocation}
                    placeholder={t('fromPlaceholder')}
                    onChange={handleDepartureChange}
                  />
                  {showDepartureLocations && filteredDepartureLocations.length > 0 && (
                    <div className="absolute z-50 bg-white shadow-lg rounded-lg w-full max-h-60 overflow-y-auto">
                      {Object.entries(groupByCountry(filteredDepartureLocations)).map(
                        ([country, locations]) => (
                          <Fragment key={country}>
                            <div className="text-lg font-bold px-4 py-2 bg-gray-100">{country}</div>
                            {locations.map((location) => (
                              <div
                                key={location.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setDepartureLocation(location.name);
                                  setSelectedDepartureId(location.id);
                                  setShowDepartureLocations(false);
                                }}
                              >
                                {location.name}
                              </div>
                            ))}
                          </Fragment>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div className="w-full relative">
                  <input
                    id="arrival"
                    className="text-sm rounded-lg block h-16 w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder={t('toPlaceholder')}
                    value={arrivalLocation}
                    onChange={handleArrivalChange}
                  />
                  {showArrivalLocations && filteredArrivalLocations.length > 0 && (
                    <div className="absolute z-50 bg-white shadow-lg rounded-lg w-full max-h-60 overflow-y-auto">
                      {Object.entries(groupByCountry(filteredArrivalLocations)).map(
                        ([country, locations]) => (
                          <Fragment key={country}>
                            <div className="text-lg font-bold px-4 py-2 bg-gray-100">{country}</div>
                            {locations.map((location) => (
                              <div
                                key={location.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setArrivalLocation(location.name);
                                  setSelectedArrivalId(location.id);
                                  setShowArrivalLocations(false);
                                }}
                              >
                                {location.name}
                              </div>
                            ))}
                          </Fragment>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-2/6">
              <DatePicker
                className="h-16"
                date={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            <div className="w-full sm:w-1/6">
              <Button className="w-full h-16" onClick={handleSearch}>
                <div className="flex items-center justify-center space-x-2">
                  <IoSearch /> <span>{t('search')}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      {/* Hidden */}
<div className="flex flex-col sm:flex-row justify-evenly border rounded-lg px-4 sm:px-9 py-4 bg-white space-y-4 sm:space-y-0 hidden">
  {[
    {
      src: "/illustrations/options.svg",
      title: t('features.priorities.title'),
      description: t('features.priorities.description')
    },
    {
      src: "/illustrations/coverage.svg",
      title: t('features.coverage.title'),
      description: t('features.coverage.description'),
    },
    {
      src: "/illustrations/support.svg",
      title: t('features.support.title'),
      description: t('features.support.description'),
    }
  ].map((item, index) => (
    <div key={index} className="flex justify-center items-center space-x-3">
      <Image
        src={item.src}
        width={50}
        height={50}
        alt=""
      />
      <div className="opacity-90">
        <h1 className="text-base font-semibold">{item.title}</h1>
        <p className="text-sm">{item.description}</p>
      </div>
    </div>
  ))}
</div>

<div className="section_top_routes py-8 sm:py-12 bg-slate-100">
  <div className="container mx-auto px-4">
    <div className="text-center mb-8">
      <h1 className="font-bold text-2xl sm:text-3xl">{t('topRoutes.title')}</h1>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[
        { route: ["Kigali", "Kampala"], image: "/img/kampala.jpg" },
        { route: ["Kigali", "Nairobi"], image: "/img/nairobi.jpg" },
        { route: ["Kigali", "Bujumbura"], image: "/img/bujumbura.jpg" },
        { route: ["Kampala", "Kigali"], image: "/img/kigali.jpg" },
        { route: ["Nairobi", "Kigali"], image: "/img/bujumbura.jpg" },
        { route: ["Bujumbura", "Kigali"], image: "/img/kigali2.jpg" },
      ].map((item, index) => (
        <div
          key={index}
          className="relative transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
          onClick={() => {
            // Set departure and arrival locations based on the route
            const departure = item.route[0];
            const arrival = item.route[1];

            // Get the IDs for the selected departure and arrival
            const departureLocation = locations.find(
              (loc) => loc.name.toLowerCase() === departure.toLowerCase()
            );
            const arrivalLocation = locations.find(
              (loc) => loc.name.toLowerCase() === arrival.toLowerCase()
            );

            // Check if both locations exist
            if (departureLocation && arrivalLocation) {
              setDepartureLocation(departure);
              setArrivalLocation(arrival);
              setSelectedDepartureId(departureLocation.id);
              setSelectedArrivalId(arrivalLocation.id);

              // Redirect to the listings page
              const searchParams = new URLSearchParams({
                departure: departureLocation.id,
                arrival: arrivalLocation.id,
                date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
              });
              router.push(`/listings?${searchParams.toString()}`);
            } else {
              toast.error(t('locationError'));
            }
          }}
        >
          <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
            <p>
              {item.route[0]} {t('to')} {item.route[1]}
            </p>
          </div>
          <Image
            src={item.image}
            className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
            width={400}
            height={300}
            alt={`${item.route[0]} ${t('to')} ${item.route[1]}`}
          />
        </div>
      ))}
    </div>
  </div>
</div>


{/* Hidden */}
<div className="section_explainer py-6 sm:py-12 bg-white container mx-auto px-4 flex flex-col space-y-12 sm:space-y-24 hidden">
  <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-100 py-6 sm:py-12 px-6 sm:px-12 md:px-20 lg:px-40 rounded-lg space-y-6 sm:space-y-0 sm:space-x-6">
    <div className="w-full sm:w-1/2">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4 sm:pb-6">{t('whyJoin.title')}</h1>
      <p className="font-bold pb-3">{t('whyJoin.subtitle')}</p>
      <ul className="list-disc pl-5">
        <li>{t('whyJoin.benefits.0')}</li>
        <li>{t('whyJoin.benefits.1')}</li>
        <li>{t('whyJoin.benefits.2')}</li>
      </ul>
    </div>
    <Image
      src={"/illustrations/traveling.svg"}
      className="w-full sm:w-1/2 h-40 sm:h-60 object-contain"
      width={400}
      height={400}
      alt="Traveling illustration"
    />
  </div>

  <div className="flex flex-col sm:flex-row justify-between space-y-6 sm:space-y-0 sm:space-x-6">
    <Image
      src={"/illustrations/questions.svg"}
      className="w-full sm:w-1/2 h-48 sm:h-72 object-contain"
      width={400}
      height={400}
      alt="Questions illustration"
    />
    <div className="w-full sm:w-1/2">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4">{t('bookOnline.title')}</h1>
      <p className="pb-6 text-sm sm:text-base">{t('bookOnline.description')}</p>
      <h2 className="text-xl sm:text-2xl font-semibold pb-4">{t('faq.title')}</h2>
      <div className="flex flex-col space-y-2">
        <Collapsible className="border-b py-2">
          <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
            {t('faq.questions.0.question')}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm sm:text-base">
            {t('faq.questions.0.answer')}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-b py-2">
          <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
            {t('faq.questions.1.question')}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm sm:text-base">
            {t('faq.questions.1.answer')}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-b py-2">
          <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
            {t('faq.questions.2.question')}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm sm:text-base">
            {t('faq.questions.2.answer')}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  </div>
</div>
  
      {/* Floating Contact Us Button (now fullscreen modal like header) */}
      <div>
        <Button
          className="fixed bottom-8 right-8 z-50 bg-green-600 text-white shadow-lg px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setShowContactOptions((prev) => !prev)}
        >
          <span>{t('contact', { ns: 'common' })}</span>
        </Button>
        {showContactOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col items-center relative animate-fade-in">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black focus:outline-none"
                onClick={() => setShowContactOptions(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                {t('contact', { ns: 'common' })}
              </h2>
              <div className="flex flex-col gap-6 w-full">
                <a
                  href="https://wa.me/250788123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 py-4 px-6 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 text-lg font-semibold transition"
                >
                  <FaWhatsapp className="text-2xl" />
                  {t('contactOptions.whatsapp', { ns: 'common' })}
                </a>
                <a
                  href="mailto:info@tike.com"
                  className="flex items-center justify-center gap-3 py-4 px-6 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-lg font-semibold transition"
                >
                  <FaEnvelope className="text-2xl" />
                  {t('contactOptions.email', { ns: 'common' })}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
