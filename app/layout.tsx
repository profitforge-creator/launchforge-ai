import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaunchForge — Build a Business. Not Another AI Tool.",
  description:
    "Describe an idea. LaunchForge researches the market, creates the product, builds the website, and prepares the launch.",
  keywords: ["business builder", "startup", "solopreneur", "ai business", "product launch"],
  openGraph: {
    title: "LaunchForge",
    description: "Build a Business. Not Another AI Tool.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body
        className="min-h-screen antialiased"
        style={{
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          backgroundColor: "hsl(220 13% 8%)",
          color: "hsl(220 9% 93%)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
