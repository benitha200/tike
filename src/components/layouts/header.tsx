"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LanguageSwitcher = () => {
  const { i18n, ready } = useTranslation();  // `ready` ensures translations are initialized
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);  // Ensure the component only renders after the client is ready
  }, []);

  // Wait until i18n is initialized and the component is rendered on the client
  if (!ready || !isClient) {
    return null;  // Don't render the component until translations are initialized
  }

  const currentLang = (pathname?.split("/")[1] || "en") as SupportedLanguage;

  const changeLanguage = (newLocale: SupportedLanguage) => {
    i18n.changeLanguage(newLocale); // Change language in i18next
    //const newPath = pathname.replace(`/${currentLang}`, `/${newLocale}`);
    //router.push(newPath); // Push the new route with the updated language
  };

  return (
    <div className="flex items-center gap-4">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
        className="px-3 py-1 rounded border border-gray-300"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="rw">Kinyarwanda</option>
      </select>
    </div>
  );
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  // Get the current language from the URL, fallback to 'en' if not found
  const rawLang = pathname?.split("/")[1] || "en";
  const currentLang: SupportedLanguage = SUPPORTED_LANGUAGES.includes(rawLang as SupportedLanguage)
    ? (rawLang as SupportedLanguage)
    : "en";

  // Ensure the page content only renders when translations are ready
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);  // Wait until the component is mounted on the client-side
  }, []);

  // Don't render the Header if translations are not ready or it's server-rendered
  if (!isClient || !i18n.isInitialized) {
    return null;
  }

  return (
    <header className="top-0 z-0 w-full bg-white">
      <div className="container h-14 flex justify-between items-center">
        {/* Logo and link to home page */}
        <Link href={`/${currentLang}`}>
          <Image src="/logo.svg" className="h-10" width={250} height={200} alt="Logo" />
        </Link>

        {/* Navigation and language switcher */}
        <nav className="flex items-center justify-between space-x-6">
            <Link
            href={`/${currentLang}/contact`}
            className="px-3 py-1 mx-2 rounded bg-black text-white hover:bg-gray-900 whitespace-nowrap"
            >
            {t("contact")}
            </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
