import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from '@/lib/site';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KE Motors — Verified Vehicle Marketplace in Kenya",
    template: "%s | KE Motors",
  },
  description: "Find verified cars for sale in Kenya, including bank repossessions, direct owner listings, and selected dealer vehicles.",
  openGraph: {
    type: 'website',
    siteName: 'KE Motors',
    locale: 'en_KE',
    title: 'KE Motors — Verified Vehicle Marketplace in Kenya',
    description: 'Find verified cars for sale in Kenya, including bank repossessions, direct owner listings, and selected dealer vehicles.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KE Motors — Verified Vehicle Marketplace in Kenya',
    description: 'Find verified cars for sale in Kenya, including bank repossessions, direct owner listings, and selected dealer vehicles.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
