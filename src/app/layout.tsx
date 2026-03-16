import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspace.co.za";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ChurchSpace | Church Buildings for Rent, Sale, Conference and Youth Ministry Use",
    template: "%s | ChurchSpace",
  },
  description:
    "ChurchSpace is a church property marketplace in South Africa where ministries can rent church buildings, buy church property, book conference spaces, and find youth-friendly venues.",
  applicationName: "ChurchSpace",
  keywords: [
    "church building to rent",
    "church buildings for sale",
    "conference space for churches",
    "youth ministry venue",
    "church property marketplace",
    "church hall rental",
    "worship venue hire",
    "religious property South Africa",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ChurchSpace",
    title: "ChurchSpace | Church Buildings for Rent, Sale, Conference and Youth Ministry Use",
    description:
      "Find church buildings to rent or buy, conference spaces, halls, and youth ministry venues across South Africa.",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChurchSpace | Church Buildings for Rent and Sale",
    description:
      "Search church buildings, conference rooms, halls, and youth ministry spaces across South Africa.",
  },
  category: "Real Estate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}>
        <Providers session={session}>
          <div className="min-h-screen bg-background">
            <Navbar session={session} />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
