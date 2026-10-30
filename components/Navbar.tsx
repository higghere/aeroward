"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Wind, 
  Map, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Navigation, 
  Sliders, 
  Clock, 
  BookOpen, 
  Info, 
  Menu, 
  X,
  Activity
} from "lucide-react";

const NAV_LINKS = [
  { href: "/explore", label: "Explorer", icon: Map },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/causes", label: "Causes", icon: Flame },
  { href: "/solutions", label: "Solutions", icon: ShieldCheck },
  { href: "/routes", label: "Clean Routes", icon: Navigation },
  { href: "/scenarios", label: "Scenario Lab", icon: Sliders },
  { href: "/history", label: "History", icon: Clock },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-header max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-elevated text-accent transition-colors group-hover:border-accent">
            <Wind className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-text-primary">
              AEROWARD
            </span>
            <span className="ml-2 hidden font-mono text-xs uppercase tracking-widest text-text-muted sm:inline-block">
              Intel &bull; Kanpur Airshed
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "border border-border-strong bg-surface-elevated text-text-primary"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Telemetry / Mode Badge & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-sm border border-border-subtle bg-surface-elevated px-2.5 py-1 text-xs md:flex">
            <Activity className="h-3 w-3 text-data-improvement animate-pulse" />
            <span className="font-mono text-text-muted">STATUS:</span>
            <span className="font-mono font-medium text-text-secondary">DEMO CALIBRATED</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface-elevated text-text-secondary hover:text-text-primary xl:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 py-4 xl:hidden">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-sm p-2 text-xs font-medium ${
                    isActive
                      ? "border border-accent bg-surface-elevated text-text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
