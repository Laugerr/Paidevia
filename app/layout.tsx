import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paidevia",
  description: "A modern LMS platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ backgroundColor: "#0d1117", color: "#e6edf3" }}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <Navbar />
          <div className="relative pb-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
