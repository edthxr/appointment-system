import type { Metadata } from "next";
import { Inter, Outfit, Prompt } from "next/font/google";
import { WebProviders } from "@/providers/WebProviders";
import "./app.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const prompt = Prompt({ 
  subsets: ["latin", "thai"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-prompt" 
});

export const metadata: Metadata = {
  title: "Aura Clinic | นัดหมายจองคิวความงามออนไลน์",
  description: "จองบริการฉีดวิตามิน เลเซอร์ Botox และ HIFU กับแพทย์ผู้เชี่ยวชาญที่ Aura Clinic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${outfit.variable} ${prompt.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground selection:bg-accent/10">
        <WebProviders>
          {children}
        </WebProviders>
      </body>
    </html>
  );
}
