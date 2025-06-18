"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

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
  const [showContactOptions, setShowContactOptions] = useState(false);

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
    <header className="top-0 z-100 w-full bg-white">
      <div className="container h-14 flex justify-between items-center">
        {/* Logo and link to home page */}
        <Link href={`/${currentLang}`}>
          <Image src="/logo.svg" className="h-10" width={250} height={200} alt="Logo" />
        </Link>

        {/* Navigation and language switcher */}
        <nav className="flex items-center justify-between space-x-6">
          <button
            type="button"
            className="px-3 py-1 mx-1 rounded bg-black text-white hover:bg-gray-900 whitespace-nowrap hidden sm:inline"
            onClick={() => setShowContactOptions((prev) => !prev)}
          >
            {t("contact", { ns: "common" })}
          </button>
          <button
            type="button"
            className="sm:hidden"
            aria-label={t("contact", { ns: "common" })}
            onClick={() => setShowContactOptions((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-black"
            >
              <path d="M1.5 4.5A2.25 2.25 0 0 1 3.75 2.25h16.5A2.25 2.25 0 0 1 22.5 4.5v15a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 19.5v-15zm2.25-.75a.75.75 0 0 0-.75.75v.662l9 5.625 9-5.625V4.5a.75.75 0 0 0-.75-.75H3.75zm18 3.348-8.719 5.448a1.5 1.5 0 0 1-1.562 0L2.25 7.098v12.402c0 .414.336.75.75.75h16.5a.75.75 0 0 0 .75-.75V7.098z" />
            </svg>
          </button>
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
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
