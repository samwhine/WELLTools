"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LiquidGlass } from "./LiquidGlass";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Motion", href: "/motion" },
  { label: "Video", href: "/video" },
  { label: "Audio", href: "/audio" },
  { label: "Tools", href: "/tools" },
];

export function GlassNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever the route changes, and never leave it open
  // (and blocking touch on the page below) behind a stale render.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open so it doesn't scroll
  // behind the glass panel on small screens.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 flex flex-col items-center px-4 pt-4">
      <LiquidGlass level="regular" className="flex w-full max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
          WELLTools
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[9px] px-3 py-1.5 text-sm text-ink-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/motion"
          className="hidden rounded-control bg-accent px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(91,140,255,0.35)] transition-colors hover:bg-accent-soft sm:inline-flex"
        >
          Explore templates
        </Link>

        {/* Mobile-only trigger. Real hit target (44px), not a decorative icon. */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-white/[0.06] sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </LiquidGlass>

      {/* Mobile menu panel. Rendered (not unmounted) so the close transition
          can play; visibility is driven by opacity/translate + pointer-events
          rather than conditional mounting. */}
      <div
        className={cn(
          "w-full max-w-5xl overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-[var(--ease-standard)] sm:hidden",
          open ? "mt-2 max-h-96 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
        )}
      >
        <LiquidGlass level="strong" className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center rounded-[10px] px-3 text-[15px] transition-colors",
                pathname === item.href ? "bg-white/[0.10] text-ink" : "text-ink-muted hover:bg-white/[0.06] hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/motion"
            className="mt-1 flex h-11 items-center justify-center rounded-control bg-accent text-[15px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(91,140,255,0.35)]"
          >
            Explore templates
          </Link>
        </LiquidGlass>
      </div>

      {/* Backdrop: tap-to-close outside the panel, sits above page content
          but below the panel/header. */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-[64px] -z-10 bg-black/40 backdrop-blur-[2px] sm:hidden"
        />
      )}
    </header>
  );
}
