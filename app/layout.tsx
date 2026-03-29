import type { Metadata, Viewport } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ProfileMenu from "@/components/ProfileMenu";
import AuthRecovery from "@/components/AuthRecovery";
import PasswordRecoveryListener from "@/components/PasswordRecoveryListener";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pistâches - Pister les tâches ménagères",
  description: "Suivez et visualisez la répartition des tâches ménagères et de la charge mentale",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pistâches",
  },
};

export const viewport: Viewport = {
  themeColor: "#93C572",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased bg-[#FAFAF8] text-[#1F2937] min-h-screen flex flex-col font-sans`}
        suppressHydrationWarning
      >
        <AuthRecovery />
        <PasswordRecoveryListener />
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
