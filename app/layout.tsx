import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GlassNavbar } from "@/components/glass/GlassNavbar";

// TODO: replace with the real domain once it's live (custom domain or the
// *.vercel.app one Vercel assigns on deploy). Every absolute URL below
// (canonical link, OG/Twitter image URLs, JSON-LD) is resolved against this,
// so leaving it as a placeholder means previews/search results will point
// at the wrong place until it's updated.
const SITE_URL = "https://welltools.vercel.app";
const SITE_NAME = "WELLTools";
const AUTHOR_NAME = "Samuel Extehines Heydemans";
const TITLE = "WELLTools — Motion Graphics & Video Tools";
const DESCRIPTION =
  "WELLTools is a free, browser-based toolbox for video editors and content creators — motion templates, animation tools, and video editing utilities. No login, no server-side processing.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · WELLTools" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "WELLTools",
    "motion graphics",
    "video editing tools",
    "animation templates",
    "browser video editor",
    "remove silence",
    "kinetic typography",
    "free video tools",
  ],
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: "WELL",
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    // No need to list the image explicitly — app/opengraph-image.tsx (file
    // convention) generates it and Next wires it into this metadata
    // automatically. Left implicit on purpose so there's one source of truth.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // Same story as above — app/twitter-image.tsx supplies the image.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// Structured data (schema.org), so Google can associate "WELL" as the brand
// and Samuel Extehines Heydemans as the creator with this site as an entity,
// rather than just indexing it as an anonymous page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (runs in-browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      brand: { "@type": "Brand", name: "WELL" },
      creator: { "@type": "Person", name: AUTHOR_NAME },
    },
    {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  ],
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
        {/* JSON-LD lives here rather than in a hand-written <head> — Next
            hoists <script type="application/ld+json"> into the real
            document head wherever it's rendered; a manual <head> element in
            the root layout fights with Next's own head management. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
