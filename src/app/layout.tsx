import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aura Clinic | นัดหมายจองคิวความงามออนไลน์",
  description: "จองบริการฉีดวิตามิน เลเซอร์ Botox และ HIFU กับแพทย์ผู้เชี่ยวชาญที่ Aura Clinic",
};

import { LanguageProvider } from "@/providers/LanguageProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground selection:bg-accent/10">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
