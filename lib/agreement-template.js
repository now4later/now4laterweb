// Generates the exact agreement text shown to a client for signing.
// Plain-language business agreement; not attorney-reviewed.
// Past signed agreements retain their exact stored wording.

function formatDate(value) {
  if (!value) return "To be confirmed";
  return new Date(value + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateAgreementText({ clientName, businessName, date, paymentDates = [] }) {
  const who = businessName ? `${clientName} (${businessName})` : clientName;
  const dates = Array.from({ length: 5 }, (_, i) => paymentDates[i] || null);

  return `NOW4LATERWEB — WEBSITE DEVELOPMENT & MAINTENANCE AGREEMENT
Prepared for: ${who}
Date prepared: ${date}

This plain-language service agreement is between Now For Later LLC
("NOW4LATERWEB", "we", "us") and ${who} ("Client", "you") for the design,
development, launch, and ongoing update/maintenance services described below.

1. SCOPE OF WEBSITE WORK
NOW4LATERWEB will design and build one professional website for Client,
including custom design, mobile-responsive layout, core content sections,
photos/videos supplied by Client, social/contact links, and a contact or
lead form as discussed between the parties. Work outside the agreed scope,
including major redesigns, additional pages, advanced custom functionality,
e-commerce, or substantial new development, will be quoted separately.

2. TOTAL PROJECT PRICE
The total website project price is $1,000.00 USD.

3. PAYMENT PLAN — FIVE $200 PAYMENTS
Client may satisfy the $1,000.00 project price through five payments of
$200.00 each. The payment schedule is:

Payment 1 — $200.00 — due ${formatDate(dates[0])}
Payment 2 — $200.00 — due ${formatDate(dates[1])}
Payment 3 — $200.00 — due ${formatDate(dates[2])}
Payment 4 — $200.00 — due ${formatDate(dates[3])}
Payment 5 — $200.00 — due ${formatDate(dates[4])}

All five payments together equal $1,000.00. The parties may agree in
writing to adjust a due date before that payment becomes due.

4. PAYMENT DEFAULT / WEBSITE STATUS
Payments must be received by their scheduled due dates. If a payment is
not properly received, the account will be considered past due. After
notice of the missed payment, NOW4LATERWEB may suspend website services,
hosting-related services, maintenance, and/or website availability until
the account is brought current. If the required payment remains unpaid,
NOW4LATERWEB may terminate the website service agreement and website
availability due to insufficient funds. Reinstatement or additional work
after termination may require payment of the outstanding balance and any
separately quoted fees.

5. REVISIONS
A reasonable number of revisions to the initial design are included as
part of the project price. Requests that substantially change the original
scope may require a separate quote.

6. PROJECT TIMELINE
NOW4LATERWEB will work with Client on a reasonable project timeline.
Delays caused by late content, late feedback, or late payment may extend
the delivery or launch timeline.

7. OWNERSHIP
Upon full payment of the $1,000.00 project balance, Client owns the final
website content and design as delivered. NOW4LATERWEB may display the
completed project in its portfolio unless Client requests otherwise in
writing.

8. MANAGEMENT & MAINTENANCE
Ongoing website management is separate from the $1,000.00 build price.
Client may choose either:
• $75.00 per individual update request; OR
• $75.00 per month for ongoing website maintenance and management.

Maintenance may include reasonable updates to text/information, photos,
videos, events and dates, links, contact information, and minor website
section changes. Major redesigns, new pages, advanced functionality, or
substantial development are quoted separately.

9. CLIENT CONTENT & THIRD-PARTY SERVICES
Client is responsible for providing accurate content, photos, videos,
logos, links, and other materials needed for the website. Domain names,
hosting, third-party platforms, payment processors, email services, and
other third-party charges are not included unless specifically stated in
writing.

10. TERMINATION
Either party may end this agreement in writing. Client remains responsible
for amounts due for work performed and unpaid amounts under this agreement.
Termination for nonpayment is addressed in Section 4.

11. LIMITATION OF LIABILITY
NOW4LATERWEB's total liability under this agreement is limited to the
amount actually paid by Client under this agreement. NOW4LATERWEB is not
liable for indirect or consequential damages arising from use of the
website.

12. ELECTRONIC SIGNATURES
Client agrees that typing their full legal name and clicking "I Agree &
Sign" constitutes Client's electronic signature on this agreement. The
signature is intended to have the same legal effect as a handwritten
signature, consistent with applicable electronic-signature law. NOW4LATERWEB
will retain the signed agreement text, signature information, timestamp,
and technical identifying information such as IP address and browser.

This document is a plain-language service agreement prepared by
NOW4LATERWEB and has not been reviewed by an attorney. Either party may
have this agreement reviewed by their own legal counsel before signing.
`;
}
