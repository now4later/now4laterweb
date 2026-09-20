"use client";

import { useState } from "react";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "../lib/site-config";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    projectType: "New Business Website",
    message: "",
  });
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.details || data?.error || "Request failed");
      }
      setStatus("success");
      setForm({
        name: "",
        email: "",
        businessName: "",
        projectType: "New Business Website",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err?.message || "Something went wrong sending your inquiry.");
    }
  }

  return (
    <>
      {/* ================= HEADER — exact port of original markup ================= */}
      <header>
        <div className="container nav">
          <a href="#home" className="logo">
            <span className="logo-mark"></span>
            Now For Later
          </a>

          <ul className={`nav-links${menuOpen ? " open" : ""}`} id="navLinks">
            <li>
              <a href="#services" onClick={() => setMenuOpen(false)}>
                Services
              </a>
            </li>
            <li>
              <a href="#portfolio" onClick={() => setMenuOpen(false)}>
                Portfolio
              </a>
            </li>
            <li>
              <a href="#process" onClick={() => setMenuOpen(false)}>
                How It Works
              </a>
            </li>
            <li>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>
                Pricing
              </a>
            </li>
            <li>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>
            </li>
            <li>
              <a href="#faq" onClick={() => setMenuOpen(false)}>
                FAQ
              </a>
            </li>
          </ul>

          <a href="#contact" className="nav-button">
            Get Started
          </a>

          <button
            className="menu"
            id="menuButton"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
          </button>
        </div>
      </header>

      <main>
        {/* ================= HERO — exact port ================= */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div>
              <div className="badge">
                Professional Website Design & Development
              </div>

              <h1>
                Your business deserves a website that <span>stands out.</span>
              </h1>

              <p className="hero-text">
                Now For Later LLC creates modern, professional,
                mobile-friendly websites designed to help businesses look
                credible, connect with customers, and grow online.
              </p>

              <div className="hero-buttons">
                <a href="#contact" className="btn btn-primary">
                  Build My Website
                </a>
                <a href="#portfolio" className="btn btn-secondary">
                  View Our Work
                </a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <strong>Modern</strong>
                  <small>Custom designs</small>
                </div>
                <div className="hero-stat">
                  <strong>Mobile</strong>
                  <small>Ready everywhere</small>
                </div>
                <div className="hero-stat">
                  <strong>Simple</strong>
                  <small>Easy to navigate</small>
                </div>
              </div>
            </div>

            <div className="website-preview">
              <div className="preview-window">
                <div className="preview-top">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="preview-content">
                  <div className="preview-hero"></div>
                  <div className="preview-cards">
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                  </div>
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>
                </div>
              </div>

              <div className="floating-card one">
                <span className="green-dot"></span>
                Mobile Ready
              </div>

              <div className="floating-card two">✨ Custom Design</div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES — exact port ================= */}
        <section className="services" id="services">
          <div className="container">
            <div className="section-label">WHAT WE BUILD</div>
            <h2 className="section-title">
              Websites built around your business.
            </h2>
            <p className="section-description">
              Whether you need a simple online presence or a complete
              business website, we create designs that are easy to use and
              built to make a strong first impression.
            </p>

            <div className="services-grid">
              <div className="service">
                <div className="icon">🏢</div>
                <h3>Business Websites</h3>
                <p>
                  Professional websites that explain what your business does
                  and make it easy for customers to contact you.
                </p>
              </div>

              <div className="service">
                <div className="icon">🛠️</div>
                <h3>Service Businesses</h3>
                <p>
                  Websites designed for contractors, local businesses,
                  consultants, and other service professionals.
                </p>
              </div>

              <div className="service">
                <div className="icon">🎨</div>
                <h3>Portfolio Websites</h3>
                <p>
                  Showcase your work, projects, skills, and experience with a
                  clean and professional online portfolio.
                </p>
              </div>

              <div className="service">
                <div className="icon">🚀</div>
                <h3>Landing Pages</h3>
                <p>
                  Focused pages designed to promote a product, service,
                  event, offer, or campaign.
                </p>
              </div>

              <div className="service">
                <div className="icon">👤</div>
                <h3>Personal Websites</h3>
                <p>
                  A professional home on the internet built around your
                  personal brand, story, or goals.
                </p>
              </div>

              <div className="service">
                <div className="icon">✨</div>
                <h3>Custom Websites</h3>
                <p>
                  Have something different in mind? We'll create a website
                  specifically around your needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY US — exact port ================= */}
        <section className="why">
          <div className="container why-grid">
            <div>
              <div className="section-label">WHY NOW FOR LATER</div>
              <h2 className="section-title">
                We make getting a website simple.
              </h2>
              <p className="section-description">
                You shouldn't need to understand code, design, or
                complicated technology to have a professional website.
                That's where we come in.
              </p>
            </div>

            <div className="why-list">
              <div className="why-item">
                <div className="why-number">1</div>
                <div>
                  <h3>Professional Design</h3>
                  <p>
                    Clean, modern layouts designed to make your business look
                    credible and professional.
                  </p>
                </div>
              </div>

              <div className="why-item">
                <div className="why-number">2</div>
                <div>
                  <h3>Easy Navigation</h3>
                  <p>
                    Customers should be able to find what they need without
                    getting lost.
                  </p>
                </div>
              </div>

              <div className="why-item">
                <div className="why-number">3</div>
                <div>
                  <h3>Mobile Friendly</h3>
                  <p>
                    Your website will be designed to look great on phones,
                    tablets, and computers.
                  </p>
                </div>
              </div>

              <div className="why-item">
                <div className="why-number">4</div>
                <div>
                  <h3>Built Around You</h3>
                  <p>
                    Your website should represent your business, not look
                    like everybody else's.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PORTFOLIO — reconstructed from CSS + exact copy ================= */}
        <section className="portfolio" id="portfolio">
          <div className="container">
            <div className="section-label">OUR WORK</div>
            <h2 className="section-title">
              Websites made to make an impression.
            </h2>
            <p className="section-description">
              A few examples of the types of projects Now For Later can
              create.
            </p>

            <div className="portfolio-grid">
              {[
                {
                  tag: "BUSINESS WEBSITE",
                  title: "Professional Business Site",
                  desc: "Modern website built to establish credibility and generate customer inquiries.",
                },
                {
                  tag: "SERVICE BUSINESS",
                  title: "Local Service Website",
                  desc: "Clear services, contact information, and calls to action for local customers.",
                },
                {
                  tag: "PORTFOLIO",
                  title: "Creative Portfolio",
                  desc: "A visual online presence designed to showcase work and projects.",
                },
                {
                  tag: "LANDING PAGE",
                  title: "Campaign Landing Page",
                  desc: "A focused page designed around one offer or customer action.",
                },
                {
                  tag: "PERSONAL WEBSITE",
                  title: "Personal Brand Site",
                  desc: "A polished digital home for a person's story, services, and brand.",
                },
                {
                  tag: "CUSTOM WEBSITE",
                  title: "Custom Digital Experience",
                  desc: "A website shaped around a client's specific goals and audience.",
                },
              ].map((p) => (
                <div className="project" key={p.title}>
                  <div className="project-image">{p.tag}</div>
                  <div className="project-info">
                    <div className="project-tag">{p.tag}</div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PROCESS — reconstructed ================= */}
        <section className="process" id="process">
          <div className="container">
            <div className="section-label">HOW IT WORKS</div>
            <h2 className="section-title">From idea to live website.</h2>
            <p className="section-description">
              A straightforward process keeps your project organized from
              the first conversation through launch.
            </p>

            <div className="process-grid">
              {[
                {
                  title: "Tell Us Your Vision",
                  desc: "We learn about your business, audience, goals, content, and the type of website you need.",
                },
                {
                  title: "Design & Build",
                  desc: "We create the structure, visual design, pages, content areas, and functionality.",
                },
                {
                  title: "Review & Refine",
                  desc: "You review the website and we make agreed-upon revisions before launch.",
                },
                {
                  title: "Launch",
                  desc: "Your finished website is prepared for deployment and made ready for your customers.",
                },
              ].map((step, i) => (
                <div className="process-card" key={step.title}>
                  <div className="process-number">{i + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PRICING — reconstructed ================= */}
        <section className="pricing" id="pricing">
          <div className="container">
            <div className="section-label">PRICING</div>
            <h2 className="section-title">
              Professional websites without the unnecessary complexity.
            </h2>
            <p className="section-description">
              Every project can be customized around your needs. Every project is different, so pricing and payment options are discussed during your consultation.
            </p>

            <div className="pricing-grid">
              <div className="price">
                <h3>Starter</h3>
                <p className="price-description">
                  For a simple professional online presence.
                </p>
                <div className="amount">Discussed in Consultation</div>
                <ul className="features">
                  <li>Professional custom design</li>
                  <li>Mobile responsive layout</li>
                  <li>Core business sections</li>
                  <li>Contact information</li>
                  <li>Basic deployment assistance</li>
                </ul>
                <a href="#contact" className="btn btn-secondary">
                  Get Started
                </a>
              </div>

              <div className="price featured">
                <div className="popular">MOST REQUESTED</div>
                <h3>Professional</h3>
                <p className="price-description">
                  A complete business website built around your brand.
                </p>
                <div className="amount">Discussed in Consultation</div>
                <ul className="features">
                  <li>Custom professional website</li>
                  <li>Mobile &amp; desktop optimization</li>
                  <li>Content sections</li>
                  <li>Photos, videos &amp; social integration</li>
                  <li>Contact / lead forms</li>
                  <li>Domain &amp; deployment assistance</li>
                  <li>Revisions</li>
                </ul>
                <a href="#contact" className="btn btn-primary">
                  Build My Website
                </a>
              </div>

              <div className="price">
                <h3>Custom</h3>
                <p className="price-description">
                  For advanced websites and custom functionality.
                </p>
                <div className="amount">Let's Talk</div>
                <ul className="features">
                  <li>Custom features</li>
                  <li>Advanced functionality</li>
                  <li>Multiple pages</li>
                  <li>Integrations</li>
                  <li>Custom backend needs</li>
                  <li>Project-specific development</li>
                </ul>
                <a href="#contact" className="btn btn-secondary">
                  Request a Quote
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT — reconstructed ================= */}
        <section className="about" id="about">
          <div className="container about-grid">
            <div>
              <div className="section-label">ABOUT NOW FOR LATER</div>
              <h2 className="section-title">
                Your website should work for your business.
              </h2>
              <p className="about-text">
                Now For Later LLC helps businesses, entrepreneurs, creators,
                and professionals establish a strong online presence through
                modern website design and development.
              </p>
              <p className="about-text" style={{ marginTop: "14px" }}>
                The goal is simple: create websites that look professional,
                are easy for customers to use, and give each client a
                digital presence they can be proud of.
              </p>
            </div>

            <div className="about-boxes">
              <div className="about-box">
                <strong>100%</strong>
                <span>Custom-focused design</span>
              </div>
              <div className="about-box">
                <strong>24/7</strong>
                <span>Your website can work for you around the clock</span>
              </div>
              <div className="about-box">
                <strong>Mobile</strong>
                <span>Designed for modern devices</span>
              </div>
              <div className="about-box">
                <strong>Simple</strong>
                <span>Clear communication and process</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ — reconstructed ================= */}
        <section className="faq" id="faq">
          <div className="container">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Questions clients usually ask.</h2>

            <div className="faq-list">
              {[
                {
                  q: "How much does a website cost?",
                  a: "Pricing is customized to the project. We discuss the scope, features, timeline, and investment during your consultation.",
                },
                {
                  q: "Can I split the $1,000 payment?",
                  a: "Yes. Payment options can be discussed during your consultation and structured around the project scope and agreed timeline.",
                },
                {
                  q: "Do you offer website maintenance?",
                  a: "Yes. Ongoing maintenance and individual update options are available and can be discussed during your consultation.",
                },
                {
                  q: "What is included in maintenance?",
                  a: "Reasonable updates can include photos, videos, event dates, text, links, and minor content changes. Major redesigns, new pages, or complex development can require a separate quote.",
                },
                {
                  q: "Will my website work on phones?",
                  a: "Yes. Websites are designed responsively so the layout adapts to phones, tablets, and desktop screens.",
                },
                {
                  q: "Can you help me launch my domain?",
                  a: "Yes. Domain and deployment assistance can be included as part of the project depending on the selected package.",
                },
              ].map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA + CONTACT — reconstructed ================= */}
        <section className="cta" id="contact">
          <div className="container">
            <div className="cta-box">
              <h2>Ready to build a website your customers can remember?</h2>
              <p>
                Tell us what you're looking for and let's talk about your
                project.
              </p>
              <div className="cta-buttons">
                <a href="#contact-form" className="btn btn-primary">
                  Let's Build It
                </a>
                {CONTACT_EMAIL && (
                  <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-secondary">
                    Email Now For Later
                  </a>
                )}
              </div>
            </div>

            <form
              className="contact-form"
              id="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={form.businessName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label htmlFor="projectType">What do you need?</label>
                <select
                  id="projectType"
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                >
                  <option>New Business Website</option>
                  <option>Landing Page</option>
                  <option>Portfolio Website</option>
                  <option>Personal Website</option>
                  <option>Website Updates</option>
                  <option>Custom Website</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="message">Tell us about your project</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send Inquiry"}
              </button>

              {status === "success" && (
                <p className="form-status success">
                  Inquiry received. We'll be in touch.
                </p>
              )}
              {status === "error" && (
                <p className="form-status error">
{errorMessage || "Something went wrong sending your inquiry. Please try again or email us directly."}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* ================= FOOTER — reconstructed ================= */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#home" className="logo footer-logo">
                <span className="logo-mark"></span>
                Now For Later
              </a>
              <p className="footer-description">
                Professional website design and development for businesses,
                entrepreneurs, creators, and professionals.
              </p>
              {(SOCIAL_LINKS.instagram ||
                SOCIAL_LINKS.facebook ||
                SOCIAL_LINKS.linkedin) && (
                <div className="socials">
                  {SOCIAL_LINKS.instagram && (
                    <a
                      href={SOCIAL_LINKS.instagram}
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      IG
                    </a>
                  )}
                  {SOCIAL_LINKS.facebook && (
                    <a
                      href={SOCIAL_LINKS.facebook}
                      aria-label="Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      FB
                    </a>
                  )}
                  {SOCIAL_LINKS.linkedin && (
                    <a
                      href={SOCIAL_LINKS.linkedin}
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LI
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="footer-column">
              <h4>Services</h4>
              <ul>
                <li>
                  <a href="#services">Business Websites</a>
                </li>
                <li>
                  <a href="#services">Landing Pages</a>
                </li>
                <li>
                  <a href="#services">Portfolio Websites</a>
                </li>
                <li>
                  <a href="#services">Custom Websites</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#process">How It Works</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href="#contact">Get Started</a>
                </li>
                {CONTACT_EMAIL && (
                  <li>
                    <a href={`mailto:${CONTACT_EMAIL}`}>Email Us</a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© Now For Later LLC. All rights reserved.</span>
            <span>Professional websites built for what's next.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
