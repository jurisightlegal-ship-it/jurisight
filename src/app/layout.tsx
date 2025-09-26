import type { Metadata } from "next";
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { DarkModeProvider } from "@/components/providers/dark-mode-provider";
import { MagazinePopupProvider } from "@/components/magazine-popup-provider";

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
  title: "Jurisight - Legal Knowledge Platform",
  description: "Democratizing access to legal information and empowering the legal community in India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${crimsonText.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <DarkModeProvider>
            <MagazinePopupProvider>
              {children}
            </MagazinePopupProvider>
          </DarkModeProvider>
        </Providers>
      </body>
    </html>
  );
}

