import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GlassNavbar } from "@/components/glass/GlassNavbar";

export const metadata: Metadata = {
  title: "WELLTools — Motion Graphics & Video Tools",
  description: "A free, browser-based creative toolbox for video editors and content creators.",
};

// Without this, mobile browsers render the page at a desktop-width virtual
// viewport (~980px) and zoom out to fit — every `sm:` breakpoint and the
// mobile nav built for it would silently never trigger. This was missing
// before and is the actual root cause a lot of "looks fine on desktop,
// tiny on phone" bugs trace back to.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0C0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-canvas text-ink antialiased">
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(1200px 600px at 15% -10%, rgba(91,140,255,0.14), transparent 60%), radial-gradient(900px 500px at 100% 10%, rgba(143,179,255,0.08), transparent 55%)",
          }}
        />
        <GlassNavbar />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">{children}</main>
      </body>
    </html>
  );
}
