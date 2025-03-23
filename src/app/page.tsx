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
  const { t, i18n } = useTranslation("home");
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
    </>
  );
}
