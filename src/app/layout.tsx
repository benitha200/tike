import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/global.css";

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
        <main className="flex min-h-screen flex-col">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
