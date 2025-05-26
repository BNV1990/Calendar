"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../public/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const handleTouchMove = (event: TouchEvent) => {
        let isScrollable = false;
        let target = event.target as HTMLElement;

        // Check if the touched element or any of its parents are scrollable
        while (target && target !== document.body) {
          if (target.scrollHeight > target.clientHeight && (target.style.overflowY === 'scroll' || target.style.overflowY === 'auto')) {
            isScrollable = true;
            break;
          }
          target = target.parentNode as HTMLElement;
        }

        if (!isScrollable) {
          event.preventDefault();
        }
      };

      document.body.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        document.body.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.png" />
        <link rel="apple-touch-icon" href="/icons/icon.png" sizes="512x512" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
