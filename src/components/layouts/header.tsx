"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Define supported languages as a const array
const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Type-safe translations object
const translations: Record<SupportedLanguage, { help: string }> = {
  en: {
    help: 'Help'
  },
  fr: {
    help: 'Aide'
  }
};

const LanguageSwitcher = () => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract and validate current language from pathname
  const currentLang = (pathname?.split('/')[1] || 'en') as SupportedLanguage;
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const changeLanguage = (newLocale: SupportedLanguage) => {
    router.push(`/${newLocale}`);
  };
  
  if (!isClient) {
    return null;
  }
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded hover:bg-gray-100 ${
          currentLang === "en" ? "bg-gray-200" : ""
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("fr")}
        className={`px-3 py-1 rounded hover:bg-gray-100 ${
          currentLang === "fr" ? "bg-gray-200" : ""
        }`}
      >
        Français
      </button>
    </div>
  );
};

export default function Header() {
  const pathname = usePathname();
  
  // Extract and validate current language from pathname
  const rawLang = pathname?.split('/')[1] || 'en';
  const currentLang: SupportedLanguage = SUPPORTED_LANGUAGES.includes(rawLang as SupportedLanguage) 
    ? (rawLang as SupportedLanguage) 
    : 'en';

  return (
    <header className="top-0 z-0 w-full bg-white">
      <div className="container h-14 flex justify-between items-center">
        <Link href={`/${currentLang}`}>
          <Image
            src="/logo.svg"
            className="h-10"
            width={250}
            height={200}
            alt="Logo"
          />
        </Link>
        
        <nav className="flex items-center justify-between space-x-6">
          {/* <Link href={`/${currentLang}/help`}>
            {translations[currentLang].help}
          </Link> */}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}


