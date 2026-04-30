import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
  description: "A modern learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
