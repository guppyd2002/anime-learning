import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "One Piece 英語學習",
  description: "用海賊王學英文！",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="zh-TW" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
        <body className="min-h-full bg-zinc-950 text-zinc-100">{children}</body>
      </html>
    </ClerkProvider>
  );
}
