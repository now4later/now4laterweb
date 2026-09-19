// Public-facing site config. These are NEXT_PUBLIC_ vars because they're
// used directly in the homepage markup (footer, CTA email button).
// Anything left unset is simply omitted from the page rather than shown
// as a broken or fake link.

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;

export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || null,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
};
