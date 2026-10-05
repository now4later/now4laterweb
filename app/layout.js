import "./globals.css";
import Providers from "./providers";

const siteUrl = "https://www.now4laterweb.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NOW4LATERWEB | Denver Website Design & Development",
    template: "%s | NOW4LATERWEB",
  },
  description:
    "NOW4LATERWEB is a Denver website design and development business creating professional, mobile-friendly websites for small businesses, entrepreneurs, creators, and service professionals.",
  applicationName: "NOW4LATERWEB",
  keywords: [
    "Denver website design",
    "Denver web design",
    "website design Denver",
    "website development Denver",
    "small business website design",
    "professional website design",
    "business website development",
    "website maintenance",
    "NOW4LATERWEB",
    "Now For Later LLC",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "NOW4LATERWEB",
    title: "NOW4LATERWEB | Denver Website Design & Development",
    description:
      "Professional website design and development for businesses, entrepreneurs, creators, and service professionals.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOW4LATERWEB | Denver Website Design & Development",
    description:
      "Professional website design and development for businesses and entrepreneurs.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#business`,
  name: "NOW4LATERWEB",
  legalName: "Now For Later LLC",
  url: siteUrl,
  description:
    "Denver website design and development business creating professional, mobile-friendly websites for small businesses, entrepreneurs, creators, and service professionals.",
  areaServed: [
    { "@type": "City", name: "Denver" },
    { "@type": "State", name: "Colorado" },
    { "@type": "Country", name: "United States" },
  ],
  knowsAbout: [
    "Website Design",
    "Web Development",
    "Small Business Websites",
    "Mobile Responsive Web Design",
    "Landing Pages",
    "Website Maintenance",
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Website Design" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Website Development" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website Maintenance" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landing Page Design" } },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
