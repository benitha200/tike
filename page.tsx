"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { ToastContainer,toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  interface Location {
    id: string;
    name: string;
    arrival_location: string;
    // Other properties
  }


  const [locations, setLocations] = useState<Location[]>([]);
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");

  function getLocations() {
    const myHeaders = new Headers();
    // myHeaders.append("Authorization", `Bearer ${Cookies.get('token')}`);
    myHeaders.append(
      "Authorization",
      `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE0MjBkNmRlLTFhZGEtNGUwZC04ZWRiLTBlMzMyNjdhOTA2MSIsImZ1bGxuYW1lIjoiTG91YW5nZSIsImlkZW50aWZpZXIiOiJsb3VhbmdlaXl1eWlzZW5nYTIwMDJAZ21haWwuY29tIiwiaWF0IjoxNzE2OTE0MTE5LCJleHAiOjE3MTcwMDA1MTl9.NMc1ghyd3fgq_wfzwHz5Ay60JV4Qvy1MN64CEI_P-Q4`
    );

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      // redirect: "follow"
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}locations/`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setLocations(result.payload);
      })
      .catch((error) => console.error(error));
  }
  const handleSearch = () => {
    if (departureLocation && arrivalLocation) {
      const searchParams = new URLSearchParams({
        departure: departureLocation,
        arrival: arrivalLocation,
      });
      router.push(`/listings?${searchParams.toString()}`);
    } else {
      // Handle case where departureLocation or arrivalLocation is not selected
      console.log("https://b4b3-105-179-8-146.ngrok-free.app/api/callback");
      toast.info("https://b4b3-105-179-8-146.ngrok-free.app/api/callback")
    }
  };

  useEffect(() => {
    getLocations();

  }, []);

  return (
    <>
      <div className="section_home py-12 bg-slate-300 p-12 flex flex-col space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-4 w-1/2">
            <h1 className="text-5xl font-black leading-normal">
              Find easy bus tickets for your next trip
            </h1>
            <h2 className="text-xl font-semibold">
              Easily book your next trip with Tike
            </h2>
          </div>
          <Image
            src={"/illustrations/bus_stop.svg"}
            className="w-1/2"
            width={200}
            height={200}
            alt=""
          />
        </div>
        <div className="flex space-x-1">
          <div className="w-3/6 h-16 flex space-x-1 mt-3">
            <div className="flex justify-between items-center space-x-4 w-full">
              <div className="mb-6 w-full">
                <select
                  id="country"
                  className="text-sm rounded-lg block h-16 w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={departureLocation}
                  placeholder="Origin"
                  onChange={(e) => setDepartureLocation(e.target.value)}
                >
                  <option value="">Origin</option>
                  {locations &&
                    locations.map((location, index) => (
                      <option
                        key={location.id}
                        value={location.id}
                        onClick={() => setDepartureLocation(location.id)}
                      >
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="w-full mb-6">
                <select
                  id="country"
                  className="text-sm rounded-lg block h-16 w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={arrivalLocation}
                  onChange={(e) => setArrivalLocation(e.target.value)}
                >
                  <option value="">Destination</option>
                  {locations &&
                    locations.map((location, index) => (
                      <option
                        key={location.id}
                        value={location.id}
                        onClick={() => setArrivalLocation(location.id)}
                      >
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          <div className="w-2/6 flex space-x-1">
            <div className="w-full">
              <DatePicker className="w-full h-16" />
            </div>
          </div>
          <div className="w-1/6">
            <Button className="w-full h-16" onClick={handleSearch}>
              <div className="flex items-center space-x-2">
                <IoSearch /> <span>Search</span>
              </div>
            </Button>
          </div>
        </div>
        <ToastContainer/>

        <div className="flex justify-evenly border rounded-lg px-9 py-4">
          <div className="flex justify-center items-center space-x-3">
            <Image
              src={"/illustrations/options.svg"}
              width={50}
              height={50}
              alt=""
            />
            <div>
              <h1 className="text-base font-semibold">
                Your trip, your priority
              </h1>
              <p className="text-sm">
                On a budget? Tight schedule? Book tickets that fit your needs.
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-3">
            <Image
              src={"/illustrations/coverage.svg"}
              width={50}
              height={50}
              alt=""
            />
            <div>
              <h1 className="text-base font-semibold">Regional coverage</h1>
              <p className="text-sm">
                Save time by comparing all your bus travel options in one place.
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-3">
            <Image
              src={"/illustrations/support.svg"}
              width={50}
              height={50}
              alt=""
            />
            <div>
              <h1 className="text-base font-semibold">24/7 support</h1>
              <p className="text-sm">
                Our world class team of experts is always here to help.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="section_top_routes py-12 bg-slate-100">
        <div className="container grid grid-cols-3 gap-6 justify-items-stretch">
          <div className="col-span-3 justify-self-center pb-6">
            <h1 className="font-bold text-3xl">Top travelled bus routes</h1>
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Kigali to Kampala</p>
            </div>

            <Image
              src={"/img/kampala.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Kigali to Nairobi</p>
            </div>

            <Image
              src={"/img/nairobi.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Kigali to Bujumbura</p>
            </div>

            <Image
              src={"/img/bujumbura.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Kampala to Kigali</p>
            </div>

            <Image
              src={"/img/kigali.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Nairobi to Kigali</p>
            </div>

            <Image
              src={"/img/bujumbura.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
          <div className="relative transition delay-150 duration-300 ease-in-out hover:scale-105">
            <div className="absolute top-4 left-4 backdrop-blur-sm text-white bg-white/20 rounded-lg px-3 py-1">
              <p>Bujumbura to Kigali</p>
            </div>

            <Image
              src={"/img/kigali2.jpg"}
              className="w-full h-full rounded-lg flex justify-center"
              width={200}
              height={200}
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="section_explainer py-12 bg-white container flex flex-col space-y-24">
        <div className="flex justify-between items-center bg-slate-100 py-12 px-40 rounded-lg space-x-6">
          <div className="w-1/2">
            <h1 className="text-5xl font-semibold pb-6">Why join Tike?</h1>
            <p className="font-bold pb-3">Faster booking and checkout</p>
            <ul className="list-disc">
              <li>Manage and cancel your trips with ease</li>
              <li>Save your payment method and billing information</li>
              <li>Security information for your trips!</li>
            </ul>
          </div>
          <Image
            src={"/illustrations/traveling.svg"}
            className="w-1/2 h-60"
            width={200}
            height={200}
            alt=""
          />
        </div>
        <div className="flex justify-between space-x-6">
          <Image
            src={"/illustrations/questions.svg"}
            className="w-1/2 h-72"
            width={200}
            height={200}
            alt=""
          />
          <div className="w-1/2">
            <h1 className="text-5xl font-semibold pb-4">
              Book your bus tickets online
            </h1>
            <p className="pb-6">
              Every day, thousands of travelers like you take buses to travel
              between cities. With Tike, you can easily compare buses and find
              cheap bus tickets for your next bus trip. Whether you want to
              travel by bus to Kampala, Nairobi, Bujumbura, or anywhere else in
              the region, you can check the bus schedules, ticket prices and the
              services on the bus. With Tike, you can easily book your cheap bus
              tickets online from the best bus company. With Tike, you can
              easily check the bus schedules, ticket prices, cheap bus trips and
              what services are offered on the bus (WiFi, extra legroom,
              generous luggage allowance).
            </p>
            <h1 className="text-2xl font-semibold pb-4">
              Frequently asked questions.
            </h1>
            <div className="flex flex-col space-y-2">
              <Collapsible className="border-b py-2">
                <CollapsibleTrigger className="font-bold pb-2">
                  Question 1
                </CollapsibleTrigger>
                <CollapsibleContent>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Assumenda fugit et dicta maxime odit nemo ipsum molestiae
                  repudiandae maiores numquam dolore, corporis, perferendis
                  explicabo? Officia sint deserunt assumenda suscipit quas!
                </CollapsibleContent>
              </Collapsible>
              <Collapsible className="border-b py-2">
                <CollapsibleTrigger className="font-bold pb-2">
                  Question 2
                </CollapsibleTrigger>
                <CollapsibleContent>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Assumenda fugit et dicta maxime odit nemo ipsum molestiae
                  repudiandae maiores numquam dolore, corporis, perferendis
                  explicabo? Officia sint deserunt assumenda suscipit quas!
                </CollapsibleContent>
              </Collapsible>
              <Collapsible className="border-b py-2">
                <CollapsibleTrigger className="font-bold pb-2">
                  Question 3
                </CollapsibleTrigger>
                <CollapsibleContent>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Assumenda fugit et dicta maxime odit nemo ipsum molestiae
                  repudiandae maiores numquam dolore, corporis, perferendis
                  explicabo? Officia sint deserunt assumenda suscipit quas!
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
