/* =========================================================================
   CROWNLAND AFRICAN SAFARIS — SITE CONFIGURATION
   Edit this file to change contact details, currency rates and integrations.
   ========================================================================= */
window.CROWNLAND_CONFIG = {
  brand: "Crownland African Safaris",
  shortBrand: "Crownland",
  tagline: "Royal journeys through wild Africa",

  // ---- CONTACT DETAILS (REPLACE WITH YOUR REAL DETAILS) -----------------
  phonePrimary: "+254 115 905626",
  phoneSecondary: "",                  // optional second number (leave empty to hide)
  whatsapp: "254115905626",            // international format, digits only
  email: "info@crownlandsafaris.com",
  address: "Nairobi, Kenya",
  officeHours: "Mon – Sat · 8:00 – 18:00 EAT",
  social: {
    facebook: "#",
    instagram: "#",
    tiktok: "#",
    youtube: "#",
    tripadvisor: "#"
  },

  // ---- ENQUIRY FORM ------------------------------------------------------
  // Paste a form endpoint (e.g. Formspree "https://formspree.io/f/xxxx") to
  // receive enquiries by email. Left empty, enquiries are handed to WhatsApp
  // or the visitor's email app so nothing is ever lost.
  formEndpoint: "",

  // ---- ONLINE PAYMENT ----------------------------------------------------
  // Link to your hosted payment page (Pesapal, Flutterwave, Stripe, DPO ...).
  paymentLink: "",
  depositPercent: 30,

  // ---- CURRENCY ----------------------------------------------------------
  // Prices are stored in USD. Rates below are indicative only; update them
  // periodically. Final invoices are always issued in USD.
  currencies: {
    USD: { symbol: "$", rate: 1 },
    EUR: { symbol: "€", rate: 0.92 },
    GBP: { symbol: "£", rate: 0.78 },
    KES: { symbol: "KSh ", rate: 129 }
  },

  // ---- PRICING ENGINE ----------------------------------------------------
  // Multipliers applied to the "2 people sharing" base price when a tour has
  // no explicit rate table for that group size / season.
  groupFactors: { 1: 1.48, 2: 1, 3: 0.94, 4: 0.88, 5: 0.84, 6: 0.82, 7: 0.79 },
  highSeasonMonths: [7, 8, 9, 10, 12],  // Jul–Oct + December
  highSeasonFactor: 1.15,
  tierFactors: { budget: 0.74, midrange: 1, luxury: 1.42 },
  childFactor: 0.6                        // children 3–11 sharing with adults
};
