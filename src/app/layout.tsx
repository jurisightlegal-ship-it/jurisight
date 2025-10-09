import type { Metadata } from "next";
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { DarkModeProvider } from "@/components/providers/dark-mode-provider";
import { MagazinePopupProvider } from "@/components/magazine-popup-provider";
import { CookieProvider } from "@/components/providers/cookie-provider";
import { CookieNotice } from "@/components/cookie-notice";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jurisight - Legal Knowledge Platform | Supreme Court & High Court Judgements",
  description: "Democratizing access to legal information and empowering the legal community in India. Explore Supreme Court judgements, High Court rulings, legal analysis, and comprehensive legal resources.",
  keywords: [
    "legal knowledge",
    "Supreme Court judgements",
    "High Court rulings", 
    "legal analysis",
    "Indian law",
    "legal education",
    "jurisprudence",
    "legal research",
    "court decisions",
    "legal resources",
    "law articles",
    "legal community India"
  ],
  authors: [{ name: "Jurisight Team" }],
  creator: "Jurisight",
  publisher: "Jurisight",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Jurisight - Legal Knowledge Platform | Supreme Court & High Court Judgements",
    description: "Democratizing access to legal information and empowering the legal community in India. Explore Supreme Court judgements, High Court rulings, legal analysis, and comprehensive legal resources.",
    url: '/',
    siteName: 'Jurisight',
    images: [
      {
        url: '/Jurisight.png',
        width: 1200,
        height: 630,
        alt: 'Jurisight - Legal Knowledge Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jurisight - Legal Knowledge Platform | Supreme Court & High Court Judgements",
    description: "Democratizing access to legal information and empowering the legal community in India. Explore Supreme Court judgements, High Court rulings, legal analysis, and comprehensive legal resources.",
    images: ['/Jurisight.png'],
    creator: '@jurisight',
    site: '@jurisight',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '500x500', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${crimsonText.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <DarkModeProvider>
            <MagazinePopupProvider>
              <CookieProvider>
                {children}
                <CookieNotice />
              </CookieProvider>
            </MagazinePopupProvider>
          </DarkModeProvider>
        </Providers>
      </body>
    </html>
  );
}

