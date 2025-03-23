import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/global.css";
import I18nProvider from "../providers/I18nProvider"; // Import the provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tike",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <I18nProvider>
          <main className="flex min-h-screen flex-col">
            <Header />
            {children}
            <Footer />
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
