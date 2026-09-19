// Generates the exact agreement text shown to a client for signing.
// IMPORTANT: this is a plain-language draft template, not attorney-reviewed
// legal language. See README "Agreement & signature workflow" section.
//
// Because the exact text is stored on the Agreement row at creation time
// (and hashed again at signing time), editing this function only affects
// agreements created after the edit — past signed agreements keep the
// exact wording the client actually agreed to.

export function generateAgreementText({ clientName, businessName, date }) {
  const who = businessName ? `${clientName} (${businessName})` : clientName;

  return `NOW4LATERWEB — WEBSITE DEVELOPMENT AGREEMENT
Prepared for: ${who}
Date prepared: ${date}

This is a plain-language service agreement between Now For Later LLC
("NOW4LATERWEB", "we", "us") and ${who} ("Client", "you") for the design and
development of one website, as described below.

1. SCOPE OF WORK
NOW4LATERWEB will design and build one professional website for Client,
consisting of custom design, mobile-responsive layout, core content
sections, and a contact/lead form, as discussed between the parties prior
to this agreement. Specific pages, features, and content are to be agreed
in writing (email or the update-request system) before or during the
project. Work outside this scope — major redesigns, additional pages beyond
what was discussed, complex custom functionality, or e-commerce — is not
included and will be quoted separately.

2. PROJECT PRICE
The total price for this website project is $1,000.00 USD.

3. PAYMENT OPTIONS
Client selects one of the following payment options at the time of
signing:
  (a) Payment in Full — $1,000.00 due at signing.
  (b) Split Payment — $500.00 due at signing, and the remaining $500.00 due
      by the payment deadline agreed between the parties, and in all cases
      before final website delivery and launch.
The option selected by Client below becomes part of this agreement.

4. REVISIONS
A reasonable number of revisions to the initial design are included as
part of the project price, as discussed between the parties. Requests that
substantially change the original scope may require a separate quote.

5. TIMELINE
NOW4LATERWEB will work with Client to establish a reasonable project
timeline. Delays caused by late content, late feedback, or late payment
from Client may extend the delivery date accordingly.

6. OWNERSHIP
Upon full payment, Client owns the final website content and design as
delivered. NOW4LATERWEB retains the right to display the completed project
in its own portfolio unless Client requests otherwise in writing.

7. MAINTENANCE (AFTER LAUNCH)
This agreement covers the initial website build only. Ongoing maintenance
and update requests after launch are handled separately, under either the
$100/month maintenance plan or the $100 per-update pay-as-needed option,
as described on the NOW4LATERWEB website and selected by Client at that
time.

8. TERMINATION
Either party may end this agreement in writing before project completion.
Client is responsible for payment for work already completed at the time
of termination; any deposit already paid is non-refundable to the extent
work has already been performed.

9. LIMITATION OF LIABILITY
NOW4LATERWEB's total liability under this agreement is limited to the
amount paid by Client under this agreement. NOW4LATERWEB is not liable for
indirect or consequential damages arising from use of the website.

10. ELECTRONIC SIGNATURES
Client agrees that typing their full legal name below and clicking
"I Agree & Sign" constitutes Client's electronic signature on this
agreement, and that this electronic signature is intended to have the same
legal effect as a handwritten signature, consistent with the U.S.
Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and
applicable state law. NOW4LATERWEB will retain a record of this signature
event, including the signer's name, email address, the exact text of this
agreement as signed, a timestamp, and technical identifying information
(such as IP address and browser), for its records.

This document is a plain-language service agreement prepared by
NOW4LATERWEB and has not been reviewed by an attorney. It is not a
substitute for legal advice. Either party may have this agreement reviewed
by their own legal counsel before signing.
`;
}
