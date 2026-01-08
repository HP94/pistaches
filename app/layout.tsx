import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ProfileMenu from "@/components/ProfileMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equal Housing - Répartition des tâches ménagères",
  description: "Suivez et visualisez la répartition des tâches ménagères et de la charge mentale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <div className="flex-1 pb-[100px] sm:pb-0">
          {children}
        </div>
        <Navigation />
        {/* Profile menu for mobile */}
        <ProfileMenu />
      </body>
    </html>
  );
}
