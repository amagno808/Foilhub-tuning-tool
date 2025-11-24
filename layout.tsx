import "./globals.css";
import type { Metadata } from "next";
import FoilHubHeader from "./components/FoilHubHeader";

export const metadata: Metadata = {
  title: "FoilHub Tuning Tool",
  description: "Hydrofoil setup, tuning, and track position calculator."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <FoilHubHeader />
        {children}
      </body>
    </html>
  );
}
