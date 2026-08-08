import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PatternPath — Master DSA. One Pattern at a Time.",
  description:
    "A premium SaaS platform for mastering Data Structures & Algorithms through structured pattern-based learning. 507 curated problems across 47 patterns.",
  keywords: [
    "DSA",
    "LeetCode",
    "Data Structures",
    "Algorithms",
    "Pattern Learning",
    "FAANG",
    "Interview Prep",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
