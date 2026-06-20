import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LiquidKit Documentation",
  description: "A comprehensive guide to LiquidKit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} ${jetbrainsMono.variable} font-sans bg-[#0B101F] text-[#F4F6F8] antialiased overflow-hidden`}
      >
        <Navbar />

        <div className="flex h-screen pt-[64px]">
          <Sidebar />

          <main className="flex-1 overflow-y-auto bg-[#101B2E] relative md:ml-[280px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1A2744]/60 via-[#101B2E]/0 to-[#101B2E]/0 pointer-events-none h-96" />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
