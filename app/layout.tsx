import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaunchForge AI — Turn Your Skills Into a Business",
  description:
    "Get a researched business idea, competitor analysis, product concept, and marketing strategy instantly.",
  keywords: ["business idea generator", "startup ideas", "side project", "solopreneur"],
  openGraph: {
    title: "LaunchForge AI",
    description: "Turn Your Skills Into a Business in Minutes",
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
