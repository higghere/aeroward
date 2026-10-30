import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelemetryBanner from "@/components/TelemetryBanner";

export const metadata: Metadata = {
  title: "AeroWard | Predictive Air Quality Intelligence & Proactive Mitigation",
  description:
    "Predictive air quality intelligence platform grounded in atmospheric science, spatiotemporal deep learning, micro-exposure clean navigation, and proactive Graded Response Action Plan (GRAP) interventions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-accent/30 selection:text-foreground">
        <TelemetryBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
