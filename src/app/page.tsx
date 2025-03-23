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


interface Location {
  id: string;
  name: string;
  arrival_location: string;
  country: string;
}

interface HomeProps {
  lang: 'en' | 'fr';
}


// Translation dictionary
const translations = {
  en: {
    title: "Find easy bus tickets for your next trips",
    subtitle: "Easily book your next trip with Tike",
    fromPlaceholder: "From",
    toPlaceholder: "To",
    search: "Search",
    locationError: "Please select departure and arrival locations",
    features: {
      priorities: {
        title: "Your trip, your ",
        description: "On a budget? Tight schedule? Book tickets that fit your needs."
      },
      coverage: {
        title: "Regional coverage",
        description: "Save time by comparing all your bus travel options in one place."
      },
      support: {
        title: "24/7 support",
        description: "Our world class team of experts is always here to help."
      }
    },
    topRoutes: {
      title: "Top travelled bus routes"
    },
    whyJoin: {
      title: "Why join Tike?",
      subtitle: "Faster booking and checkout",
      benefits: [
        "Manage and cancel your trips with ease",
        "Save your payment method and billing information",
        "Security information for your trips!"
      ]
    },
    bookOnline: {
      title: "Book your bus tickets online",
      description: "Every day, thousands of travelers like you take buses to travel between cities. With Tike, you can easily compare buses and find cheap bus tickets for your next bus trip. Whether you want to travel by bus to Kampala, Nairobi, Bujumbura, or anywhere else in the region, you can check the bus schedules, ticket prices and the services on the bus. With Tike, you can easily book your cheap bus tickets online from the best bus company. With Tike, you can easily check the bus schedules, ticket prices, cheap bus trips and what services are offered on the bus (WiFi, extra legroom, generous luggage allowance)."
    },
    faq: {
      title: "Frequently asked questions",
      questions: [
        {
          question: "Question 1",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        },
        {
          question: "Question 2",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        },
        {
          question: "Question 3",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        }
      ]
    }
  },
  fr: {
    title: "Trouvez facilement des billets de bus pour vos prochains voyages",
    subtitle: "Réservez facilement votre prochain voyage avec Tike",
    fromPlaceholder: "De",
    toPlaceholder: "À",
    search: "Rechercher",
    locationError: "Veuillez sélectionner les lieux de départ et d'arrivée",
    features: {
      priorities: {
        title: "Votre voyage, vos priorités",
        description: "Petit budget ? Programme serré ? Réservez des billets qui répondent à vos besoins."
      },
      coverage: {
        title: "Couverture régionale",
        description: "Gagnez du temps en comparant toutes vos options de voyage en bus en un seul endroit."
      },
      support: {
        title: "Support 24/7",
        description: "Notre équipe d'experts de classe mondiale est toujours là pour vous aider."
      }
    },
    topRoutes: {
      title: "Itinéraires de bus les plus fréquentés"
    },
    whyJoin: {
      title: "Pourquoi rejoindre Tike ?",
      subtitle: "Réservation et paiement plus rapides",
      benefits: [
        "Gérez et annulez vos voyages facilement",
        "Sauvegardez votre mode de paiement et vos informations de facturation",
        "Informations de sécurité pour vos voyages !"
      ]
    },
    bookOnline: {
      title: "Réservez vos billets de bus en ligne",
      description: "Chaque jour, des milliers de voyageurs comme vous prennent le bus pour voyager entre les villes. Avec Tike, vous pouvez facilement comparer les bus et trouver des billets de bus pas chers pour votre prochain voyage. Que vous souhaitiez voyager en bus vers Kampala, Nairobi, Bujumbura ou n'importe où ailleurs dans la région, vous pouvez vérifier les horaires des bus, les prix des billets et les services à bord du bus. Avec Tike, vous pouvez facilement réserver vos billets de bus pas chers en ligne auprès de la meilleure compagnie de bus. Avec Tike, vous pouvez facilement vérifier les horaires des bus, les prix des billets, les voyages en bus pas chers et les services proposés dans le bus (WiFi, espace pour les jambes supplémentaire, franchise bagages généreuse)."
    },
    faq: {
      title: "Questions fréquemment posées",
      questions: [
        {
          question: "Question 1",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        },
        {
          question: "Question 2",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        },
        {
          question: "Question 3",
          answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda fugit et dicta maxime odit nemo ipsum molestiae repudiandae maiores numquam dolore, corporis, perferendis explicabo? Officia sint deserunt assumenda suscipit quas!"
        }
      ]
    }
  }
};

export default function Home({ lang = 'en' }: HomeProps) {
  const router = useRouter();
  const t = translations[lang];
  // const t = translations[lang as keyof typeof translations];

  function groupByCountry(locations: Location[]) {
    return locations.reduce((acc, location) => {
      if (!acc[location.country]) {
        acc[location.country] = [];
      }
      acc[location.country].push(location);
      return acc;
    }, {} as { [key: string]: Location[] });
  }

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

  // const api_url=process.env.NEXT_PUBLIC_API_URL || "http://tike.rw/apis";

  function getLocations() {
    // const myHeaders = new Headers();
    // myHeaders.append("Authorization", "Bearer <YOUR_TOKEN_HERE>");

    const requestOptions = {
      method: "GET",
      // headers: myHeaders,
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
      toast.info(t.locationError);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    getLocations();
  }, []);

  return (
    <>
      <div className="section_home py-6 sm:py-12 px-4 sm:px-12 w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-300 opacity-70 z-0"></div>
        <Image
          src={"/illustrations/Bus-driver-amico.svg"}
          layout="fill"
          objectFit="contain"
          alt="Background"
          className="absolute inset-0 z-0 opacity-20"
        />
        <div className="relative z-10 flex flex-col space-y-6 max-w-7xl mx-auto h-96">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex flex-col space-y-4 w-full sm:w-1/2 mb-6 sm:mb-0">
              <h1 className="text-3xl sm:text-5xl font-black leading-tight sm:leading-normal text-center sm:text-left">
                {t?.title}
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                {t?.subtitle}
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
                    placeholder={t?.fromPlaceholder}
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
                    placeholder={t?.toPlaceholder}
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
                    <IoSearch /> <span>{t?.search}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer />

        {/* Hidden  */}
        <div className="flex flex-col sm:flex-row justify-evenly border rounded-lg px-4 sm:px-9 py-4 bg-white  space-y-4 sm:space-y-0 hidden">
          {[
            {
              src: "/illustrations/options.svg",
              title: t?.features.priorities.title,
              description: t?.features.priorities.description
            },
            {
              src: "/illustrations/coverage.svg",
              title: t?.features.coverage.title,
              description: t?.features.coverage.description,
            },
            {
              src: "/illustrations/support.svg",
              title: t.features.support.title,
              description: t.features.support.description,
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
        </div >

        <div className="section_top_routes py-8 sm:py-12 bg-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="font-bold text-2xl sm:text-3xl">{t.topRoutes.title} </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { route: "Kigali to Kampala", image: "/img/kampala.jpg" },
                { route: "Kigali to Nairobi", image: "/img/nairobi.jpg" },
                { route: "Kigali to Bujumbura", image: "/img/bujumbura.jpg" },
                { route: "Kampala to Kigali", image: "/img/kigali.jpg" },
                { route: "Nairobi to Kigali", image: "/img/bujumbura.jpg" },
                { route: "Bujumbura to Kigali", image: "/img/kigali2.jpg" },
              ].map((item, index) => (
                <div key={index} className="relative transition duration-300 ease-in-out hover:scale-105">
                  <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
                    <p>{item.route}</p>
                  </div>
                  <Image
                    src={item.image}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg"
                    width={400}
                    height={300}
                    alt={item.route}
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4 sm:pb-6"> {t.whyJoin.title}</h1>
              <p className="font-bold pb-3">{t.whyJoin.subtitle}</p>
              <ul className="list-disc pl-5">
                <li>{t.whyJoin.benefits[0]}</li>
                <li>{t.whyJoin.benefits[1]}</li>
                <li>{t.whyJoin.benefits[2]}</li>
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4">
                {t.bookOnline.title}
              </h1>
              <p className="pb-6 text-sm sm:text-base">
                {t.bookOnline.description}
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold pb-4">
                {t.faq.title}
              </h2>
              <div className="flex flex-col space-y-2">
                <Collapsible className="border-b py-2">
                  <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
                    {/* Question 1 */}
                    {t.faq.questions[0].question}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-sm sm:text-base">
                    {t.faq.questions[0].answer}
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible className="border-b py-2">
                  <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
                    {t.faq.questions[1].question}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-sm sm:text-base">
                    {t.faq.questions[1].answer}
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible className="border-b py-2">
                  <CollapsibleTrigger className="font-bold pb-2 w-full text-left">
                    {t.faq.questions[2].question}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-sm sm:text-base">
                    {t.faq.questions[2].answer}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </>
      );
}
