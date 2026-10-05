import Link from "next/link";

export const metadata = {
  title: "Denver Website Design for Small Businesses",
  description:
    "NOW4LATERWEB provides professional website design and development for Denver small businesses, entrepreneurs, creators, and service professionals.",
  alternates: { canonical: "/denver-website-design" },
};

const faqs = [
  {
    q: "What does a Denver website design company do?",
    a: "A website design company plans, designs, builds, and launches a website that represents a business online. NOW4LATERWEB focuses on professional, mobile-friendly websites for businesses and entrepreneurs.",
  },
  {
    q: "Does NOW4LATERWEB build websites for small businesses?",
    a: "Yes. NOW4LATERWEB builds websites for small businesses, local service providers, entrepreneurs, creators, and professionals who need a clear and credible online presence.",
  },
  {
    q: "Can NOW4LATERWEB update an existing website?",
    a: "Yes. Website updates and ongoing maintenance can include content, images, event information, links, and other reasonable changes. Larger redesigns or custom development can be quoted separately.",
  },
  {
    q: "Are NOW4LATERWEB websites mobile friendly?",
    a: "Yes. Websites are designed responsively so customers can use them on phones, tablets, and desktop computers.",
  },
  {
    q: "Does NOW4LATERWEB serve businesses outside Denver?",
    a: "Yes. NOW4LATERWEB is based around the Denver, Colorado market and can work with clients remotely throughout Colorado and the United States.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Denver Website Design",
  serviceType: "Website Design and Development",
  provider: {
    "@type": "ProfessionalService",
    name: "NOW4LATERWEB",
    legalName: "Now For Later LLC",
    url: "https://www.now4laterweb.com",
  },
  areaServed: [
    { "@type": "City", name: "Denver" },
    { "@type": "State", name: "Colorado" },
    { "@type": "Country", name: "United States" },
  ],
  description:
    "Professional website design and development for Denver small businesses, entrepreneurs, creators, and service professionals.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function DenverWebsiteDesignPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="hero">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="badge">Denver Website Design & Development</div>
          <h1>Professional websites for Denver businesses.</h1>
          <p className="hero-text">
            <strong>NOW4LATERWEB</strong>, operated by Now For Later LLC, creates modern, professional,
            mobile-friendly websites for small businesses, entrepreneurs, creators, and service professionals.
            We help businesses establish a credible online presence and make it easier for customers to learn,
            connect, and take the next step.
          </p>
          <div className="hero-buttons">
            <Link href="/#contact" className="btn btn-primary">Start Your Website</Link>
            <Link href="/" className="btn btn-secondary">Back to NOW4LATERWEB</Link>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <div className="section-label">WHAT WE DO</div>
          <h2 className="section-title">Denver web design services built around your business.</h2>
          <p className="section-description">
            Whether you are launching a new business, refreshing an existing brand, or creating an online home
            for your work, NOW4LATERWEB can build a website around your goals.
          </p>
          <div className="services-grid">
            <article className="service"><div className="icon">🏢</div><h3>Small Business Websites</h3><p>Professional websites that clearly explain your business, services, location, and contact options.</p></article>
            <article className="service"><div className="icon">🛠️</div><h3>Service Business Websites</h3><p>Websites for contractors, local services, consultants, professionals, and other service providers.</p></article>
            <article className="service"><div className="icon">🎨</div><h3>Portfolio Websites</h3><p>Clean online portfolios for creators, artists, professionals, and businesses that need to showcase their work.</p></article>
            <article className="service"><div className="icon">🚀</div><h3>Landing Pages</h3><p>Focused pages for services, campaigns, events, products, promotions, and lead generation.</p></article>
            <article className="service"><div className="icon">🔧</div><h3>Website Maintenance</h3><p>Content updates, photos, events, links, announcements, and other ongoing website support.</p></article>
            <article className="service"><div className="icon">✨</div><h3>Custom Development</h3><p>Custom functionality and integrations when a standard website needs something more.</p></article>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container about-grid">
          <div>
            <div className="section-label">WHY NOW4LATERWEB</div>
            <h2 className="section-title">A website should explain your business clearly.</h2>
            <p className="about-text">
              NOW4LATERWEB combines custom design, responsive development, clear communication, and practical
              business content. The goal is not simply to put a website online. The goal is to give your business
              a professional digital home that customers can understand and use.
            </p>
          </div>
          <div className="about-boxes">
            <div className="about-box"><strong>Denver</strong><span>Colorado-focused service</span></div>
            <div className="about-box"><strong>Mobile</strong><span>Responsive across modern devices</span></div>
            <div className="about-box"><strong>Custom</strong><span>Designed around your business</span></div>
            <div className="about-box"><strong>Support</strong><span>Maintenance and updates available</span></div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <div className="section-label">QUESTIONS</div>
          <h2 className="section-title">Denver website design FAQ.</h2>
          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to build your business website?</h2>
            <p>Tell NOW4LATERWEB what you need and start the conversation.</p>
            <div className="cta-buttons">
              <Link href="/#contact" className="btn btn-primary">Get Started</Link>
              <Link href="/" className="btn btn-secondary">Explore NOW4LATERWEB</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
