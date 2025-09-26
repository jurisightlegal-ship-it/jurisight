import type { Metadata } from "next";
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { DarkModeProvider } from "@/components/providers/dark-mode-provider";
import { PreloaderProvider } from "@/components/providers/preloader-provider";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { PerformanceScript } from "@/components/performance-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false, // Only load when needed
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only load when needed
});

export const metadata: Metadata = {
  title: "Jurisight - Legal Knowledge Platform",
  description: "Democratizing access to legal information and empowering the legal community in India",
  keywords: ["legal", "law", "judgements", "supreme court", "high court", "legal news", "legal analysis"],
  authors: [{ name: "Jurisight Team" }],
  creator: "Jurisight",
  publisher: "Jurisight",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jurisight-omega.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Jurisight - Legal Knowledge Platform",
    description: "Democratizing access to legal information and empowering the legal community in India",
    url: 'https://jurisight-omega.vercel.app',
    siteName: 'Jurisight',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jurisight - Legal Knowledge Platform",
    description: "Democratizing access to legal information and empowering the legal community in India",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PerformanceScript />
      </head>
      <body
        className={`${inter.variable} ${crimsonText.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <DarkModeProvider>
            <PreloaderProvider>
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
            </PreloaderProvider>
          </DarkModeProvider>
        </Providers>
      </body>
    </html>
  );
}

