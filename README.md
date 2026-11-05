# Crownland African Safaris — Website

A fast, fully interactive safari website for **Crownland African Safaris**: private Kenya, Tanzania and Uganda safaris.
It is a static site (plain HTML/CSS/JavaScript) with no build step and no server code, so you can host it almost anywhere.

## Features

| Area | What it does |
|---|---|
| **Hero & search** | Ken Burns photo slideshow, animated headline, search by destination, length, budget and interest |
| **27 safaris** | Every itinerary with a day-by-day timeline, an interactive route map, a rate table, inclusions and lodges |
| **Live price calculator** | Per-tour quote by date (low/high season), adults, children and accommodation level, plus the deposit amount |
| **Trip Builder** | Pick parks, nights and style. The route draws on a map, the price updates live, and you get a day-by-day plan and a shareable link |
| **Safari Match quiz** | Five questions that rank every tour with a match percentage |
| **Compare & wishlist** | Compare up to 3 tours side by side; save favourites (stored on the device) and send them by WhatsApp |
| **Explore map** | Satellite, map and street layers, with every park pinned, its best months, its wildlife and the tours that visit it |
| **Great Migration tracker** | Month slider with a "play year" animation that moves the herd across the Serengeti and Mara |
| **Best-time heatmap** | Month-by-month conditions for 9 key destinations |
| **Travel health** | Vaccines, yellow fever rules and malaria advice following CDC/WHO guidance, plus a **malaria tablet planner** that works out first and last dose dates and exports calendar reminders (.ics) |
| **Packing list** | Interactive checklist with a progress bar; printable |
| **Enquiry wizard** | 3-step booking request with a live estimate. Sends by form endpoint, WhatsApp or email |
| **Concierge chat** | Automated assistant for prices, migration, visas, health, gorillas and more, with hand-off to WhatsApp |
| **Extras** | Currency switch (USD/EUR/GBP/KES), dark mode, gallery lightbox, FAQ search, PWA/offline support, SEO metadata, keyboard and screen-reader support, works on mobile |

## Before you go live — edit `js/config.js`

1. **Contact details**: replace the placeholder phone numbers, WhatsApp number (digits only, e.g. `254712345678`), email and address.
2. **Social links**: add your Facebook, Instagram, TikTok, YouTube and TripAdvisor URLs.
3. **Enquiry form**: create a free form at [Formspree](https://formspree.io) (or similar) and paste the endpoint into `formEndpoint` to receive enquiries by email. If it is left empty, enquiries open WhatsApp or the visitor's email app, already filled in.
4. **Payments**: paste your hosted payment link (Pesapal, Flutterwave, DPO, Stripe…) into `paymentLink`.
5. **Currency rates**: update the indicative EUR/GBP/KES rates from time to time.

## Prices

Prices are in USD per person, based on 2 people sharing, and are stored in `js/data.js`.
Where the reference site publishes a rate, it is used **unchanged**:

| Tour | Published rate used |
|---|---|
| 4 Days Lake Nakuru & Masai Mara Migration | $1,485 |
| 4 Days Masai Mara Migration & Lake Nakuru | Mid-range $1,470 / $1,630 · Luxury $2,020 / $2,245 |
| 6 Days Beyond the Plains | $1,730 |
| 6 Days Scenic Masai Mara & Amboseli | Low $4,170 (2 pax) / $3,760 (4 pax) · High $5,150 / $4,709 |
| 7 Days Samburu, Nakuru & Mara | $2,547 |
| 7 Days Luxury Amboseli, Nakuru, Naivasha & Mara | $3,358 |
| Touch of Africa (7 days) | 1 pax $7,296 · 2 pax $4,907 |
| 8 Days Across the Wilderness | Low $3,336 / $2,885 · High $4,176 / $3,725 |
| 10 Days Grand Epic Kenya & Tanzania | Low $4,541 / $3,635 · High $5,142 / $4,236 |
| 10 Days Best of Kenya & Tanzania Lodges | $4,349 |
| 5 Days Uganda Gorillas & Chimps | 2 pax $3,750 · 4 pax $3,325 · 6+ pax $3,150 |
| 6 Days Uganda Luxury Gorillas & Chimps | 2 pax $4,200 · 4 pax $3,725 · 6+ pax $3,550 |

**Please review these estimates.** The reference site shows no price for the tours below, so these are estimates set in line with comparable tours:
4 Days Amboseli & Tsavo West ($1,390), 6 Days Amboseli/Nakuru/Mara ($2,150), 7 Days Amboseli/Nakuru/Mara Migration ($2,390),
7 Days Amboseli/Nakuru/Mara Private ($2,290), 7 Days Bush & Beach Honeymoon ($2,890), 8 Days Samburu/Mt Kenya/Nakuru/Mara ($2,980),
10 Days Combined Kenya & Tanzania ($4,150), 8 Days Nakuru/Mara/Serengeti/Ngorongoro/Amboseli ($3,690), 9 Days Amboseli…Ngorongoro ($3,980),
and the day trips ($65–$165).

The calculator's group-size, season, accommodation and child multipliers are set in `js/config.js` (`groupFactors`, `highSeasonFactor`, `tierFactors`, `childFactor`).
Trip Builder nightly rates are in `js/data.js` (`builderParks`).

## Hosting

Upload the whole folder to any static host:

- **GitHub Pages**: Settings → Pages → deploy from this branch, root folder.
- **Netlify / Vercel / Cloudflare Pages**: import the repo; no build command, and the output directory is `/`.
- **cPanel / shared hosting**: upload all the files to `public_html`.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Project structure

```
index.html              page structure, all views, icon sprite
css/styles.css          design system (light + dark), responsive layout
js/config.js            contact details, currency, pricing rules  ← edit me
js/data.js              tours, destinations, migration, FAQ, health content
js/app.js               router, pricing engine, maps, builder, quiz, chat…
assets/img/             optimised photography
sw.js, manifest.webmanifest   installable / offline support
```

## Photo credits

- Wildlife and landscape photos: [Unsplash](https://unsplash.com) contributors (Unsplash License).
- Mountain gorilla photos: Giles Laurent, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons.
- Lake Nakuru flamingos: Wikimedia Commons, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

You can replace any image in `assets/img/` with your own safari photos; keep the same file names, or update them in `js/data.js`.

## Health content disclaimer

The travel-health section gives general information that follows CDC and WHO guidance. It is not personal medical advice. Review it at least once a year: entry requirements (yellow fever, eTA and e-visas) and permit prices change.
