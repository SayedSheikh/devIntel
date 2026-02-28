// app/layout.js
// This is the root layout — it wraps EVERY page in the application
// Think of it as the HTML template that all pages share

import { Inter } from "next/font/google";
// Inter is a clean, professional font used by many modern apps
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// Toaster shows notification pop-ups (e.g. "Developer added successfully!")
import QueryProvider from "@/components/layout/QueryProvider";
// Our TanStack Query wrapper — needed for data fetching to work

const inter = Inter({ subsets: ["latin"] });
// Load only the Latin character subset — smaller bundle size

export const metadata = {
  title: "DevIntel — Developer Intelligence Platform",
  description:
    "Internal recruitment intelligence platform for technology agencies",
};

export default function RootLayout({ children }) {
  // children = whatever page is currently being viewed
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning prevents React errors when browser extensions modify the DOM */}
      <body className={inter.className}>
        {/* QueryProvider wraps everything so TanStack Query works throughout the app */}
        <QueryProvider>
          {/* children is the actual page content */}
          {children}

          {/* Toaster renders notification toasts in a portal at the bottom of the screen */}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
