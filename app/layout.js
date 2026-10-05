import "./globals.css";
import Providers from "./providers";

const siteUrl = "https://www.now4laterweb.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NOW4LATERWEB | Professional Website Design & Development",
    template: "%s | NOW4LATERWEB",
  },
  description:
    "NOW4LATERWEB creates professional, mobile-friendly websites for small businesses, entrepreneurs, creators, organizations, and service professionals. Serving clients remotely nationwide, with a strong presence in Denver and Colorado.",
  applicationName: "NOW4LATERWEB",
  keywords: [
    "website design",
    "web design",
    "website development",
    "small business website design",
    "professional website design",
    "business website development",
    "custom website design",
    "website maintenance",
    "landing page design",
    "NOW4LATERWEB",
    "Now For Later LLC",
    "Denver website design",
    "Colorado website design",
  ],
  alternates: { canonical: "/" },
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
    title: "NOW4LATERWEB | Professional Website Design & Development",
    description:
      "Professional website design and development for businesses, entrepreneurs, creators, organizations, and service professionals.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOW4LATERWEB | Professional Website Design & Development",
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
    "NOW4LATERWEB is a professional website design and development business that creates modern, mobile-friendly websites for small businesses, entrepreneurs, creators, organizations, and service professionals.",
  areaServed: [
    { "@type": "Country", name: "United States" },
    { "@type": "State", name: "Colorado" },
    { "@type": "City", name: "Denver" },
  ],
  serviceType: [
    "Website Design",
    "Web Development",
    "Small Business Website Design",
    "Custom Website Development",
    "Landing Page Design",
    "Website Maintenance",
  ],
  knowsAbout: [
    "Website Design",
    "Web Development",
    "Small Business Websites",
    "Mobile Responsive Web Design",
    "Landing Pages",
    "Website Maintenance",
    "Business Websites",
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Website Design" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Website Development" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website Maintenance" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landing Page Design" } },
  ],
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
