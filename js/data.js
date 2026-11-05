/* =========================================================================
   CROWNLAND SAFARIS TOUR — CONTENT DATA
   Tours, destinations, wildlife, FAQs. Prices are USD per person.
   ========================================================================= */
(function () {
  const IMG = "assets/img/";

  /* ---------------- DESTINATIONS ---------------- */
  // best: suitability rating per month Jan..Dec (3 = excellent, 2 = good, 1 = rainy / low)
  const places = {
    nairobi:   { name: "Nairobi", country: "Kenya", lat: -1.2864, lng: 36.8172, img: "elephant-plains.jpg", type: "city",
                 blurb: "The only capital city with a national park on its doorstep. Your safari starts and ends here.",
                 wildlife: ["Giraffe", "Rhino", "Lion", "Orphaned elephants"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    mara:      { name: "Masai Mara", country: "Kenya", lat: -1.4900, lng: 35.1400, img: "lion-walk.jpg", type: "park",
                 blurb: "Kenya's most celebrated reserve — rolling golden plains, big cats on every horizon and the Great Migration's dramatic river crossings from July to October.",
                 wildlife: ["Lion", "Leopard", "Cheetah", "Wildebeest", "Hippo", "Elephant"], best: [3,3,2,1,1,2,3,3,3,3,2,2] },
    amboseli:  { name: "Amboseli", country: "Kenya", lat: -2.6527, lng: 37.2606, img: "kilimanjaro.jpg", type: "park",
                 blurb: "Huge elephant families walking beneath snow‑capped Mount Kilimanjaro — the most photographed view in East Africa.",
                 wildlife: ["Elephant", "Buffalo", "Hippo", "Flamingo", "Lion"], best: [3,3,2,1,1,3,3,3,3,3,2,2] },
    nakuru:    { name: "Lake Nakuru", country: "Kenya", lat: -0.3667, lng: 36.0833, img: "flamingos-nakuru.jpg", type: "park",
                 blurb: "A Rift Valley soda lake ringed by acacia woodland — a rhino sanctuary famous for flamingos, pelicans and tree‑climbing lions.",
                 wildlife: ["Black rhino", "White rhino", "Flamingo", "Rothschild giraffe", "Leopard"], best: [3,3,3,2,2,3,3,3,3,3,2,3] },
    naivasha:  { name: "Lake Naivasha", country: "Kenya", lat: -0.7667, lng: 36.4333, img: "giraffe.jpg", type: "lake",
                 blurb: "A freshwater lake of hippos and fish eagles, with boat rides and walking safaris among giraffe and zebra on Crescent Island.",
                 wildlife: ["Hippo", "Fish eagle", "Giraffe", "Zebra"], best: [3,3,3,2,2,3,3,3,3,3,2,3] },
    samburu:   { name: "Samburu", country: "Kenya", lat: 0.6000, lng: 37.5333, img: "antelope.jpg", type: "park",
                 blurb: "Rugged northern drylands along the Ewaso Nyiro river, home to the 'Samburu Special Five' found nowhere else on the classic circuit.",
                 wildlife: ["Grevy's zebra", "Reticulated giraffe", "Gerenuk", "Beisa oryx", "Somali ostrich", "Leopard"], best: [3,3,2,1,1,3,3,3,3,2,1,2] },
    meru:      { name: "Meru", country: "Kenya", lat: 0.0833, lng: 38.2000, img: "rhino.jpg", type: "park",
                 blurb: "Wild, uncrowded and lush — the land of Joy Adamson's 'Born Free', with a rhino sanctuary and palm‑lined rivers.",
                 wildlife: ["Rhino", "Lion", "Elephant", "Lesser kudu"], best: [3,3,2,1,1,3,3,3,3,2,1,2] },
    olpejeta:  { name: "Ol Pejeta", country: "Kenya", lat: 0.0000, lng: 36.9000, img: "rhino.jpg", type: "conservancy",
                 blurb: "Conservancy on the equator below Mt Kenya: East Africa's largest black rhino sanctuary and a chimpanzee sanctuary.",
                 wildlife: ["Black rhino", "Chimpanzee", "Lion", "Elephant"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    mtkenya:   { name: "Mount Kenya", country: "Kenya", lat: -0.1521, lng: 37.3084, img: "hiking.jpg", type: "mountain",
                 blurb: "Africa's second highest mountain — misty forests, tree‑hotel night viewing and cool highland air.",
                 wildlife: ["Elephant", "Buffalo", "Colobus monkey"], best: [3,3,2,1,1,2,3,3,3,2,1,2] },
    tsavoeast: { name: "Tsavo East", country: "Kenya", lat: -2.9000, lng: 38.7000, img: "elephant-plains.jpg", type: "park",
                 blurb: "Vast red‑earth wilderness famous for dust‑red elephants, the Galana river and the Lugard Falls.",
                 wildlife: ["Red elephant", "Lion", "Lesser kudu", "Fringe-eared oryx"], best: [3,3,2,1,1,3,3,3,3,3,2,2] },
    tsavowest: { name: "Tsavo West", country: "Kenya", lat: -3.0500, lng: 38.0600, img: "leopard.jpg", type: "park",
                 blurb: "Volcanic hills and lava flows, crystal Mzima Springs with underwater hippo viewing and a rhino sanctuary.",
                 wildlife: ["Hippo", "Crocodile", "Black rhino", "Leopard"], best: [3,3,2,1,1,3,3,3,3,3,2,2] },
    taita:     { name: "Taita Hills", country: "Kenya", lat: -3.5300, lng: 38.2700, img: "buffalo-sunset.jpg", type: "sanctuary",
                 blurb: "A private sanctuary between the Tsavos, best known for its waterhole lodge built on stilts.",
                 wildlife: ["Elephant", "Buffalo", "Lion"], best: [3,3,2,1,1,3,3,3,3,3,2,2] },
    diani:     { name: "Diani Beach", country: "Kenya", lat: -4.3167, lng: 39.5667, img: "beach.jpg", type: "beach",
                 blurb: "Powder‑white sand, coral reefs and turquoise Indian Ocean — the perfect bush‑and‑beach finale.",
                 wildlife: ["Dolphins", "Sea turtles", "Colobus monkey"], best: [3,3,3,1,1,2,2,3,3,3,2,3] },
    hellsgate: { name: "Hell's Gate", country: "Kenya", lat: -0.9000, lng: 36.3200, img: "zebra.jpg", type: "park",
                 blurb: "Cycle or walk among zebra and giraffe through dramatic gorges and towering cliffs.",
                 wildlife: ["Zebra", "Giraffe", "Klipspringer", "Vultures"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    longonot:  { name: "Mount Longonot", country: "Kenya", lat: -0.9140, lng: 36.4460, img: "hiking.jpg", type: "mountain",
                 blurb: "A dormant volcano with a forested crater — the Rift Valley's most rewarding day hike.",
                 wildlife: ["Zebra", "Giraffe", "Buffalo"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    serengeti: { name: "Serengeti", country: "Tanzania", lat: -2.3333, lng: 34.8333, img: "savanna-sunset.jpg", type: "park",
                 blurb: "'Endless plains' — the stage for the year‑round Great Migration and Africa's highest density of large predators.",
                 wildlife: ["Wildebeest", "Lion", "Cheetah", "Leopard", "Hyena"], best: [3,3,2,1,1,3,3,3,3,2,2,3] },
    ngorongoro:{ name: "Ngorongoro Crater", country: "Tanzania", lat: -3.2000, lng: 35.5000, img: "lionesses.jpg", type: "crater",
                 blurb: "The world's largest intact volcanic caldera — a natural amphitheatre holding roughly 25,000 large animals.",
                 wildlife: ["Black rhino", "Lion", "Flamingo", "Buffalo", "Hyena"], best: [3,3,2,1,2,3,3,3,3,3,2,3] },
    tarangire: { name: "Tarangire", country: "Tanzania", lat: -3.8333, lng: 36.0000, img: "elephants-pair.jpg", type: "park",
                 blurb: "Ancient baobabs and some of Tanzania's largest elephant herds gathering on the Tarangire river.",
                 wildlife: ["Elephant", "Python", "Lion", "Tree-climbing lion"], best: [2,2,2,1,1,3,3,3,3,3,2,2] },
    manyara:   { name: "Lake Manyara", country: "Tanzania", lat: -3.6000, lng: 35.8167, img: "flamingo.jpg", type: "park",
                 blurb: "Groundwater forest, baboon troops and a shimmering soda lake beneath the Rift escarpment.",
                 wildlife: ["Baboon", "Flamingo", "Elephant", "Tree-climbing lion"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    arusha:    { name: "Arusha", country: "Tanzania", lat: -3.3869, lng: 36.6830, img: "giraffe-sunset.jpg", type: "city",
                 blurb: "Tanzania's safari capital at the foot of Mount Meru — gateway to the northern circuit.",
                 wildlife: ["Colobus monkey", "Giraffe"], best: [3,3,2,1,1,3,3,3,3,3,2,3] },
    entebbe:   { name: "Entebbe", country: "Uganda", lat: 0.0512, lng: 32.4637, img: "elephant-forest.jpg", type: "city",
                 blurb: "Uganda's gateway on the shores of Lake Victoria.",
                 wildlife: ["Shoebill (nearby)", "Birdlife"], best: [3,3,2,1,1,3,3,3,2,2,1,3] },
    kibale:    { name: "Kibale Forest", country: "Uganda", lat: 0.4833, lng: 30.4000, img: "gorilla-tree.jpg", type: "forest",
                 blurb: "The primate capital of the world — home to some 1,500 chimpanzees and 12 other primate species.",
                 wildlife: ["Chimpanzee", "Red colobus", "L'Hoest's monkey"], best: [3,3,2,1,1,3,3,3,2,2,1,3] },
    bwindi:    { name: "Bwindi Impenetrable", country: "Uganda", lat: -1.0333, lng: 29.7000, img: "gorilla.jpg", type: "forest",
                 blurb: "UNESCO‑listed montane rainforest sheltering almost half of the world's remaining mountain gorillas.",
                 wildlife: ["Mountain gorilla", "Forest elephant", "L'Hoest's monkey"], best: [3,3,2,1,1,3,3,3,2,2,1,3] }
  };

  /* ---------------- TOURS ----------------
     price      = base price per person, 2 people sharing (USD)
     rates      = explicit published rate table (overrides engine)
     seasonal   = apply high season factor (only where no fixed published rate)
     tiers      = whether accommodation level can be changed in the calculator
  */
  const STD_INC = ["Private 4x4 Land Cruiser with pop-up roof", "Professional English-speaking driver-guide", "Accommodation as listed (full board on safari)", "All park & conservancy entry fees", "Game drives as per itinerary", "Bottled drinking water in the vehicle", "Airport / hotel transfers in Nairobi", "Flying Doctors evacuation cover (on request)"];
  const STD_EXC = ["International flights & visas", "Travel insurance", "Tips & gratuities (guide: approx. US$10–15 pp/day)", "Drinks & items of a personal nature", "Optional activities (balloon safari, Maasai village visit)"];

  const tours = [
    /* ---------------- KENYA ---------------- */
    { id: "4-days-nakuru-mara-migration", cat: "kenya", title: "4 Days Lake Nakuru & Masai Mara Migration Safari",
      days: 4, price: 1485, seasonal: false, img: "lion-walk.jpg", gallery: ["flamingos-nakuru.jpg", "lionesses.jpg", "zebra.jpg"],
      route: ["nairobi", "nakuru", "mara", "nairobi"], badge: "Best seller", tags: ["migration", "bigfive", "short", "rhino", "value"],
      summary: "Our most popular short safari: rhinos and flamingos at Lake Nakuru, then two days of big-cat country in the Masai Mara.",
      highlights: ["Black & white rhino at Lake Nakuru", "Full day in the Masai Mara", "Great Migration (Jul–Oct)", "Optional sunrise balloon safari"],
      stay: ["Lake Nakuru Lodge", "Sentrim Mara Camp"],
      itinerary: [
        { t: "Nairobi – Lake Nakuru National Park", d: "Morning pick-up and scenic drive down the Great Rift Valley escarpment. Afternoon game drive tracking rhino, Rothschild giraffe and lakeshore flamingos." },
        { t: "Lake Nakuru – Masai Mara", d: "Drive west across Maasai country, arriving for lunch. Afternoon game drive as the light turns gold over the plains." },
        { t: "Full day Masai Mara", d: "Dawn-to-dusk game viewing with a picnic lunch by the Mara River. July–October: watch for wildebeest crossings. Optional hot-air balloon at sunrise (approx. US$450 pp)." },
        { t: "Masai Mara – Nairobi", d: "Final early morning game drive, breakfast, then return to Nairobi for drop-off at your hotel or the airport." }
      ] },

    { id: "4-days-mara-migration-nakuru", cat: "kenya", title: "4 Days Masai Mara Migration & Lake Nakuru Safari",
      days: 4, price: 1470, img: "buffalo-sunset.jpg", gallery: ["lion-face.jpg", "flamingos-nakuru.jpg", "rhino.jpg"],
      route: ["nairobi", "mara", "nakuru", "nairobi"], tags: ["migration", "bigfive", "short", "rhino", "luxury"],
      tierRates: { midrange: { low: 1470, high: 1630 }, luxury: { low: 2020, high: 2245 } }, seasonNote: "Low: Jan – Jun · High: Jul – Dec",
      summary: "Head straight for the Mara for two nights of big game, then finish among the rhinos and birdlife of Lake Nakuru. Choose mid-range or luxury lodges.",
      highlights: ["Two nights in the Masai Mara", "Mara River crossings (seasonal)", "Rhino tracking at Lake Nakuru", "Mid-range or luxury lodges"],
      stay: ["Mara camp or lodge (by level)", "Lake Nakuru lodge (by level)"],
      itinerary: [
        { t: "Nairobi – Masai Mara", d: "Early departure via the Rift Valley viewpoint. Arrive for lunch and an afternoon game drive." },
        { t: "Full day Masai Mara", d: "A full day following lion prides, cheetah and the herds, with a picnic lunch at the hippo pools." },
        { t: "Masai Mara – Lake Nakuru", d: "Morning drive in the Mara, then transfer to Lake Nakuru for an afternoon game drive." },
        { t: "Lake Nakuru – Nairobi", d: "Sunrise game drive to Baboon Cliff viewpoint before returning to Nairobi." }
      ] },

    { id: "4-days-amboseli-tsavo-west", cat: "kenya", title: "4 Days Amboseli & Tsavo West Private Safari",
      days: 4, price: 1390, seasonal: true, img: "elephants-pair.jpg", gallery: ["kilimanjaro.jpg", "elephant.jpg", "leopard.jpg"],
      route: ["nairobi", "amboseli", "tsavowest", "nairobi"], tags: ["elephants", "kilimanjaro", "short", "value"],
      summary: "Elephants beneath Kilimanjaro, then the volcanic landscapes and crystal springs of Tsavo West.",
      highlights: ["Kilimanjaro views (weather permitting)", "Observation Hill, Amboseli", "Mzima Springs hippos", "Shetani lava flow"],
      stay: ["Amboseli lodge", "Tsavo West lodge"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive south to Amboseli, arriving for lunch. Afternoon game drive through the swamps where elephant families gather." },
        { t: "Amboseli – Tsavo West", d: "Sunrise drive for Kilimanjaro views, then continue to Tsavo West across the Chyulu foothills." },
        { t: "Full day Tsavo West", d: "Visit Mzima Springs, the Shetani lava flow and the Ngulia rhino sanctuary." },
        { t: "Tsavo West – Nairobi", d: "Morning game drive and return to Nairobi." }
      ] },

    { id: "6-days-beyond-the-plains", cat: "kenya", title: "6 Days Beyond the Plains: Tsavo East, Amboseli, Tsavo West & Taita Hills",
      days: 6, price: 1730, seasonal: false, img: "elephant-plains.jpg", gallery: ["kilimanjaro.jpg", "buffalo-sunset.jpg", "leopard.jpg"],
      route: ["diani", "tsavoeast", "amboseli", "tsavowest", "taita", "diani"], tags: ["elephants", "kilimanjaro", "value", "beach"],
      summary: "A coast-based circuit through southern Kenya's great wildernesses — perfect if you are holidaying on the beach.",
      highlights: ["Red elephants of Tsavo East", "Kilimanjaro from Amboseli", "Mzima Springs", "Stilted lodge at Taita Hills"],
      stay: ["Tsavo East lodge", "Amboseli lodge", "Tsavo West lodge", "Taita Hills lodge"],
      itinerary: [
        { t: "Coast – Tsavo East", d: "Pick-up from your coast hotel and drive to Tsavo East for an afternoon game drive along the Galana river." },
        { t: "Tsavo East – Amboseli", d: "Morning game drive then continue west to Amboseli for sunset views of Kilimanjaro." },
        { t: "Full day Amboseli", d: "Observation Hill, the swamps and the great tuskers of Amboseli." },
        { t: "Amboseli – Tsavo West", d: "Drive to Tsavo West; afternoon visit to Mzima Springs to see hippos and crocodiles." },
        { t: "Tsavo West – Taita Hills", d: "Game drive en route to Taita Hills sanctuary; evening at the waterhole." },
        { t: "Taita Hills – Coast", d: "Early game drive and return to your coast hotel." }
      ] },

    { id: "6-days-scenic-mara-amboseli", cat: "kenya", title: "6 Days Kenya Scenic Safari: Masai Mara & Amboseli",
      days: 6, price: 4170, img: "lion-cub.jpg", gallery: ["kilimanjaro.jpg", "giraffe-sunset.jpg", "elephants-pair.jpg"],
      route: ["nairobi", "mara", "amboseli", "nairobi"], badge: "Premium", tags: ["migration", "bigfive", "kilimanjaro", "luxury", "honeymoon"],
      rates: { low: { 2: 4170, 4: 3760 }, high: { 2: 5150, 4: 4709 } }, seasonNote: "Low season / High season (Jul–Oct & Dec)",
      summary: "Three unhurried nights in the Masai Mara and two beneath Kilimanjaro in Amboseli — Kenya's two icons, in style.",
      highlights: ["3 nights in the Masai Mara", "Mara River hippo pools", "Kilimanjaro views", "Premium bush camps"],
      stay: ["Mara bush camp", "Amboseli premium lodge"],
      itinerary: [
        { t: "Nairobi – Masai Mara", d: "Scenic road or optional flight to the Mara; afternoon game drive." },
        { t: "Full day Masai Mara", d: "Full day with picnic lunch at the Mara River hippo pools and crocodile banks." },
        { t: "Full day Masai Mara", d: "Morning and afternoon drives searching for the Big Five; optional Maasai village visit." },
        { t: "Masai Mara – Amboseli", d: "Travel to Amboseli via Nairobi, arriving for sunset over Kilimanjaro." },
        { t: "Full day Amboseli", d: "Elephant herds, Observation Hill and the Enkongo Narok swamp." },
        { t: "Amboseli – Nairobi", d: "Breakfast and return to Nairobi." }
      ] },

    { id: "6-days-amboseli-nakuru-mara", cat: "kenya", title: "6 Days Amboseli, Lake Nakuru & Masai Mara Private Safari",
      days: 6, price: 2150, seasonal: true, img: "giraffe-sunset.jpg", gallery: ["kilimanjaro.jpg", "flamingos-nakuru.jpg", "lion-walk.jpg"],
      route: ["nairobi", "amboseli", "nakuru", "mara", "nairobi"], tags: ["migration", "bigfive", "kilimanjaro", "rhino", "family"],
      summary: "Kenya's classic triangle in under a week — Kilimanjaro's elephants, Nakuru's rhinos and the Mara's predators.",
      highlights: ["Kenya's three most-loved parks", "Kilimanjaro backdrop", "Rhino sanctuary", "Big-cat country"],
      stay: ["Amboseli lodge", "Lake Nakuru lodge", "Masai Mara camp"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Depart around 08:00 and drive south to Amboseli for an afternoon game drive." },
        { t: "Full day Amboseli", d: "Morning and afternoon game drives among elephant herds with Kilimanjaro as backdrop." },
        { t: "Amboseli – Lake Nakuru", d: "Drive north to the Rift Valley and Lake Nakuru, arriving for a late game drive." },
        { t: "Lake Nakuru – Masai Mara", d: "Morning rhino search, then on to the Mara for an afternoon drive." },
        { t: "Full day Masai Mara", d: "A full day following lion, cheetah and the herds." },
        { t: "Masai Mara – Nairobi", d: "Breakfast and return to Nairobi." }
      ] },

    { id: "7-days-samburu-nakuru-mara", cat: "kenya", title: "7 Days Samburu, Lake Nakuru & Masai Mara Migration Safari",
      days: 7, price: 2547, seasonal: false, img: "antelope.jpg", gallery: ["leopard-tree.jpg", "flamingos-nakuru.jpg", "lion-cub.jpg"],
      route: ["nairobi", "samburu", "nakuru", "mara", "nairobi"], tags: ["migration", "bigfive", "rhino", "rare"],
      summary: "From the arid north's rare species to the southern plains' great herds — Kenya's full spectrum of wildlife.",
      highlights: ["Samburu Special Five", "Equator crossing", "Rhinos at Nakuru", "Two full days in the Mara"],
      stay: ["Samburu Sopa Lodge", "Lake Nakuru Sopa Lodge", "Masai Mara Sopa Lodge"],
      itinerary: [
        { t: "Nairobi – Samburu", d: "Drive north past Mt Kenya and across the equator to Samburu; afternoon game drive." },
        { t: "Full day Samburu", d: "Track Grevy's zebra, reticulated giraffe, gerenuk and Beisa oryx along the Ewaso Nyiro." },
        { t: "Samburu – Lake Nakuru", d: "Travel to the Rift Valley via Nyahururu's Thomson's Falls." },
        { t: "Lake Nakuru – Masai Mara", d: "Morning game drive at Nakuru then continue to the Mara." },
        { t: "Full day Masai Mara", d: "Full-day game drive with picnic lunch." },
        { t: "Full day Masai Mara", d: "Second full day — the Mara River and migration herds in season." },
        { t: "Masai Mara – Nairobi", d: "Breakfast and return to Nairobi." }
      ] },

    { id: "7-days-amboseli-nakuru-mara-migration", cat: "kenya", title: "7 Days Amboseli, Lake Nakuru & Masai Mara Migration Safari",
      days: 7, price: 2390, seasonal: true, img: "zebra.jpg", gallery: ["kilimanjaro.jpg", "rhino.jpg", "buffalo-sunset.jpg"],
      route: ["nairobi", "amboseli", "nakuru", "mara", "nairobi"], tags: ["migration", "bigfive", "kilimanjaro", "rhino", "family"],
      summary: "Time your trip with the Great Migration: three nights in the Masai Mara to maximise your chance of a river crossing.",
      highlights: ["3 nights in the Masai Mara", "Mara River crossings (Jul–Oct)", "Large elephant herds", "Flamingos & rhinos"],
      stay: ["Amboseli lodge", "Lake Nakuru lodge", "Mara Maisha Camp"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive south to Amboseli; afternoon game drive." },
        { t: "Full day Amboseli", d: "Elephants, buffalo and Kilimanjaro views; optional Maasai cultural visit." },
        { t: "Amboseli – Lake Nakuru", d: "Travel to the Rift Valley; late afternoon game drive." },
        { t: "Lake Nakuru – Masai Mara", d: "Morning game drive then on to the Mara." },
        { t: "Full day Masai Mara", d: "Full day exploring with picnic lunch." },
        { t: "Full day Masai Mara", d: "Head to the Mara River to wait for crossings in season." },
        { t: "Masai Mara – Nairobi", d: "Breakfast and return to Nairobi." }
      ] },

    { id: "7-days-amboseli-nakuru-mara-private", cat: "kenya", title: "7 Days Amboseli, Lake Nakuru & Masai Mara Private Tour",
      days: 7, price: 2290, seasonal: true, img: "elephant.jpg", gallery: ["flamingos-nakuru.jpg", "lion-face.jpg", "giraffe.jpg"],
      route: ["nairobi", "amboseli", "nakuru", "mara", "nairobi"], tags: ["bigfive", "kilimanjaro", "rhino", "family", "value"],
      summary: "A relaxed-pace private tour of Kenya's three most picturesque regions with plenty of time to photograph the Big Five.",
      highlights: ["Private vehicle & guide", "Relaxed pace", "Big Five opportunities", "Optional balloon safari"],
      stay: ["Amboseli lodge", "Lake Nakuru lodge", "Masai Mara camp"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Depart Nairobi and drive to Amboseli for lunch and an afternoon drive." },
        { t: "Amboseli National Park", d: "Full day of game viewing in the park's swamps and plains." },
        { t: "Amboseli – Lake Nakuru", d: "Drive to Lake Nakuru National Park." },
        { t: "Lake Nakuru – Masai Mara", d: "Game drive at Nakuru then continue to the Mara." },
        { t: "Masai Mara", d: "Full day in the reserve." },
        { t: "Masai Mara", d: "Optional dawn balloon flight followed by a champagne bush breakfast." },
        { t: "Masai Mara – Nairobi", d: "Return to Nairobi." }
      ] },

    { id: "7-days-luxury-amboseli-nakuru-naivasha-mara", cat: "kenya", title: "7 Days Amboseli, Nakuru, Naivasha & Masai Mara Luxury Safari",
      days: 7, price: 3358, seasonal: false, defaultTier: "luxury", img: "leopard.jpg", gallery: ["kilimanjaro.jpg", "giraffe.jpg", "lion-walk.jpg"],
      route: ["nairobi", "amboseli", "nakuru", "naivasha", "mara", "nairobi"], badge: "Luxury", tags: ["luxury", "bigfive", "kilimanjaro", "honeymoon", "rhino"],
      summary: "Four landscapes, four exceptional lodges — Kilimanjaro, Rift Valley lakes and the Mara in refined comfort.",
      highlights: ["Luxury lodges throughout", "Boat ride on Lake Naivasha", "Kilimanjaro sunrise", "Mara big-cat drives"],
      stay: ["Amboseli luxury lodge", "Lake Nakuru luxury lodge", "Naivasha lakeside resort", "Mara luxury tented camp"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive to Amboseli for lunch and an afternoon game drive." },
        { t: "Full day Amboseli", d: "Full day among the elephants of Amboseli." },
        { t: "Amboseli – Lake Nakuru", d: "Transfer to Lake Nakuru; afternoon game drive." },
        { t: "Lake Nakuru – Lake Naivasha", d: "Morning drive, then a short transfer to Naivasha and a boat ride among hippos." },
        { t: "Lake Naivasha – Masai Mara", d: "Drive into the Mara in time for lunch and an afternoon drive." },
        { t: "Full day Masai Mara", d: "Full day exploring — wildebeest migration Jul–Sep." },
        { t: "Masai Mara – Nairobi", d: "Return to Nairobi." }
      ] },

    { id: "7-days-bush-beach-honeymoon", cat: "kenya", title: "7 Days Kenya Bush & Beach Honeymoon Safari",
      days: 7, price: 2890, seasonal: true, img: "beach.jpg", gallery: ["kilimanjaro.jpg", "elephant-plains.jpg", "giraffe-sunset.jpg"],
      route: ["nairobi", "amboseli", "tsavowest", "tsavoeast", "diani"], badge: "Honeymoon", tags: ["honeymoon", "beach", "kilimanjaro", "elephants", "luxury"],
      summary: "Elephants under Kilimanjaro, the wild Tsavos, then two lazy days on the white sands of Diani. Made for couples.",
      highlights: ["Kilimanjaro views", "Kilaguni waterhole lodge", "2 nights at Diani Beach", "Honeymoon touches on request"],
      stay: ["Amboseli Sopa Lodge", "Kilaguni Serena Safari Lodge", "Voi Safari Lodge", "Diani Sea Resort"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive to Amboseli for an afternoon game drive." },
        { t: "Full day Amboseli", d: "Elephant families, swamps and Kilimanjaro sunsets." },
        { t: "Amboseli – Tsavo West", d: "Transfer to Tsavo West; Mzima Springs in the afternoon." },
        { t: "Tsavo West – Tsavo East", d: "Cross into Tsavo East; evening at Voi lodge's waterhole." },
        { t: "Tsavo East – Diani Beach", d: "Morning game drive then down to the coast for sundowners on the beach." },
        { t: "Diani Beach", d: "Free day: snorkelling, dhow cruise or spa." },
        { t: "Diani – Nairobi (end)", d: "Transfer to Ukunda/Mombasa airport for your flight." }
      ] },

    { id: "touch-of-africa-7-days", cat: "kenya", title: "Touch of Africa: 7 Days Samburu, Ol Pejeta, Lake Nakuru & Masai Mara",
      days: 7, price: 4907, seasonal: false, defaultTier: "luxury", img: "rhino.jpg", gallery: ["antelope.jpg", "flamingos-nakuru.jpg", "lion-face.jpg"],
      route: ["nairobi", "samburu", "olpejeta", "nakuru", "mara", "nairobi"], badge: "Signature", tags: ["luxury", "rhino", "rare", "bigfive", "migration"],
      rates: { all: { 1: 7296, 2: 4907 } },
      summary: "Our signature journey: northern frontier, equator rhino sanctuary, Rift Valley lake and the Masai Mara.",
      highlights: ["Last northern white rhinos (Ol Pejeta)", "Samburu Special Five", "Chimpanzee sanctuary", "Expert private guide"],
      stay: ["Samburu luxury camp", "Ol Pejeta tented camp", "Lake Nakuru lodge", "Mara luxury camp"],
      itinerary: [
        { t: "Nairobi – Samburu", d: "Drive north past Mt Kenya to Samburu." },
        { t: "Samburu National Reserve", d: "Full day for the Special Five and Samburu's elephants." },
        { t: "Samburu – Ol Pejeta Conservancy", d: "Visit the rhino and chimpanzee sanctuaries; night game drive optional." },
        { t: "Ol Pejeta – Lake Nakuru", d: "Transfer to Lake Nakuru for an afternoon drive." },
        { t: "Lake Nakuru – Masai Mara", d: "Continue to the Mara." },
        { t: "Masai Mara", d: "Full day in the reserve." },
        { t: "Masai Mara – Nairobi", d: "Return to Nairobi." }
      ] },

    { id: "8-days-across-the-wilderness", cat: "kenya", title: "8 Days Across the Wilderness: Meru, Samburu, Lake Nakuru & Masai Mara",
      days: 8, price: 3336, img: "leopard-tree.jpg", gallery: ["rhino.jpg", "antelope.jpg", "lion-walk.jpg"],
      route: ["nairobi", "meru", "samburu", "nakuru", "mara", "nairobi"], tags: ["bigfive", "rare", "rhino", "migration", "offbeat"],
      rates: { low: { 2: 3336, 4: 2885 }, high: { 2: 4176, 4: 3725 } }, seasonNote: "Low season / High season (Jul–Oct & Dec)",
      summary: "Go beyond the crowds — wild Meru and Samburu in the north, then the classic Rift Valley and Mara.",
      highlights: ["Uncrowded Meru National Park", "Samburu Special Five", "Lake Nakuru rhinos", "Masai Mara full day"],
      stay: ["Meru lodge", "Samburu lodge", "Lake Nakuru lodge", "Masai Mara camp"],
      itinerary: [
        { t: "Nairobi – Meru National Park", d: "Drive along the slopes of Mt Kenya to Meru." },
        { t: "Full day Meru", d: "Rhino sanctuary, Tana river and palm-fringed streams." },
        { t: "Meru – Samburu", d: "Transfer north to Samburu for an afternoon drive." },
        { t: "Full day Samburu", d: "Explore the Ewaso Nyiro riverine forest." },
        { t: "Samburu – Lake Nakuru", d: "Travel south to the Rift Valley." },
        { t: "Lake Nakuru – Masai Mara", d: "Morning game drive then on to the Mara." },
        { t: "Full day Masai Mara", d: "Big Five search with picnic lunch." },
        { t: "Masai Mara – Nairobi", d: "Return to Nairobi." }
      ] },

    { id: "8-days-samburu-mtkenya-nakuru-mara", cat: "kenya", title: "8 Days Samburu, Mt. Kenya, Lake Nakuru & Masai Mara Safari",
      days: 8, price: 2980, seasonal: true, img: "giraffe.jpg", gallery: ["hiking.jpg", "flamingos-nakuru.jpg", "lion-cub.jpg"],
      route: ["nairobi", "samburu", "mtkenya", "nakuru", "mara", "nairobi"], tags: ["bigfive", "rare", "rhino", "migration", "family"],
      summary: "Desert, forest, lake and savannah — including a night at a tree-hotel on the slopes of Mount Kenya.",
      highlights: ["Tree-hotel night viewing", "Samburu Special Five", "Lake Nakuru rhinos", "Masai Mara"],
      stay: ["Samburu lodge", "Mt Kenya tree lodge", "Lake Nakuru lodge", "Masai Mara camp"],
      itinerary: [
        { t: "Nairobi – Samburu", d: "Drive north across the equator to Samburu." },
        { t: "Full day Samburu", d: "Morning and afternoon game drives." },
        { t: "Samburu – Mount Kenya", d: "Transfer to the forest; watch animals at a floodlit waterhole after dark." },
        { t: "Mount Kenya – Lake Nakuru", d: "Drive to Lake Nakuru via Thomson's Falls." },
        { t: "Lake Nakuru – Masai Mara", d: "Continue to the Mara." },
        { t: "Full day Masai Mara", d: "Full day exploring." },
        { t: "Masai Mara", d: "Morning and afternoon drives; optional balloon." },
        { t: "Masai Mara – Nairobi", d: "Return to Nairobi." }
      ] },

    /* ---------------- KENYA & TANZANIA ---------------- */
    { id: "10-days-grand-epic-kenya-tanzania", cat: "kenya-tz", title: "10 Days Grand Epic Kenya & Tanzania Safari",
      days: 10, price: 4541, img: "savanna-sunset.jpg", gallery: ["lionesses.jpg", "elephants-pair.jpg", "zebra-bw.jpg"],
      route: ["nairobi", "amboseli", "arusha", "tarangire", "ngorongoro", "serengeti", "mara", "nakuru", "naivasha", "nairobi"], badge: "Epic", tags: ["migration", "bigfive", "kilimanjaro", "crater", "rhino", "luxury"],
      rates: { low: { 2: 4541, 4: 3635 }, high: { 2: 5142, 4: 4236 } }, seasonNote: "Low season / High season (Jul–Oct & Dec)",
      summary: "The definitive East African loop: Amboseli, Tarangire, Ngorongoro, Serengeti, Masai Mara and the Rift Valley lakes.",
      highlights: ["Serengeti to Masai Mara", "Ngorongoro Crater floor", "Tarangire baobabs", "Two-country Great Migration"],
      stay: ["Amboseli lodge", "Arusha hotel", "Tarangire lodge", "Ngorongoro lodge", "Serengeti camp", "Mara camp", "Nakuru lodge"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive to Amboseli for an afternoon game drive." },
        { t: "Amboseli – Arusha", d: "Cross the border at Namanga to Arusha." },
        { t: "Arusha – Tarangire", d: "Game drive among baobabs and elephant herds." },
        { t: "Tarangire – Ngorongoro", d: "Climb to the crater highlands." },
        { t: "Ngorongoro – Serengeti", d: "Descend into the crater at dawn, then continue to the Serengeti." },
        { t: "Full day Serengeti", d: "Following the herds and their predators across the endless plains." },
        { t: "Serengeti – Masai Mara", d: "Cross back into Kenya via the Isebania border." },
        { t: "Full day Masai Mara", d: "Full day in the reserve." },
        { t: "Masai Mara – Lake Nakuru", d: "Travel to Lake Nakuru for rhinos and flamingos." },
        { t: "Lake Nakuru – Naivasha – Nairobi", d: "Optional boat ride at Naivasha en route to Nairobi." }
      ] },

    { id: "10-days-best-of-kenya-tanzania-lodges", cat: "kenya-tz", title: "10 Days Best of Kenya & Tanzania Lodge Safari",
      days: 10, price: 4349, seasonal: false, img: "lionesses.jpg", gallery: ["savanna-sunset.jpg", "kilimanjaro.jpg", "flamingos-nakuru.jpg"],
      route: ["nairobi", "nakuru", "mara", "serengeti", "ngorongoro", "arusha", "amboseli", "nairobi"], tags: ["migration", "bigfive", "crater", "kilimanjaro", "rhino"],
      summary: "Comfortable lodges every night on a seamless circuit through both countries' headline parks.",
      highlights: ["Two nights in the Serengeti", "Ngorongoro Crater", "Amboseli & Kilimanjaro", "Masai Mara"],
      stay: ["Lake Nakuru Sopa Lodge", "Masai Mara Lodge", "Hippo Trails Camp", "Thorn Tree Camp", "Ngorongoro lodge", "Arusha hotel", "Amboseli Sopa Lodge"],
      itinerary: [
        { t: "Nairobi – Lake Nakuru", d: "Drive into the Rift Valley for an afternoon game drive." },
        { t: "Lake Nakuru – Masai Mara", d: "Continue west to the Mara." },
        { t: "Full day Masai Mara", d: "Full day game viewing." },
        { t: "Masai Mara – Serengeti", d: "Cross into Tanzania and on to the Serengeti." },
        { t: "Central Serengeti", d: "Seronera valley — famous for big cats." },
        { t: "Serengeti – Ngorongoro", d: "Morning drive then up to the crater rim." },
        { t: "Ngorongoro – Arusha", d: "Crater floor game drive, then Arusha." },
        { t: "Arusha – Amboseli", d: "Return to Kenya via Namanga." },
        { t: "Full day Amboseli", d: "Elephants and Kilimanjaro." },
        { t: "Amboseli – Nairobi", d: "Return to Nairobi." }
      ] },

    { id: "10-days-combined-kenya-tanzania", cat: "kenya-tz", title: "10 Days Combined Kenya & Tanzania Private Safari",
      days: 10, price: 4150, seasonal: true, img: "zebra-bw.jpg", gallery: ["lion-face.jpg", "flamingo.jpg", "elephant-plains.jpg"],
      route: ["nairobi", "mara", "nakuru", "amboseli", "manyara", "serengeti", "ngorongoro", "arusha"], tags: ["migration", "bigfive", "crater", "kilimanjaro"],
      summary: "Three nights in the Mara, then Nakuru, Amboseli, Lake Manyara, the Serengeti and Ngorongoro — ending in Arusha.",
      highlights: ["3 days in the Masai Mara", "Mara River visit", "Lake Manyara", "Ngorongoro Crater"],
      stay: ["Mara camp", "Nakuru lodge", "Amboseli lodge", "Manyara lodge", "Serengeti camp", "Ngorongoro lodge"],
      itinerary: [
        { t: "Nairobi – Masai Mara", d: "Drive to the Mara for an afternoon game drive." },
        { t: "Masai Mara – Mara River", d: "Full day trip to the river and hippo pools." },
        { t: "Masai Mara", d: "Morning and afternoon game drives." },
        { t: "Masai Mara – Lake Nakuru", d: "Transfer to Lake Nakuru." },
        { t: "Lake Nakuru – Amboseli", d: "Long scenic drive south to Amboseli." },
        { t: "Amboseli National Park", d: "Full day among elephants." },
        { t: "Amboseli – Lake Manyara", d: "Cross into Tanzania to Mto wa Mbu." },
        { t: "Lake Manyara – Serengeti", d: "Game drive en route to the Serengeti." },
        { t: "Serengeti – Ngorongoro", d: "Morning drive then crater rim." },
        { t: "Ngorongoro – Arusha", d: "Crater floor game drive, end in Arusha." }
      ] },

    { id: "8-days-nakuru-mara-serengeti-ngorongoro-amboseli", cat: "kenya-tz", title: "8 Days Nakuru, Masai Mara, Serengeti, Ngorongoro & Amboseli",
      days: 8, price: 3690, seasonal: true, img: "lion-face.jpg", gallery: ["savanna-sunset.jpg", "lionesses.jpg", "kilimanjaro.jpg"],
      route: ["nairobi", "nakuru", "mara", "serengeti", "ngorongoro", "amboseli", "nairobi"], tags: ["migration", "bigfive", "crater", "kilimanjaro"],
      summary: "Both halves of the migration ecosystem in just over a week, with Ngorongoro and Kilimanjaro thrown in.",
      highlights: ["Mara & Serengeti", "Ngorongoro Crater", "Amboseli finale", "Full-board tented camps"],
      stay: ["Flamingo Hill Tented Camp", "Mara Leisure Tented Camp", "Serengeti Serena Lodge", "Ngorongoro lodge", "Amboseli lodge"],
      itinerary: [
        { t: "Nairobi – Lake Nakuru", d: "Afternoon game drive at Nakuru." },
        { t: "Lake Nakuru – Masai Mara", d: "Drive to the Mara for sunset." },
        { t: "Masai Mara", d: "Full day in the reserve." },
        { t: "Masai Mara – Serengeti", d: "Cross into Tanzania with a game drive en route." },
        { t: "Serengeti National Park", d: "Full day on the plains." },
        { t: "Serengeti – Ngorongoro", d: "Continue to the crater highlands." },
        { t: "Ngorongoro – Amboseli", d: "Crater descent, then back to Kenya." },
        { t: "Amboseli – Nairobi", d: "Morning drive and return to Nairobi." }
      ] },

    { id: "9-days-amboseli-nakuru-mara-serengeti-ngorongoro", cat: "kenya-tz", title: "9 Days Amboseli, Nakuru, Masai Mara, Serengeti & Ngorongoro",
      days: 9, price: 3980, seasonal: true, img: "elephant-plains.jpg", gallery: ["flamingos-nakuru.jpg", "savanna-sunset.jpg", "lionesses.jpg"],
      route: ["nairobi", "amboseli", "nakuru", "mara", "serengeti", "ngorongoro", "arusha"], tags: ["migration", "bigfive", "crater", "kilimanjaro", "rhino"],
      summary: "A private adventure linking five iconic parks across Kenya and Tanzania, ending in Arusha.",
      highlights: ["Five iconic parks", "Big Five at close range", "Ngorongoro Crater", "Ends in Arusha (Kilimanjaro airport)"],
      stay: ["Amboseli lodge", "Nakuru lodge", "Mara camp", "Serengeti camp", "Ngorongoro lodge"],
      itinerary: [
        { t: "Nairobi – Amboseli", d: "Drive south for an afternoon game drive." },
        { t: "Amboseli National Park", d: "Full day of game viewing." },
        { t: "Amboseli – Lake Nakuru", d: "Travel north to the Rift Valley." },
        { t: "Lake Nakuru – Masai Mara", d: "On to the Mara." },
        { t: "Masai Mara", d: "Full day with picnic lunch at the hippo pools." },
        { t: "Masai Mara – Serengeti", d: "Cross into Tanzania." },
        { t: "Serengeti National Park", d: "Full day in the Serengeti." },
        { t: "Serengeti – Ngorongoro Crater", d: "Morning drive then to the crater rim." },
        { t: "Ngorongoro Crater – Arusha", d: "Crater floor game drive and transfer to Arusha." }
      ] },

    /* ---------------- UGANDA ---------------- */
    { id: "5-days-uganda-gorillas-chimps", cat: "uganda", title: "5 Days Gorillas & Chimps Luxury Trip in Uganda",
      days: 5, price: 3750, seasonal: false, defaultTier: "luxury", img: "gorilla.jpg", gallery: ["gorilla-tree.jpg", "elephant-forest.jpg"],
      route: ["entebbe", "kibale", "bwindi", "entebbe"], badge: "Primates", tags: ["gorillas", "primates", "luxury", "rare"],
      rates: { all: { 2: 3750, 4: 3325, 6: 3150 } }, seasonNote: "2026 rates by group size",
      summary: "Look into the eyes of a mountain gorilla in Bwindi and track chimpanzees in Kibale — a once-in-a-lifetime primate safari.",
      highlights: ["Gorilla permit included", "Chimpanzee tracking permit included", "Bigodi community swamp walk", "Luxury lodges"],
      stay: ["Entebbe boutique hotel", "Kibale luxury lodge", "Bwindi luxury lodge"],
      inc: ["Luxury private accommodation (double occupancy)", "Gorilla & chimpanzee permits", "English/French-speaking guide", "Private 4x4 transport", "Park entry fees", "Meals as listed"],
      itinerary: [
        { t: "Arrival in Entebbe", d: "Meet & greet at Entebbe International Airport and transfer to your hotel." },
        { t: "Entebbe – Kibale Forest", d: "Drive west to Fort Portal; afternoon Bigodi wetland community walk." },
        { t: "Chimp tracking – Bwindi", d: "Morning chimpanzee tracking, then the scenic drive south to Bwindi." },
        { t: "Gorilla tracking", d: "Trek into the Impenetrable Forest for one magical hour with a habituated gorilla family." },
        { t: "Bwindi – Entebbe", d: "Return to Entebbe for your onward flight." }
      ] },

    { id: "6-days-uganda-luxury-gorillas-chimps", cat: "uganda", title: "6 Days Uganda Luxury Tour: Gorillas & Chimps Tracking",
      days: 6, price: 4200, seasonal: false, defaultTier: "luxury", img: "gorilla-tree.jpg", gallery: ["gorilla.jpg", "elephant-forest.jpg"],
      route: ["entebbe", "kibale", "bwindi", "entebbe"], tags: ["gorillas", "primates", "luxury", "rare"],
      rates: { all: { 2: 4200, 4: 3725, 6: 3550 } }, seasonNote: "2026 rates by group size",
      summary: "The unhurried version of our primate safari, with an extra day to rest in Kibale and soak up the forest.",
      highlights: ["Gorilla & chimp permits included", "Extra relaxation day", "Crater lakes of Fort Portal", "Luxury lodges"],
      stay: ["Entebbe boutique hotel", "Kibale luxury lodge", "Bwindi luxury lodge"],
      inc: ["Luxury private accommodation (double occupancy)", "Gorilla & chimpanzee permits", "English/French-speaking guide", "Private 4x4 transport", "Park entry fees", "Meals as listed"],
      itinerary: [
        { t: "Arrival in Entebbe", d: "Airport welcome and transfer to your hotel." },
        { t: "Entebbe – Kibale Forest", d: "Drive to Kibale; Bigodi community swamp walk." },
        { t: "Chimpanzee tracking & relaxing", d: "Morning chimp tracking; afternoon at leisure by the crater lakes." },
        { t: "Kibale – Bwindi", d: "Scenic drive via Queen Elizabeth National Park." },
        { t: "Gorilla tracking", d: "Trek to meet a habituated mountain gorilla family." },
        { t: "Bwindi – Entebbe", d: "Return to Entebbe for your flight." }
      ] },

    /* ---------------- DAY TOURS ---------------- */
    { id: "nairobi-national-park-half-day", cat: "day", title: "Nairobi National Park Half-Day Game Drive",
      days: 0.5, price: 120, seasonal: false, tiers: false, img: "rhino.jpg", gallery: ["giraffe.jpg"],
      route: ["nairobi"], tags: ["day", "rhino", "short", "family"], duration: "≈ 5 hours",
      summary: "Lions and rhinos with skyscrapers on the horizon — the world's only wildlife park inside a capital city.",
      highlights: ["Hotel pick-up", "Private pop-up roof vehicle", "Rhino sanctuary", "Optional Elephant Orphanage add-on"],
      exc: ["Park entry fees (paid at the gate)", "Meals & drinks", "Tips"],
      itinerary: [{ t: "Half-day game drive", d: "06:00 or 14:00 pick-up · game drive across open plains and forest · return to your hotel." }] },

    { id: "giraffe-centre-elephant-orphanage-bomas", cat: "day", title: "Giraffe Centre, Elephant Orphanage & Bomas of Kenya",
      days: 1, price: 95, seasonal: false, tiers: false, img: "giraffe.jpg", gallery: ["elephant.jpg"],
      route: ["nairobi"], tags: ["day", "family", "culture", "short"], duration: "≈ 7 hours",
      summary: "Feed endangered Rothschild giraffes, watch orphaned baby elephants at feeding time and enjoy traditional dance.",
      highlights: ["Baby elephant feeding (11:00)", "Hand-feed giraffes", "Bomas cultural dances", "Ideal for families"],
      exc: ["Entrance fees", "Lunch", "Tips"],
      itinerary: [{ t: "Full day in Nairobi", d: "10:30 Elephant Orphanage · 12:30 Giraffe Centre · lunch · 14:30 Bomas of Kenya cultural show · hotel drop-off." }] },

    { id: "hells-gate-naivasha-day", cat: "day", title: "Hell's Gate & Lake Naivasha Day Trip",
      days: 1, price: 145, seasonal: false, tiers: false, img: "zebra.jpg", gallery: ["giraffe-sunset.jpg"],
      route: ["nairobi", "hellsgate", "naivasha", "nairobi"], tags: ["day", "active", "family"], duration: "≈ 10 hours",
      summary: "Cycle among zebra and giraffe through Hell's Gate gorge, then cruise Lake Naivasha among hippos.",
      highlights: ["Bike or walking safari", "Gorge hike", "Boat ride among hippos", "Rift Valley viewpoint"],
      exc: ["Park fees", "Boat ride (approx. US$20 pp)", "Lunch"],
      itinerary: [{ t: "Day trip from Nairobi", d: "07:00 pick-up · Rift Valley viewpoint · cycle Hell's Gate · lunch · 1-hour boat ride · return 18:30." }] },

    { id: "lake-nakuru-day-trip", cat: "day", title: "Lake Nakuru Day Trip",
      days: 1, price: 165, seasonal: false, tiers: false, img: "flamingos-nakuru.jpg", gallery: ["rhino.jpg"],
      route: ["nairobi", "nakuru", "nairobi"], tags: ["day", "rhino", "birds"], duration: "≈ 12 hours",
      summary: "A full day in the Rift Valley rhino sanctuary — flamingos, pelicans, buffalo and Baboon Cliff views.",
      highlights: ["Private game drive", "Rhino sanctuary", "Baboon Cliff viewpoint", "Hotel pick-up & drop-off"],
      exc: ["Park entry fees (paid at the gate)", "Lunch & drinks", "Tips"],
      itinerary: [{ t: "Day trip from Nairobi", d: "06:30 pick-up · arrive 09:30 for game drive · picnic lunch · game drive en route out · drop-off 18:30." }] },

    { id: "mt-longonot-hike", cat: "day", title: "Mt Longonot Hiking Day Tour",
      days: 1, price: 135, seasonal: false, tiers: false, img: "hiking.jpg", gallery: ["zebra.jpg"],
      route: ["nairobi", "longonot", "naivasha", "nairobi"], tags: ["day", "active", "mountains"], duration: "≈ 10 hours",
      summary: "Hike to the rim of a dormant volcano for staggering Rift Valley views, then relax by Lake Naivasha.",
      highlights: ["Crater rim hike (2,776 m)", "Local ranger guide", "Picnic lunch", "Optional Naivasha boat ride"],
      exc: ["Personal expenses", "Airport transfers"],
      inc: ["Picnic lunch", "All entry fees & taxes", "Hotel pick-up and drop-off", "Professional driver-guide", "Local walking guide"],
      itinerary: [{ t: "Day trip from Nairobi", d: "07:00 pick-up · 3–5 hour hike · picnic lunch · optional boat ride · 16:00 depart for Nairobi." }] },

    { id: "nairobi-city-tour", cat: "day", title: "Nairobi City Tour",
      days: 0.5, price: 65, seasonal: false, tiers: false, img: "elephant-plains.jpg", gallery: ["giraffe.jpg"],
      route: ["nairobi"], tags: ["day", "culture", "short", "family"], duration: "≈ 3 hours",
      summary: "Kenya's history, markets and landmarks: the National Museum, snake park and city centre highlights.",
      highlights: ["National Museum", "Snake park", "Kenyatta Conference Centre views", "English-speaking guide"],
      inc: ["Transport", "Entrance fees", "Bottled water", "English-speaking guide"],
      exc: ["Meals", "Tips"],
      itinerary: [{ t: "Half day", d: "Hotel pick-up · National Museum & snake park · city centre landmarks · drop-off." }] }
  ];

  tours.forEach(t => {
    t.inc = t.inc || (t.cat === "day" ? ["Private vehicle with driver-guide", "Hotel pick-up & drop-off", "Bottled water"] : STD_INC);
    t.exc = t.exc || STD_EXC;
    if (t.tiers === undefined) t.tiers = !t.rates && t.cat !== "uganda";
    t.defaultTier = t.defaultTier || "midrange";
    if (t.seasonal === undefined) t.seasonal = true;
  });

  const categories = {
    "kenya":    { label: "Kenya Safaris", short: "Kenya", img: "lion-walk.jpg", desc: "Private game drives across the Masai Mara, Amboseli, Samburu, Tsavo and the Rift Valley." },
    "kenya-tz": { label: "Kenya & Tanzania", short: "Kenya + Tanzania", img: "savanna-sunset.jpg", desc: "Follow the Great Migration across two countries, including the Serengeti and Ngorongoro." },
    "uganda":   { label: "Uganda Gorilla Tours", short: "Uganda", img: "gorilla.jpg", desc: "Track mountain gorillas in Bwindi and chimpanzees in Kibale forest." },
    "day":      { label: "Excursions & Day Trips", short: "Day trips", img: "giraffe.jpg", desc: "Half and full-day experiences from Nairobi — perfect for layovers." }
  };

  /* -------- GREAT MIGRATION (approximate herd location by month) -------- */
  const migration = [
    { m: "January",  lat: -2.95, lng: 35.05, area: "Southern Serengeti & Ndutu", note: "Herds graze the short-grass plains of the southern Serengeti and Ngorongoro Conservation Area.", event: "Pre-calving" },
    { m: "February", lat: -3.05, lng: 34.95, area: "Ndutu – calving season", note: "Around 8,000 calves are born each day at the peak — a predator spectacle.", event: "Calving" },
    { m: "March",    lat: -2.90, lng: 35.00, area: "Southern Serengeti", note: "Calves grow strong; herds start to gather as the long rains approach.", event: "Calving" },
    { m: "April",    lat: -2.55, lng: 34.90, area: "Central Serengeti (Seronera)", note: "Long rains. Columns of wildebeest begin moving north-west.", event: "Rut begins" },
    { m: "May",      lat: -2.35, lng: 34.55, area: "Central → Western Corridor", note: "The famous rut — males battle as the herds trek west.", event: "Rut" },
    { m: "June",     lat: -2.15, lng: 34.20, area: "Western Corridor – Grumeti River", note: "First river test: giant Grumeti crocodiles await.", event: "Grumeti crossings" },
    { m: "July",     lat: -1.75, lng: 34.85, area: "Northern Serengeti – Mara River", note: "Herds reach the Mara River; crossings into Kenya begin.", event: "Mara River crossings" },
    { m: "August",   lat: -1.45, lng: 35.10, area: "Masai Mara, Kenya", note: "Peak crossings — the most dramatic wildlife event on earth.", event: "Peak crossings" },
    { m: "September",lat: -1.40, lng: 35.15, area: "Masai Mara, Kenya", note: "Herds spread across the Mara plains; predators everywhere.", event: "Mara grazing" },
    { m: "October",  lat: -1.62, lng: 35.00, area: "Mara → Northern Serengeti", note: "Short rains call the herds back south across the river.", event: "Return crossings" },
    { m: "November", lat: -2.30, lng: 35.10, area: "Eastern & Central Serengeti", note: "Fresh grass draws the herds south down the eastern plains.", event: "Southward trek" },
    { m: "December", lat: -2.85, lng: 35.10, area: "Southern Serengeti", note: "Back on the southern plains, ready for calving.", event: "Arrival south" }
  ];

  /* ---------------- WILDLIFE ---------------- */
  const wildlife = [
    { name: "Lion", img: "lion-face.jpg", fact: "Mara lions live in prides of up to 30. Males' manes darken with age and health.", where: "Masai Mara, Serengeti, Ngorongoro", big5: true },
    { name: "Leopard", img: "leopard-tree.jpg", fact: "Solitary and secretive — they haul prey up trees to keep it from lions and hyenas.", where: "Masai Mara, Samburu, Serengeti", big5: true },
    { name: "Elephant", img: "elephant.jpg", fact: "Amboseli's elephants are among the most studied on earth — some tuskers carry tusks over 45 kg.", where: "Amboseli, Tsavo, Tarangire", big5: true },
    { name: "Buffalo", img: "buffalo-sunset.jpg", fact: "Herds can exceed 1,000. Old bulls ('dagga boys') are notoriously short-tempered.", where: "Masai Mara, Ngorongoro, Nakuru", big5: true },
    { name: "Rhino", img: "rhino.jpg", fact: "Both black and white rhinos are protected in Kenya's sanctuaries, including Lake Nakuru and Ol Pejeta.", where: "Lake Nakuru, Ol Pejeta, Ngorongoro", big5: true },
    { name: "Mountain gorilla", img: "gorilla.jpg", fact: "Only around 1,060 remain in the wild; nearly half of them live in Bwindi.", where: "Bwindi Impenetrable, Uganda", big5: false },
    { name: "Giraffe", img: "giraffe.jpg", fact: "Three subspecies on our routes: Masai, reticulated (Samburu) and Rothschild (Nakuru).", where: "Everywhere on safari", big5: false },
    { name: "Zebra", img: "zebra-bw.jpg", fact: "Every stripe pattern is unique — foals learn to recognise their mother's.", where: "Masai Mara, Serengeti, Hell's Gate", big5: false }
  ];

  /* ---------------- FAQ ---------------- */
  const faqs = [
    { q: "When is the best time to go on safari?", a: "The long dry season (late June – October) offers the easiest game viewing and the Great Migration in the Masai Mara. January – March is also excellent and quieter, with calving season in the southern Serengeti. April – May brings the long rains: fewer visitors and lower rates, but some roads become muddy." },
    { q: "Are your safaris private?", a: "Yes. Every multi-day safari is run privately in a 4x4 Land Cruiser with a pop-up roof, so you travel only with your own group and your own driver-guide, and the itinerary can be adjusted to your interests." },
    { q: "How do I book and pay?", a: "Send an enquiry from any tour page or the Trip Builder. Your safari consultant confirms availability and a final quote. A deposit (30% by default) secures your lodges and permits; the balance is due before your safari. We accept card payments, bank transfer and M-Pesa." },
    { q: "What is included in the price?", a: "Safari prices include your private vehicle and guide, accommodation, meals on safari, park fees, game drives and bottled water in the vehicle. International flights, visas, insurance, tips and personal items are not included. Each tour lists its exact inclusions." },
    { q: "Do I need a visa for Kenya, Tanzania or Uganda?", a: "Most visitors need an Electronic Travel Authorisation (eTA) for Kenya, applied for online before travel. Tanzania and Uganda issue e-visas online. The East Africa Tourist Visa covers Kenya, Uganda and Rwanda (not Tanzania). Entry rules change — always confirm with the official government portal before you fly." },
    { q: "Is a safari suitable for children?", a: "Absolutely. Private vehicles make it easy to travel at a family pace. Children aged 3–11 sharing with adults are charged a reduced rate. Gorilla trekking in Uganda has a minimum age of 15 years." },
    { q: "How much does a gorilla permit cost?", a: "Uganda's gorilla permits are currently US$800 per person for foreign non-residents and are included in our Uganda tour prices. Permits are limited, so we recommend booking 3–6 months ahead." },
    { q: "What should I pack?", a: "Neutral-coloured layered clothing, a warm fleece for early mornings, a wide-brimmed hat, sunscreen, insect repellent, binoculars, a camera with a zoom lens and a soft-sided bag (bush flights limit luggage to about 15 kg). Use our interactive packing list on the Travel Info page." },
    { q: "Can I customise a tour?", a: "Every tour can be tailored — add nights, upgrade lodges, add a beach extension or a balloon flight. Use the Trip Builder to design your own and get an instant estimate." }
  ];

  /* ---------------- TRAVEL HEALTH (reviewed against CDC / WHO guidance) ---------------- */
  const health = [
    { icon: "shield", t: "Yellow fever", d: "Uganda requires proof of yellow fever vaccination for all travellers aged 1 year and over. Tanzania requires a certificate if you arrive from, or transit for more than 12 hours through, a country with yellow fever risk — this includes Kenya. Vaccination is recommended for most of Kenya. One dose gives lifelong protection; the certificate becomes valid 10 days after vaccination." },
    { icon: "bug", t: "Malaria prevention", d: "Malaria is present in all three countries, including safari areas and the coast (risk is low in central Nairobi and the highlands). Your doctor may prescribe atovaquone‑proguanil, doxycycline or mefloquine — the right choice depends on your health, other medicines and trip length. Combine tablets with bite prevention: DEET (20–50%) or picaridin repellent, long sleeves at dusk and treated nets." },
    { icon: "pill", t: "Take every tablet — including after you leave", d: "Most malaria cases in travellers happen when doses are missed or stopped early. Take tablets at the same time each day, with food. Continue after leaving the malaria area: 7 days for atovaquone‑proguanil, 4 weeks for doxycycline or mefloquine. Set a daily phone alarm; our guides can remind you at breakfast." },
    { icon: "syringe", t: "Recommended vaccines", d: "Make sure routine vaccines (MMR, tetanus‑diphtheria‑pertussis, polio) are up to date. Hepatitis A and typhoid are generally recommended; hepatitis B, rabies and cholera may be advised depending on your activities and length of stay. Ideally see a travel clinic 4–8 weeks before departure." },
    { icon: "thermo", t: "Fever after your trip", d: "Any fever during, or up to a year after, travel to a malaria area needs urgent medical attention — tell the doctor where you travelled. Malaria can be treated effectively when diagnosed early." },
    { icon: "sun", t: "Sun, water & altitude", d: "The equatorial sun is strong: use SPF 30+ and a hat. Drink bottled or treated water (provided in our vehicles). Nairobi is at 1,795 m and Ngorongoro's rim at about 2,300 m — mild breathlessness is normal; drink plenty and take it easy on day one." }
  ];

  const packing = [
    { g: "Clothing", items: ["Neutral khaki/green shirts (3–4)", "Lightweight long trousers", "Warm fleece or jacket for dawn drives", "Wide-brimmed hat", "Comfortable walking shoes", "Swimwear", "Lightweight rain jacket"] },
    { g: "Health & comfort", items: ["Malaria tablets (full course + extra days)", "Insect repellent (DEET 20–50% or picaridin)", "Sunscreen SPF 30+ & lip balm", "Personal medicines in hand luggage", "Yellow fever certificate", "Hand sanitiser", "Travel insurance documents"] },
    { g: "Gear", items: ["Binoculars", "Camera + zoom lens (200–400mm)", "Spare batteries & memory cards", "Power bank & universal adapter (UK type G)", "Head torch", "Soft-sided duffel bag (max ~15 kg for bush flights)", "Reusable water bottle"] },
    { g: "Documents", items: ["Passport (6+ months validity, 2 blank pages)", "Kenya eTA / Tanzania & Uganda e-visas", "Flight tickets", "Copies of passport & insurance", "Credit card + some USD cash (post-2009 notes)"] }
  ];

  /* ---------------- TRIP BUILDER ---------------- */
  // Approximate cost per person per night (2 sharing, mid-range, incl. vehicle, guide, fees, full board)
  const builderParks = [
    { id: "mara", rate: 420, min: 2, rec: 3 },
    { id: "amboseli", rate: 360, min: 1, rec: 2 },
    { id: "nakuru", rate: 330, min: 1, rec: 1 },
    { id: "naivasha", rate: 280, min: 1, rec: 1 },
    { id: "samburu", rate: 380, min: 2, rec: 2 },
    { id: "olpejeta", rate: 410, min: 1, rec: 1 },
    { id: "tsavowest", rate: 320, min: 1, rec: 2 },
    { id: "tsavoeast", rate: 310, min: 1, rec: 1 },
    { id: "serengeti", rate: 520, min: 2, rec: 2 },
    { id: "ngorongoro", rate: 490, min: 1, rec: 1 },
    { id: "tarangire", rate: 390, min: 1, rec: 1 },
    { id: "bwindi", rate: 1150, min: 2, rec: 2, note: "incl. US$800 gorilla permit" },
    { id: "kibale", rate: 540, min: 1, rec: 1, note: "incl. chimp permit" },
    { id: "diani", rate: 190, min: 2, rec: 3, note: "beach hotel, half board" }
  ];

  window.CROWNLAND_DATA = { IMG, places, tours, categories, migration, wildlife, faqs, health, packing, builderParks };
})();
