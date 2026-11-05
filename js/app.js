/* =========================================================================
   CROWNLAND SAFARIS TOUR — APPLICATION
   Vanilla JS single-page app: router, pricing engine, maps, trip builder,
   quiz, comparison, wishlist, enquiry wizard, concierge chat and more.
   ========================================================================= */
(function () {
  "use strict";
  const CFG = window.CROWNLAND_CONFIG;
  const D = window.CROWNLAND_DATA;
  const IMG = D.IMG;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const TAGS = { migration: "Great Migration", bigfive: "Big Five", gorillas: "Gorillas", kilimanjaro: "Kilimanjaro", rhino: "Rhinos", beach: "Beach", luxury: "Luxury", honeymoon: "Honeymoon", family: "Family", rare: "Rare species", crater: "Ngorongoro Crater", value: "Great value", elephants: "Elephants", active: "Active" };

  /* ---------------- Utilities ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const icon = (n, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const tourById = id => D.tours.find(t => t.id === id);
  const placeName = id => (D.places[id] || {}).name || id;
  const uniqRoute = r => r.filter((p, i) => p !== r[i - 1]);
  const daysLabel = t => t.days < 1 ? "Half day" : t.days === 1 ? "1 day" : `${t.days} days`;
  const debounce = (fn, ms = 200) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };

  function toast(msg, ic = "check") {
    const el = document.createElement("div");
    el.className = "toast"; el.innerHTML = icon(ic) + `<span>${msg}</span>`;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.style.transition = ".4s"; el.style.opacity = "0"; el.style.transform = "translateY(-10px)"; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }

  /* ---------------- Currency ---------------- */
  let currency = store.get("cl-currency", "USD");
  if (!CFG.currencies[currency]) currency = "USD";
  function money(usd, cur = currency) {
    const c = CFG.currencies[cur];
    const v = Math.round(usd * c.rate);
    return c.symbol + v.toLocaleString("en-US");
  }
  function refreshPrices() { $$("[data-usd]").forEach(el => { el.textContent = money(+el.dataset.usd); }); }

  /* ---------------- Pricing engine ---------------- */
  const gf = n => CFG.groupFactors[Math.max(1, Math.min(n, 7))];
  const isHigh = (month, t) => (t && t.tierRates) ? month >= 7 : CFG.highSeasonMonths.includes(month);
  function interp(table, pax) {
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    if (table[pax]) return table[pax];
    const min = keys[0], max = keys[keys.length - 1];
    if (pax < min) return table[min] * gf(pax) / gf(min);
    if (pax > max) return table[max] * gf(pax) / gf(max);
    const lo = keys.filter(k => k < pax).pop(), hi = keys.find(k => k > pax);
    return table[lo] + (table[hi] - table[lo]) * (pax - lo) / (hi - lo);
  }
  function ppPrice(t, pax, month, tier) {
    tier = tier || t.defaultTier;
    const high = isHigh(month, t);
    let p;
    if (t.tierRates) {
      const tr = t.tierRates[tier] || t.tierRates.midrange;
      p = (high ? tr.high : tr.low) * gf(pax) / gf(2);
    } else if (t.rates) {
      const table = t.rates.all || (high ? t.rates.high : t.rates.low);
      p = interp(table, pax);
    } else {
      p = t.price * gf(pax);
      if (t.seasonal && high) p *= CFG.highSeasonFactor;
      if (t.tiers) p *= CFG.tierFactors[tier] / CFG.tierFactors[t.defaultTier];
    }
    return Math.round(p);
  }
  function quote(t, { adults = 2, kids = 0, month = 2, tier } = {}) {
    const pax = Math.max(1, adults + kids);
    const pp = ppPrice(t, pax, month, tier);
    const kidPP = Math.round(pp * CFG.childFactor);
    const seasonal = !!(t.rates && !t.rates.all) || !!t.tierRates || t.seasonal;
    return { pp, kidPP, total: pp * adults + kidPP * kids, high: seasonal && isHigh(month, t), seasonal, pax };
  }
  const fromPrice = t => ppPrice(t, 2, 2, t.tierRates ? "midrange" : t.defaultTier);

  /* ---------------- Saved & compare ---------------- */
  let saved = new Set(store.get("cl-saved", []));
  let compare = [];
  function toggleSave(id) {
    if (saved.has(id)) { saved.delete(id); toast("Removed from saved", "heart"); }
    else { saved.add(id); toast("Saved to your wishlist", "heart"); }
    store.set("cl-saved", [...saved]);
    $$(`[data-save="${id}"]`).forEach(b => { b.classList.toggle("on", saved.has(id)); b.setAttribute("aria-pressed", saved.has(id)); });
    updateSavedCount(); renderSaved();
  }
  function updateSavedCount() { const c = $("#savedCount"); c.textContent = saved.size || ""; c.dataset.n = saved.size; }
  function toggleCompare(id, on) {
    if (on && compare.length >= 3) { toast("Compare up to 3 safaris", "info"); $$(`[data-compare="${id}"]`).forEach(i => i.checked = false); return; }
    compare = on ? [...new Set([...compare, id])] : compare.filter(x => x !== id);
    $$(`[data-compare]`).forEach(i => i.checked = compare.includes(i.dataset.compare));
    const bar = $("#compareBar");
    bar.classList.toggle("show", compare.length > 0);
    $("#compareThumbs").innerHTML = compare.map(id => `<img src="${IMG + tourById(id).img}" alt="">`).join("");
    $("#compareLabel").textContent = `${compare.length} selected`;
  }

  /* ---------------- Tour card ---------------- */
  function tourCard(t) {
    const route = uniqRoute(t.route).map(placeName);
    return `<article class="tour-card">
      <div class="tour-media">
        <a href="#/tour/${t.id}" aria-label="${esc(t.title)}"><img src="${IMG + t.img}" alt="${esc(t.title)}" loading="lazy"></a>
        ${t.badge ? `<span class="ribbon">${t.badge}</span>` : ""}
        <span class="days">${icon("clock")} ${t.duration || daysLabel(t)}</span>
        <button class="heart ${saved.has(t.id) ? "on" : ""}" data-save="${t.id}" aria-pressed="${saved.has(t.id)}" aria-label="Save ${esc(t.title)}">${icon("heart")}</button>
      </div>
      <div class="tour-body">
        <div class="tour-cat">${D.categories[t.cat].short}</div>
        <h3><a href="#/tour/${t.id}">${esc(t.title)}</a></h3>
        <div class="tour-route">${route.map((r, i) => (i ? "<i>›</i>" : "") + `<span>${r}</span>`).join("")}</div>
        <div class="tour-foot">
          <div class="price"><small>From</small><strong data-usd="${fromPrice(t)}">${money(fromPrice(t))}</strong> <span>pp</span></div>
          <div class="card-actions">
            <label class="compare-check"><input type="checkbox" data-compare="${t.id}" ${compare.includes(t.id) ? "checked" : ""}> Compare</label>
            <a class="btn btn-dark btn-sm" href="#/tour/${t.id}">View</a>
          </div>
        </div>
      </div>
    </article>`;
  }

  /* ---------------- Config binding ---------------- */
  function bindConfig() {
    $$("[data-cfg-text]").forEach(el => { el.textContent = CFG[el.dataset.cfgText]; });
    $$("[data-cfg-href]").forEach(el => {
      const k = el.dataset.cfgHref;
      if (k === "tel") el.href = "tel:" + CFG.phonePrimary.replace(/\s/g, "");
      if (k === "tel2") el.href = "tel:" + CFG.phoneSecondary.replace(/\s/g, "");
      if (k === "mailto") el.href = "mailto:" + CFG.email;
      if (k === "whatsapp") el.href = waLink("Hello Crownland Safaris! I'd like help planning a safari.");
    });
    const so = CFG.social;
    $("#socials").innerHTML = [["facebook", "fb"], ["instagram", "ig"], ["youtube", "yt"], ["tiktok", "tt"]]
      .map(([k, i]) => `<a href="${so[k]}" aria-label="${k}" target="_blank" rel="noopener">${icon(i)}</a>`).join("");
    $("#year").textContent = new Date().getFullYear();
    const sel = $("#currencySelect");
    sel.innerHTML = Object.keys(CFG.currencies).map(c => `<option ${c === currency ? "selected" : ""}>${c}</option>`).join("");
    sel.addEventListener("change", () => { currency = sel.value; store.set("cl-currency", currency); refreshPrices(); rerenderQuotes(); toast(`Prices shown in ${currency} (indicative)`, "globe"); });
  }
  const waLink = text => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------------- Navigation chrome ---------------- */
  function buildMenus() {
    const cats = Object.entries(D.categories);
    $("#megaMenu").innerHTML = cats.map(([k, c]) => {
      const n = D.tours.filter(t => t.cat === k).length;
      return `<a class="mega-item" href="#/tours?cat=${k}"><img src="${IMG + c.img}" alt=""><span><strong>${c.label}</strong><span>${n} tours · ${c.desc}</span></span></a>`;
    }).join("") + `<a class="mega-item" href="#/builder"><img src="${IMG}acacia.jpg" alt=""><span><strong>Tailor-made Trip Builder</strong><span>Design your own route and price it instantly.</span></span></a>
      <a class="mega-item" href="#/tours"><img src="${IMG}zebra.jpg" alt=""><span><strong>All safaris</strong><span>Filter, compare and save every itinerary.</span></span></a>`;
    $("#mobileCats").innerHTML = cats.map(([k, c]) => `<a class="sub" href="#/tours?cat=${k}">${c.label}</a>`).join("");
    $("#footerCats").innerHTML = cats.map(([k, c]) => `<li><a href="#/tours?cat=${k}">${c.label}</a></li>`).join("");
    const cTour = $("#cTour");
    cTour.innerHTML += D.tours.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join("");
  }
  function openMobile(open) { $("#mobileNav").classList.toggle("open", open); $("#mobileNav").setAttribute("aria-hidden", !open); }

  /* ---------------- Router ---------------- */
  let currentView = null;
  const titles = { home: "Crownland Safaris Tour — Private Kenya, Tanzania & Uganda Safaris", tours: "Safaris", builder: "Trip Builder", explore: "Explore & Migration", "travel-info": "Travel Info", about: "About", contact: "Contact" };
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const parts = path.split("/").filter(Boolean);
    return { view: parts[0] || "home", id: parts[1], q: new URLSearchParams(qs || "") };
  }
  function route() {
    if (location.hash && !location.hash.startsWith("#/")) return; // in-page anchors (e.g. skip link)
    const r = parseHash();
    let view = r.view;
    if (!$(`.view[data-view="${view}"]`)) view = "home";
    if (view === "tour" && !tourById(r.id)) { location.hash = "#/tours"; return; }
    const changed = view !== currentView || view === "tour";
    $$(".view").forEach(v => v.classList.toggle("active", v.dataset.view === view));
    $$("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === view || (view === "tour" && a.dataset.nav === "tours")));
    openMobile(false);
    currentView = view;
    ({ home: initHome, tours: () => initTours(r.q), tour: () => renderTour(r.id), builder: () => initBuilder(r.q), explore: initExplore, "travel-info": () => initInfo(r.q), contact: () => initContact(r.q) }[view] || (() => {}))();
    document.title = view === "tour" ? `${tourById(r.id).title} | Crownland Safaris Tour` : view === "home" ? titles.home : `${titles[view]} | Crownland Safaris Tour`;
    if (changed) { const de = document.documentElement; de.style.scrollBehavior = "auto"; window.scrollTo(0, 0); de.style.scrollBehavior = ""; }
    setTimeout(observeReveals, 50);
  }

  /* ---------------- Maps (Leaflet) ---------------- */
  const hasL = () => typeof window.L !== "undefined";
  function baseLayers() {
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    return {
      "Map": dark
        ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 16 })
        : L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 18 }),
      "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 18 }),
      "Street": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 19 })
    };
  }
  function makeMap(el, { base = "Map", zoom = 6, center = [-1.8, 36.2], scroll = false } = {}) {
    if (!hasL()) { el.innerHTML = `<div class="map-fallback">${icon("map")}<p>Interactive map unavailable offline.</p></div>`; return null; }
    const layers = baseLayers();
    const m = L.map(el, { scrollWheelZoom: scroll, zoomControl: true, attributionControl: true, layers: [layers[base]] }).setView(center, zoom);
    L.control.layers(layers, null, { position: "topright" }).addTo(m);
    return m;
  }
  const pinIcon = (cls = "") => hasL() && L.divIcon({ className: "", html: `<div class="cw-pin ${cls}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
  const numIcon = n => hasL() && L.divIcon({ className: "", html: `<div class="cw-num">${n}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
  function drawRoute(map, ids, layer) {
    layer.clearLayers();
    const pts = ids.map(id => D.places[id]).filter(Boolean).map(p => [p.lat, p.lng]);
    if (!pts.length) return;
    L.polyline(pts, { color: "#b9862a", weight: 4, opacity: .9, dashArray: "8 8" }).addTo(layer);
    const seen = {};
    ids.forEach((id, i) => {
      const p = D.places[id]; if (!p) return;
      const key = id; if (seen[key]) return; seen[key] = true;
      L.marker([p.lat, p.lng], { icon: numIcon(i + 1) }).bindTooltip(p.name, { direction: "top", offset: [0, -12] }).addTo(layer);
    });
    map.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 9 });
  }

  /* ---------------- HOME ---------------- */
  let homeDone = false, heroTimer, wordTimer;
  const heroImgs = [["hero-jeep.jpg", "Sunset game drive"], ["lion-walk.jpg", "Masai Mara lion"], ["elephants-pair.jpg", "Amboseli elephants"], ["savanna-sunset.jpg", "Serengeti plains"], ["gorilla.jpg", "Bwindi mountain gorilla"]];
  function initHome() {
    if (homeDone) { setTimeout(() => homeMig && homeMig.map && homeMig.map.invalidateSize(), 60); return; }
    homeDone = true;
    // hero slideshow
    const slides = $("#heroSlides"), dots = $("#heroDots");
    slides.innerHTML = heroImgs.map(([f], i) => `<div class="hero-slide ${i === 0 ? "active" : ""}" style="background-image:url('${IMG + f}')"></div>`).join("");
    dots.innerHTML = heroImgs.map(([, a], i) => `<button aria-label="${a}" class="${i === 0 ? "active" : ""}" data-i="${i}"></button>`).join("");
    let hi = 0;
    const show = i => { hi = i; $$(".hero-slide").forEach((s, k) => s.classList.toggle("active", k === i)); $$("#heroDots button").forEach((d, k) => d.classList.toggle("active", k === i)); };
    const auto = () => { clearInterval(heroTimer); heroTimer = setInterval(() => show((hi + 1) % heroImgs.length), 6500); };
    dots.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { show(+b.dataset.i); auto(); } });
    auto();
    // typewriter
    const words = ["lions", "elephants", "the migration", "gorillas", "Kilimanjaro", "leopards"];
    let wi = 0; const w = $("#heroWord");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const type = (word, k = 0, del = false) => {
        w.textContent = word.slice(0, k);
        if (!del && k < word.length) wordTimer = setTimeout(() => type(word, k + 1), 90);
        else if (!del) wordTimer = setTimeout(() => type(word, k, true), 1800);
        else if (k > 0) wordTimer = setTimeout(() => type(word, k - 1, true), 45);
        else { wi = (wi + 1) % words.length; type(words[wi]); }
      };
      type(words[0], words[0].length, false);
    }
    // search
    $("#searchWidget").addEventListener("submit", e => {
      e.preventDefault();
      const p = new URLSearchParams();
      if ($("#swDest").value) p.set("cat", $("#swDest").value);
      if ($("#swDur").value) p.set("dur", $("#swDur").value);
      if ($("#swBudget").value) p.set("max", $("#swBudget").value);
      if ($("#swInterest").value) p.set("tag", $("#swInterest").value);
      location.hash = "#/tours?" + p.toString();
    });
    // categories
    $("#catGrid").innerHTML = Object.entries(D.categories).map(([k, c], i) => {
      const ts = D.tours.filter(t => t.cat === k);
      const min = Math.min(...ts.map(fromPrice));
      return `<a class="cat-card reveal reveal-delay-${i % 4}" href="#/tours?cat=${k}"><img src="${IMG + c.img}" alt="" loading="lazy"><span class="count">${ts.length} tours</span><h3>${c.label}</h3><p>${c.desc}</p><span class="from">From <span data-usd="${min}">${money(min)}</span> pp ${icon("arrow")}</span></a>`;
    }).join("");
    // featured
    const tabs = [["popular", "Popular"], ["kenya", "Kenya"], ["kenya-tz", "Kenya + Tanzania"], ["uganda", "Uganda"], ["day", "Day trips"]];
    $("#featuredTabs").innerHTML = tabs.map(([k, l], i) => `<button class="tab ${i === 0 ? "active" : ""}" role="tab" data-tab="${k}">${l}</button>`).join("");
    const renderFeatured = k => {
      const list = k === "popular" ? D.tours.filter(t => t.badge).slice(0, 6) : D.tours.filter(t => t.cat === k).slice(0, 6);
      $("#featuredGrid").innerHTML = list.map(tourCard).join("");
    };
    $("#featuredTabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; $$("#featuredTabs .tab").forEach(x => x.classList.toggle("active", x === b)); renderFeatured(b.dataset.tab); });
    renderFeatured("popular");
    // wildlife
    $("#wildGrid").innerHTML = D.wildlife.map(w => `<div class="flip reveal" tabindex="0" role="button" aria-label="${w.name}: ${esc(w.fact)}"><div class="flip-inner">
      <div class="flip-face flip-front"><img src="${IMG + w.img}" alt="${w.name}" loading="lazy">${w.big5 ? `<span class="b5">Big Five</span>` : ""}<h3>${w.name}</h3></div>
      <div class="flip-face flip-back"><h3>${w.name}</h3><p>${w.fact}</p><small>${icon("pin", "")} Best seen: ${w.where}</small></div></div></div>`).join("");
    $$("#wildGrid .flip").forEach(f => { const t = () => f.classList.toggle("flipped"); f.addEventListener("click", t); f.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } }); });
    // heatmap, gallery, faq, stats
    renderHeat($("#heatTable"));
    renderGallery();
    renderFaq($("#homeFaq"), D.faqs.slice(0, 5));
    countUp();
    homeMig = migrationWidget({ range: "#homeMigRange", ticks: "#homeMigTicks", card: "#homeMigCard", play: "#homeMigPlay", map: "#homeMigMap", base: "Satellite", light: true });
  }
  let homeMig;

  function countUp() {
    const els = $$("[data-count]");
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      const el = en.target, target = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
      const step = now => { const p = Math.min(1, (now - t0) / 1400); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: .5 });
    els.forEach(e => io.observe(e));
  }

  /* Gallery + lightbox */
  const galleryImgs = [["lion-face.jpg", "Male lion portrait"], ["kilimanjaro.jpg", "Mount Kilimanjaro from Amboseli"], ["gorilla-tree.jpg", "Young mountain gorilla, Bwindi"], ["giraffe-sunset.jpg", "Giraffe at sunset"], ["flamingos-nakuru.jpg", "Flamingos at Lake Nakuru"], ["leopard-tree.jpg", "Leopard resting"], ["zebra-bw.jpg", "Zebra portrait"], ["elephant.jpg", "Elephant on the plains"], ["beach.jpg", "Indian Ocean coastline"], ["lionesses.jpg", "Lionesses on the prowl"], ["rhino.jpg", "Rhino mother and calf"], ["buffalo-sunset.jpg", "Buffalo herd at dusk"], ["antelope.jpg", "Antelope herd"], ["hiking.jpg", "Hiking a volcanic crater"], ["giraffe.jpg", "Giraffe portrait"], ["lion-cub.jpg", "Lion and cub"]];
  function renderGallery() {
    $("#gallery").innerHTML = galleryImgs.map(([f, a], i) => `<button data-lb-i="${i}" aria-label="Open ${a}"><img src="${IMG + f}" alt="${a}" loading="lazy"></button>`).join("");
    $("#gallery").addEventListener("click", e => { const b = e.target.closest("[data-lb-i]"); if (b) openLightbox(galleryImgs, +b.dataset.lbI); });
  }
  let lb = { list: [], i: 0 };
  function openLightbox(list, i) { lb = { list, i }; showLb(); $("#lightbox").classList.add("open"); document.body.style.overflow = "hidden"; }
  function showLb() { const [f, a] = lb.list[lb.i]; $("#lbImg").src = IMG + f; $("#lbImg").alt = a; $("#lbCount").textContent = `${lb.i + 1} / ${lb.list.length} · ${a}`; }
  function closeLb() { $("#lightbox").classList.remove("open"); document.body.style.overflow = ""; }
  function lbStep(d) { lb.i = (lb.i + d + lb.list.length) % lb.list.length; showLb(); }

  /* Heatmap */
  const heatRows = ["mara", "serengeti", "amboseli", "ngorongoro", "samburu", "nakuru", "tsavowest", "bwindi", "diani"];
  function renderHeat(table) {
    const now = new Date().getMonth();
    table.innerHTML = `<thead><tr><th>Destination</th>${MONTHS.map((m, i) => `<th data-col="${i}" class="${i === now ? "now" : ""}" title="Highlight ${MONTHS_LONG[i]}">${m}</th>`).join("")}</tr></thead>
      <tbody>${heatRows.map(id => { const p = D.places[id]; return `<tr><td>${p.name} <small class="muted">${p.country}</small></td>${p.best.map((r, i) => `<td class="r${r}" data-col="${i}" title="${p.name} in ${MONTHS_LONG[i]}: ${["", "rainy season", "good", "excellent"][r]}"><span></span></td>`).join("")}</tr>`; }).join("")}</tbody>`;
    const hl = c => $$("td[data-col],th[data-col]", table).forEach(td => td.classList.toggle("colhl", td.dataset.col == c));
    table.addEventListener("click", e => { const th = e.target.closest("th[data-col]"); if (th) { hl(th.dataset.col); toast(`Highlighted ${MONTHS_LONG[th.dataset.col]}`, "cal"); } });
    hl(now);
  }

  /* FAQ */
  function renderFaq(el, list) {
    el.innerHTML = list.map((f, i) => `<div class="faq-item"><button class="faq-q" aria-expanded="false">${f.q}<span class="pm">+</span></button><div class="faq-a"><div><p>${f.a}</p></div></div></div>`).join("") || `<p class="muted">No matching questions — try the chat assistant.</p>`;
    if (!el.dataset.bound) {
      el.dataset.bound = 1;
      el.addEventListener("click", e => { const q = e.target.closest(".faq-q"); if (!q) return; const it = q.parentElement; const open = !it.classList.contains("open"); it.classList.toggle("open", open); q.setAttribute("aria-expanded", open); });
    }
  }

  /* Migration widget (shared by home + explore) */
  function migrationWidget({ range, ticks, card, play, map: mapSel, base = "Map" }) {
    const r = $(range), tk = $(ticks), cd = $(card), pl = $(play);
    tk.innerHTML = MONTHS.map((m, i) => `<span data-m="${i}">${m[0]}</span>`).join("");
    let map = null, herd = null, trail = null, timer = null;
    const ensureMap = () => {
      if (map || !hasL()) { if (!hasL() && !map) $(mapSel).innerHTML = `<div class="map-fallback">${icon("map")}<p>Map unavailable offline</p></div>`; return; }
      map = makeMap($(mapSel), { base, zoom: 7, center: [-2.2, 34.9] });
      if (!map) return;
      L.polygon([[-1.0, 34.9], [-1.25, 35.4], [-1.7, 35.3], [-1.55, 34.85]], { color: "#e0b357", weight: 1, fillOpacity: .08 }).bindTooltip("Masai Mara (Kenya)").addTo(map);
      L.polygon([[-1.55, 34.0], [-1.6, 35.2], [-2.7, 35.5], [-3.2, 35.2], [-2.6, 34.1], [-2.0, 33.9]], { color: "#7fbf98", weight: 1, fillOpacity: .06 }).bindTooltip("Serengeti (Tanzania)").addTo(map);
      trail = L.polyline(D.migration.map(m => [m.lat, m.lng]).concat([[D.migration[0].lat, D.migration[0].lng]]), { color: "#fff", weight: 2, opacity: .55, dashArray: "4 8" }).addTo(map);
      herd = L.marker([0, 0], { icon: L.divIcon({ className: "", html: `<div class="cw-herd"></div>`, iconSize: [64, 64], iconAnchor: [32, 32] }) }).addTo(map);
      map.fitBounds(trail.getBounds().pad(0.3));
    };
    const set = i => {
      const m = D.migration[i];
      r.value = i;
      $$("span", tk).forEach(s => s.classList.toggle("active", +s.dataset.m === i));
      const ids = D.tours.filter(t => t.tags.includes("migration") && t.route.some(p => (m.lat > -1.9 ? p === "mara" : p === "serengeti"))).slice(0, 3);
      cd.innerHTML = `<span class="event">${m.event}</span><h3>${m.m}: ${m.area}</h3><p class="muted" style="margin-bottom:12px">${m.note}</p>
        <div class="mini-tours">${ids.map(t => `<a class="mini-tour" href="#/tour/${t.id}"><img src="${IMG + t.img}" alt=""><span><strong>${esc(t.title)}</strong><span>From <span data-usd="${fromPrice(t)}">${money(fromPrice(t))}</span> pp</span></span></a>`).join("")}</div>`;
      if (herd) { herd.setLatLng([m.lat, m.lng]); }
    };
    const stop = () => { clearInterval(timer); timer = null; pl.innerHTML = icon("play") + " Play year"; };
    pl.addEventListener("click", () => {
      if (timer) return stop();
      pl.innerHTML = icon("pause") + " Pause";
      timer = setInterval(() => set((+r.value + 1) % 12), 1400);
    });
    r.addEventListener("input", () => { stop(); set(+r.value); });
    tk.addEventListener("click", e => { const s = e.target.closest("[data-m]"); if (s) { stop(); set(+s.dataset.m); } });
    // lazy-init map when visible
    const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { ensureMap(); set(+r.value); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe($(mapSel));
    set(new Date().getMonth());
    return { get map() { return map; }, set };
  }

  /* ---------------- TOURS LIST ---------------- */
  const F = { cat: "", tags: new Set(), q: "", days: 10, price: 8000, sort: "pop", dur: "" };
  let toursBound = false;
  function initTours(q) {
    F.cat = q.get("cat") || "";
    F.tags = new Set(q.get("tag") ? [q.get("tag")] : []);
    F.dur = q.get("dur") || "";
    F.price = +(q.get("max") || 8000);
    F.q = q.get("q") || "";
    F.days = 10;
    const c = D.categories[F.cat];
    $("#toursTitle").textContent = c ? c.label : "All safaris";
    $("#toursDesc").textContent = c ? c.desc : "Private Kenya, Tanzania and Uganda safaris with instant pricing. Filter, compare and save your favourites.";
    $("#toursHeroImg").src = IMG + (c ? c.img : "lion-walk.jpg");
    $("#fCats").innerHTML = [["", "All"], ...Object.entries(D.categories).map(([k, v]) => [k, v.short])].map(([k, l]) => `<button class="chip ${F.cat === k ? "active" : ""}" data-cat="${k}">${l}</button>`).join("");
    $("#fTags").innerHTML = Object.entries(TAGS).map(([k, l]) => `<button class="chip ${F.tags.has(k) ? "active" : ""}" data-tag="${k}">${l}</button>`).join("");
    $("#fSearch").value = F.q; $("#fDays").value = F.days; $("#fPrice").value = F.price; $("#fSort").value = F.sort;
    if (!toursBound) {
      toursBound = true;
      $("#fCats").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; F.cat = b.dataset.cat; $$("#fCats .chip").forEach(x => x.classList.toggle("active", x === b)); const c = D.categories[F.cat]; $("#toursTitle").textContent = c ? c.label : "All safaris"; renderTourList(); });
      $("#fTags").addEventListener("click", e => { const b = e.target.closest("[data-tag]"); if (!b) return; const k = b.dataset.tag; F.tags.has(k) ? F.tags.delete(k) : F.tags.add(k); b.classList.toggle("active"); renderTourList(); });
      $("#fSearch").addEventListener("input", debounce(() => { F.q = $("#fSearch").value; renderTourList(); }));
      $("#fDays").addEventListener("input", () => { F.days = +$("#fDays").value; F.dur = ""; renderTourList(); });
      $("#fPrice").addEventListener("input", () => { F.price = +$("#fPrice").value; renderTourList(); });
      $("#fSort").addEventListener("change", () => { F.sort = $("#fSort").value; renderTourList(); });
      $("#resetFilters").addEventListener("click", () => { location.hash = "#/tours"; });
      $("#openFilters").addEventListener("click", () => $("#filters").classList.add("open"));
      $("#applyFilters").addEventListener("click", () => $("#filters").classList.remove("open"));
    }
    renderTourList();
  }
  function renderTourList() {
    const [dmin, dmax] = F.dur ? F.dur.split("-").map(Number) : [0, F.days];
    $("#fDaysOut").textContent = F.dur ? `${dmin}–${dmax} days` : `Up to ${F.days} days`;
    $("#fPriceOut").textContent = `Up to ${money(F.price)} pp`;
    const q = F.q.trim().toLowerCase();
    let list = D.tours.filter(t => {
      if (F.cat && t.cat !== F.cat) return false;
      if (t.days > dmax || t.days < dmin) return false;
      if (fromPrice(t) > F.price) return false;
      for (const tg of F.tags) if (!t.tags.includes(tg)) return false;
      if (q) {
        const hay = [t.title, t.summary, ...t.route.map(placeName), ...t.tags, ...(t.highlights || [])].join(" ").toLowerCase();
        if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
      }
      return true;
    });
    const s = { "price-asc": (a, b) => fromPrice(a) - fromPrice(b), "price-desc": (a, b) => fromPrice(b) - fromPrice(a), "days-asc": (a, b) => a.days - b.days, "days-desc": (a, b) => b.days - a.days }[F.sort];
    if (s) list = list.slice().sort(s);
    $("#resultCount").textContent = `${list.length} safari${list.length === 1 ? "" : "s"} found`;
    $("#tourGrid").innerHTML = list.length ? list.map(tourCard).join("") : `<div class="empty-state">${icon("binoc", "")}<h3>No safaris match those filters</h3><p>Try widening your budget or duration — or design exactly what you want.</p><a class="btn btn-gold" href="#/builder">Open Trip Builder</a></div>`;
  }

  /* ---------------- TOUR DETAIL ---------------- */
  let detailState = null, detailMap = null;
  function renderTour(id) {
    const t = tourById(id);
    const now = new Date(); const def = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    detailState = { t, adults: 2, kids: 0, date: def.toISOString().slice(0, 10), tier: t.tierRates ? "midrange" : t.defaultTier };
    const route = uniqRoute(t.route);
    const tierable = t.tiers || t.tierRates;
    const tierOpts = t.tierRates ? [["midrange", "Mid-range"], ["luxury", "Luxury"]] : [["budget", "Camping"], ["midrange", "Mid-range"], ["luxury", "Luxury"]];
    const gal = [t.img, ...(t.gallery || [])].map(f => [f, t.title]);
    $("#tourView").innerHTML = `
      <div class="detail-hero"><img src="${IMG + t.img}" alt="${esc(t.title)}">
        <div class="container">
          <div class="breadcrumbs"><a href="#/">Home</a> / <a href="#/tours?cat=${t.cat}">${D.categories[t.cat].label}</a> / <span>${daysLabel(t)}</span></div>
          <h1>${esc(t.title)}</h1>
          <div class="detail-meta">
            <span class="pill">${icon("clock")} ${t.duration || daysLabel(t)}</span>
            <span class="pill">${icon("pin")} ${route.length} stops</span>
            <span class="pill">${icon("car")} Private tour</span>
            <span class="pill">${icon("users")} Any group size</span>
            ${t.badge ? `<span class="pill" style="background:var(--gold);color:#1a1406">${icon("crown")} ${t.badge}</span>` : ""}
          </div>
        </div>
      </div>
      <nav class="detail-nav" aria-label="Tour sections"><div class="container">
        <a href="#ov" data-jump="ov" class="active">Overview</a><a href="#it" data-jump="it">Itinerary</a><a href="#mp" data-jump="mp">Route map</a><a href="#pr" data-jump="pr">Prices</a><a href="#in" data-jump="in">What's included</a>
      </div></nav>
      <div class="container detail-layout" style="padding-bottom:60px">
        <div>
          <section class="detail-block" id="ov">
            <span class="eyebrow">Overview</span>
            <p class="lead">${t.summary}</p>
            <div class="gallery-strip">${gal.slice(0, 3).map(([f], i) => `<button data-gal="${i}" aria-label="Open photo ${i + 1}"><img src="${IMG + f}" alt="" loading="lazy"></button>`).join("")}</div>
            <h3>Highlights</h3>
            <ul class="highlight-list">${t.highlights.map(h => `<li>${icon("check")}${h}</li>`).join("")}</ul>
            <div class="tags" style="margin-top:16px">${t.tags.filter(x => TAGS[x]).map(x => `<a class="tag" href="#/tours?tag=${x}">${TAGS[x]}</a>`).join("")}</div>
          </section>
          <section class="detail-block" id="it">
            <div style="display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:10px"><div><span class="eyebrow">Day by day</span><h2>Itinerary</h2></div>
            <div class="tl-controls"><button class="btn btn-ghost btn-sm" data-tl="open">Expand all</button><button class="btn btn-ghost btn-sm" data-tl="close">Collapse</button></div></div>
            <ol class="timeline">${t.itinerary.map((d, i) => `<li class="tl-item ${i === 0 ? "open" : ""}"><span class="tl-day">${t.days < 2 ? icon("clock") : "D" + (i + 1)}</span>
              <button class="tl-head" aria-expanded="${i === 0}"><span><small>${t.days < 2 ? "Programme" : "Day " + (i + 1)}</small>${esc(d.t)}</span>${icon("down")}</button>
              <div class="tl-body"><div><p>${esc(d.d)}</p></div></div></li>`).join("")}</ol>
          </section>
          <section class="detail-block" id="mp">
            <span class="eyebrow">Your route</span><h2>Route map</h2>
            <div class="route-map" id="routeMap"></div>
            <p class="muted" style="font-size:.85rem;margin-top:8px">${route.map(placeName).join(" → ")}</p>
          </section>
          <section class="detail-block" id="pr">
            <span class="eyebrow">Transparent pricing</span><h2>Rates per person</h2>
            ${rateTable(t)}
            ${t.seasonNote ? `<p class="muted" style="font-size:.86rem;margin-top:10px">${t.seasonNote}</p>` : ""}
            ${t.stay ? `<h3 style="margin-top:28px">Where you'll stay</h3><div class="stay-list">${t.stay.map(s => `<span>${icon("tent")}${esc(s)}</span>`).join("")}</div><p class="muted" style="font-size:.84rem;margin-top:8px">Or similar, subject to availability.</p>` : ""}
          </section>
          <section class="detail-block" id="in">
            <span class="eyebrow">The fine print</span><h2>What's included</h2>
            <div class="inc-grid">
              <div class="inc-box yes"><h4>${icon("check")} Included</h4><ul>${t.inc.map(x => `<li>${icon("check")}<span>${x}</span></li>`).join("")}</ul></div>
              <div class="inc-box no"><h4>${icon("x")} Not included</h4><ul>${t.exc.map(x => `<li>${icon("x")}<span>${x}</span></li>`).join("")}</ul></div>
            </div>
          </section>
          <section class="detail-block">
            <h2>You may also like</h2>
            <div class="tour-grid">${D.tours.filter(x => x.id !== t.id && (x.cat === t.cat || x.tags.some(g => t.tags.includes(g)))).sort((a, b) => Math.abs(a.days - t.days) - Math.abs(b.days - t.days)).slice(0, 2).map(tourCard).join("")}</div>
          </section>
        </div>
        <aside class="book-card" aria-label="Price calculator">
          <div class="from-price"><span class="muted" style="font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em">From</span><strong data-usd="${fromPrice(t)}">${money(fromPrice(t))}</strong><span class="muted">per person</span></div>
          <p class="muted" style="font-size:.84rem;margin:6px 0 18px">Based on 2 people sharing${t.seasonal || t.rates && !t.rates.all || t.tierRates ? ", low season" : ""}.</p>
          <div class="form-row"><label for="qDate">Start date</label><input type="date" id="qDate" value="${detailState.date}" min="${now.toISOString().slice(0, 10)}"></div>
          <div class="form-grid-2">
            <div class="form-row"><span class="form-label">Adults</span><div class="stepper" data-stepper="qAdults" data-min="1" data-max="12"><button type="button" data-d="-1" aria-label="Fewer adults">−</button><output id="qAdults">2</output><button type="button" data-d="1" aria-label="More adults">+</button></div></div>
            <div class="form-row"><span class="form-label">Children 3–11</span><div class="stepper" data-stepper="qKids" data-min="0" data-max="8"><button type="button" data-d="-1" aria-label="Fewer children">−</button><output id="qKids">0</output><button type="button" data-d="1" aria-label="More children">+</button></div></div>
          </div>
          ${tierable ? `<div class="form-row"><span class="form-label">Accommodation</span><div class="segmented" id="qTier">${tierOpts.map(([k, l]) => `<button type="button" data-tier="${k}" class="${k === detailState.tier ? "active" : ""}">${l}</button>`).join("")}</div></div>` : ""}
          <div class="quote-box" id="qBox"></div>
          <button class="btn btn-gold btn-block" id="qBook">${icon("cal")} Request to book</button>
          <div style="display:flex;gap:8px;margin-top:10px">
            <a class="btn btn-whatsapp btn-sm" style="flex:1" id="qWa" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>
            <button class="icon-btn heart-inline ${saved.has(t.id) ? "on" : ""}" data-save="${t.id}" aria-label="Save tour">${icon("heart")}</button>
            <button class="icon-btn" id="qShare" aria-label="Share">${icon("share")}</button>
            <button class="icon-btn" onclick="window.print()" aria-label="Print itinerary">${icon("print")}</button>
          </div>
          <div class="assure"><span>${icon("check")} No booking fees · private guide</span><span>${icon("check")} Reply within 24 hours</span><span>${icon("check")} Secure ${CFG.depositPercent}% deposit to confirm</span></div>
        </aside>
      </div>`;
    // interactions
    const view = $("#tourView");
    view.querySelector(".gallery-strip").addEventListener("click", e => { const b = e.target.closest("[data-gal]"); if (b) openLightbox(gal, +b.dataset.gal); });
    $$(".tl-head", view).forEach(h => h.addEventListener("click", () => { const li = h.parentElement; li.classList.toggle("open"); h.setAttribute("aria-expanded", li.classList.contains("open")); }));
    $$("[data-tl]", view).forEach(b => b.addEventListener("click", () => $$(".tl-item", view).forEach(li => li.classList.toggle("open", b.dataset.tl === "open"))));
    $$("[data-jump]", view).forEach(a => a.addEventListener("click", e => { e.preventDefault(); $("#" + a.dataset.jump).scrollIntoView({ behavior: "smooth" }); }));
    const secs = ["ov", "it", "mp", "pr", "in"].map(id => $("#" + id));
    const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$("[data-jump]", view).forEach(a => a.classList.toggle("active", a.dataset.jump === en.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach(s => spy.observe(s));
    $("#qDate").addEventListener("change", e => { detailState.date = e.target.value; updateQuote(); });
    if ($("#qTier")) $("#qTier").addEventListener("click", e => { const b = e.target.closest("[data-tier]"); if (!b) return; detailState.tier = b.dataset.tier; $$("#qTier button").forEach(x => x.classList.toggle("active", x === b)); updateQuote(); });
    $("#qBook").addEventListener("click", () => openEnquiry({ tour: t, ...detailState }));
    $("#qShare").addEventListener("click", () => share(t.title, location.href));
    updateQuote();
    // route map
    setTimeout(() => {
      if (detailMap) { detailMap.remove(); detailMap = null; }
      detailMap = makeMap($("#routeMap"), { base: "Map" });
      if (detailMap) { const lay = L.layerGroup().addTo(detailMap); drawRoute(detailMap, route, lay); }
    }, 80);
  }
  function rateTable(t) {
    const row = (label, cells) => `<tr><td>${label}</td>${cells.map(v => `<td><strong data-usd="${v}">${money(v)}</strong></td>`).join("")}</tr>`;
    if (t.tierRates) {
      return `<table class="rate-table"><thead><tr><th>Accommodation</th><th>Jan – Jun</th><th>Jul – Dec</th></tr></thead><tbody>
        ${row("Mid-range", [t.tierRates.midrange.low, t.tierRates.midrange.high])}${row("Luxury", [t.tierRates.luxury.low, t.tierRates.luxury.high])}</tbody></table>`;
    }
    if (t.rates && t.rates.all) {
      const ks = Object.keys(t.rates.all).map(Number);
      return `<table class="rate-table"><thead><tr><th>Group size</th><th>Per person</th></tr></thead><tbody>
        ${ks.map(k => row(`${k}${k === Math.max(...ks) && k > 2 ? "+" : ""} ${k === 1 ? "traveller (solo)" : "travellers"}`, [t.rates.all[k]])).join("")}</tbody></table>`;
    }
    if (t.rates) {
      return `<table class="rate-table"><thead><tr><th>Season</th><th>2 people</th><th>4 people</th></tr></thead><tbody>
        ${row("Low season", [t.rates.low[2], t.rates.low[4]])}${row("High season", [t.rates.high[2], t.rates.high[4]])}</tbody></table>`;
    }
    const sizes = [1, 2, 4, 6];
    const head = t.seasonal ? `<th>Low season</th><th>High season</th>` : `<th>Per person</th>`;
    return `<table class="rate-table"><thead><tr><th>Group size</th>${head}</tr></thead><tbody>
      ${sizes.map(n => row(`${n} ${n === 1 ? "traveller" : "travellers"}`, t.seasonal ? [ppPrice(t, n, 2), ppPrice(t, n, 8)] : [ppPrice(t, n, 2)])).join("")}</tbody></table>`;
  }
  function updateQuote() {
    if (!detailState || !$("#qBox")) return;
    const s = detailState, t = s.t;
    s.adults = +$("#qAdults").textContent; s.kids = +$("#qKids").textContent;
    const month = s.date ? new Date(s.date + "T00:00").getMonth() + 1 : 2;
    const q = quote(t, { adults: s.adults, kids: s.kids, month, tier: s.tier });
    s.q = q; s.month = month;
    $("#qBox").innerHTML = `
      ${q.seasonal ? `<div style="margin-bottom:8px"><span class="season-tag ${q.high ? "high" : "low"}">${q.high ? "High season" : "Low season"} · ${MONTHS_LONG[month - 1]}</span></div>` : ""}
      <div class="quote-line"><span>${s.adults} adult${s.adults > 1 ? "s" : ""} × ${money(q.pp)}</span><span>${money(q.pp * s.adults)}</span></div>
      ${s.kids ? `<div class="quote-line"><span>${s.kids} child${s.kids > 1 ? "ren" : ""} × ${money(q.kidPP)}</span><span>${money(q.kidPP * s.kids)}</span></div>` : ""}
      <div class="quote-total"><span class="muted">Estimated total</span><strong>${money(q.total)}</strong></div>
      <div class="quote-line muted" style="font-size:.8rem"><span>Deposit to confirm (${CFG.depositPercent}%)</span><span>${money(q.total * CFG.depositPercent / 100)}</span></div>`;
    $("#qWa").href = waLink(`Hello Crownland Safaris! I'm interested in "${t.title}" starting ${s.date || "TBC"} for ${s.adults} adult(s)${s.kids ? " and " + s.kids + " child(ren)" : ""}. Estimated ${money(q.total, "USD")}. Please confirm availability.`);
  }
  function rerenderQuotes() { if (currentView === "tour") updateQuote(); if (currentView === "builder") renderBuilder(); renderTourList && currentView === "tours" && renderTourList(); }

  /* Steppers (event delegation) */
  document.addEventListener("click", e => {
    const b = e.target.closest(".stepper [data-d]");
    if (!b) return;
    const st = b.closest(".stepper"); const out = st.querySelector("output");
    const v = Math.max(+st.dataset.min, Math.min(+st.dataset.max, +out.textContent + +b.dataset.d));
    out.textContent = v;
    if (st.dataset.stepper.startsWith("q")) updateQuote();
    if (st.dataset.stepper.startsWith("b")) { B.adults = +$("#bAdults").textContent; B.kids = +$("#bKids").textContent; renderBuilder(); }
    if (st.dataset.stepper.startsWith("n-")) { const id = st.dataset.stepper.slice(2); const p = B.parks.find(x => x.id === id); if (p) { p.nights = v; renderBuilder(); } }
  });

  /* ---------------- TRIP BUILDER ---------------- */
  const B = { parks: [], tier: "midrange", adults: 2, kids: 0, date: "", start: "nairobi" };
  let builderDone = false, bMap = null, bLayer = null;
  function initBuilder(q) {
    if (q && q.get("p")) {
      B.parks = q.get("p").split(",").map(s => { const [id, n] = s.split(":"); return { id, nights: +n || 1 }; }).filter(p => D.builderParks.some(b => b.id === p.id));
      B.tier = q.get("t") || B.tier; B.adults = +(q.get("a") || 2); B.kids = +(q.get("k") || 0); B.start = q.get("s") || "nairobi"; B.date = q.get("d") || "";
    }
    if (!builderDone) {
      builderDone = true;
      $("#parkPicker").innerHTML = D.builderParks.map(bp => { const p = D.places[bp.id]; return `<button class="park-opt" data-park="${bp.id}" aria-pressed="false"><img src="${IMG + p.img}" alt="" loading="lazy"><span class="check">${icon("check")}</span><span class="po-body"><strong>${p.name}</strong><small>${p.country} · ~<span data-usd="${bp.rate}">${money(bp.rate)}</span>/night${bp.note ? " · " + bp.note : ""}</small></span></button>`; }).join("");
      $("#parkPicker").addEventListener("click", e => {
        const b = e.target.closest("[data-park]"); if (!b) return;
        const id = b.dataset.park, i = B.parks.findIndex(p => p.id === id);
        if (i >= 0) B.parks.splice(i, 1); else { B.parks.push({ id, nights: D.builderParks.find(x => x.id === id).rec }); toast(`${placeName(id)} added`, "pin"); }
        renderBuilder();
      });
      $("#tierCards").addEventListener("click", e => { const b = e.target.closest("[data-tier]"); if (!b) return; B.tier = b.dataset.tier; renderBuilder(); });
      $("#bDate").addEventListener("change", e => { B.date = e.target.value; renderBuilder(); });
      $("#bStart").addEventListener("change", e => { B.start = e.target.value; renderBuilder(); });
      $("#selList").addEventListener("click", e => {
        const b = e.target.closest("[data-move],[data-remove]"); if (!b) return;
        const i = +b.dataset.i;
        if (b.dataset.remove != null) B.parks.splice(i, 1);
        else { const j = i + +b.dataset.move; if (j >= 0 && j < B.parks.length) [B.parks[i], B.parks[j]] = [B.parks[j], B.parks[i]]; }
        renderBuilder();
      });
      $("#builderEnquire").addEventListener("click", () => {
        if (!B.parks.length) return toast("Add at least one park first", "info");
        openEnquiry({ custom: builderSummaryText(), adults: B.adults, kids: B.kids, date: B.date, total: builderCalc().total });
      });
      $("#builderShare").addEventListener("click", () => share("My Crownland safari", location.href.split("#")[0] + builderHash()));
      $("#builderReset").addEventListener("click", () => { B.parks = []; renderBuilder(); });
      const d = new Date(); d.setMonth(d.getMonth() + 3); d.setDate(1);
      if (!B.date) B.date = d.toISOString().slice(0, 10);
    }
    $("#bDate").value = B.date; $("#bStart").value = B.start; $("#bAdults").textContent = B.adults; $("#bKids").textContent = B.kids;
    setTimeout(() => {
      if (!bMap) { bMap = makeMap($("#builderMap"), { zoom: 5, center: [-1.5, 35] }); if (bMap) bLayer = L.layerGroup().addTo(bMap); }
      else bMap.invalidateSize();
      renderBuilder();
    }, 60);
    renderBuilder();
  }
  const builderHash = () => `#/builder?p=${B.parks.map(p => p.id + ":" + p.nights).join(",")}&t=${B.tier}&a=${B.adults}&k=${B.kids}&s=${B.start}&d=${B.date}`;
  function builderCalc() {
    const nights = B.parks.reduce((s, p) => s + p.nights, 0);
    const month = B.date ? new Date(B.date + "T00:00").getMonth() + 1 : 2;
    const high = CFG.highSeasonMonths.includes(month);
    const pax = B.adults + B.kids;
    let base = B.parks.reduce((s, p) => s + D.builderParks.find(x => x.id === p.id).rate * p.nights, 0);
    const lines = [];
    const tierF = CFG.tierFactors[B.tier];
    // permits are fixed — don't scale by tier
    const permit = B.parks.reduce((s, p) => s + (p.id === "bwindi" ? 800 : p.id === "kibale" ? 250 : 0), 0);
    let stay = (base - permit) * tierF * gf(pax) / gf(2);
    if (high) stay *= CFG.highSeasonFactor;
    lines.push(["Safari, lodges & park fees", stay]);
    if (permit) lines.push(["Gorilla / chimp permits", permit]);
    const ug = B.parks.some(p => ["bwindi", "kibale"].includes(p.id)), ea = B.parks.some(p => !["bwindi", "kibale", "diani"].includes(p.id));
    if (ug && ea) lines.push(["Regional flight Kenya ⇄ Uganda", 420]);
    if (B.parks.some(p => p.id === "diani") && B.start !== "diani") lines.push(["Domestic flight to the coast", 160]);
    lines.push(["Airport transfers & arrival support", 60]);
    const pp = Math.round(lines.reduce((s, l) => s + l[1], 0));
    return { pp, kidPP: Math.round(pp * CFG.childFactor), total: Math.round(pp * B.adults + pp * CFG.childFactor * B.kids), nights, days: nights + 1, high, month, lines };
  }
  function renderBuilder() {
    if (!$("#parkPicker")) return;
    $$("#parkPicker .park-opt").forEach(b => { const on = B.parks.some(p => p.id === b.dataset.park); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    $$("#tierCards .option-card").forEach(b => b.classList.toggle("active", b.dataset.tier === B.tier));
    $("#selList").innerHTML = B.parks.length ? B.parks.map((p, i) => `<li class="sel-item"><span class="num">${i + 1}</span><strong>${placeName(p.id)}</strong>
      <div class="stepper" data-stepper="n-${p.id}" data-min="1" data-max="7"><button type="button" data-d="-1" aria-label="Fewer nights">−</button><output>${p.nights}</output><button type="button" data-d="1" aria-label="More nights">+</button></div>
      <span class="ord"><button data-move="-1" data-i="${i}" aria-label="Move up">▲</button><button data-move="1" data-i="${i}" aria-label="Move down">▼</button><button data-remove data-i="${i}" aria-label="Remove">✕</button></span></li>`).join("")
      : `<li class="muted" style="font-size:.9rem;padding:10px;text-align:center;border:2px dashed var(--line);border-radius:12px">Tap parks on the left to start building your route.</li>`;
    const c = builderCalc();
    $("#builderQuote").innerHTML = B.parks.length ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong>${c.days} days / ${c.nights} nights</strong><span class="season-tag ${c.high ? "high" : "low"}">${c.high ? "High" : "Low"} season</span></div>
      ${c.lines.map(([l, v]) => `<div class="quote-line"><span>${l}</span><span>${money(v)}</span></div>`).join("")}
      <div class="quote-line" style="border-top:1px dashed var(--line);margin-top:6px;padding-top:6px"><span>Per adult</span><strong>${money(c.pp)}</strong></div>
      ${B.kids ? `<div class="quote-line"><span>Per child</span><span>${money(c.kidPP)}</span></div>` : ""}
      <div class="quote-total"><span class="muted">Estimated total</span><strong>${money(c.total)}</strong></div>` : `<p class="muted" style="margin:0;font-size:.9rem">Your live estimate appears here.</p>`;
    // itinerary
    let d = 1; const it = [];
    const start = placeName(B.start);
    B.parks.forEach((p, i) => {
      const from = i === 0 ? start : placeName(B.parks[i - 1].id);
      it.push(`<li><b>Day ${d}</b><span>${from} → ${placeName(p.id)} · afternoon game drive</span></li>`); d++;
      for (let n = 1; n < p.nights; n++) { it.push(`<li><b>Day ${d}</b><span>Full day in ${placeName(p.id)}</span></li>`); d++; }
    });
    if (B.parks.length) it.push(`<li><b>Day ${d}</b><span>${placeName(B.parks[B.parks.length - 1].id)} → ${start} · departure</span></li>`);
    $("#genItin").innerHTML = it.join("");
    if (bMap && bLayer) {
      const ids = [B.start, ...B.parks.map(p => p.id), B.start];
      if (B.parks.length) drawRoute(bMap, ids, bLayer); else { bLayer.clearLayers(); bMap.setView([-1.5, 35], 5); }
    }
    if (currentView === "builder" && B.parks.length) history.replaceState(null, "", builderHash());
  }
  function builderSummaryText() {
    const c = builderCalc();
    return `Tailor-made safari (${c.days} days): ${B.parks.map(p => `${placeName(p.id)} ${p.nights}n`).join(" → ")} · ${B.tier} · start ${placeName(B.start)}`;
  }

  /* ---------------- EXPLORE ---------------- */
  let exploreDone = false, eMap = null, eMarkers = {}, exploreMig;
  function initExplore() {
    if (exploreDone) { setTimeout(() => { eMap && eMap.invalidateSize(); exploreMig && exploreMig.map && exploreMig.map.invalidateSize(); }, 60); return; }
    exploreDone = true;
    const countries = ["All", "Kenya", "Tanzania", "Uganda"];
    $("#countryTabs").innerHTML = countries.map((c, i) => `<button class="tab ${i === 0 ? "active" : ""}" data-country="${c}">${c}</button>`).join("");
    setTimeout(() => {
      eMap = makeMap($("#exploreMap"), { zoom: 6, center: [-1.5, 35.5], base: "Map" });
      if (eMap) {
        Object.entries(D.places).forEach(([id, p]) => {
          eMarkers[id] = L.marker([p.lat, p.lng], { icon: pinIcon(p.type === "city" ? "city" : ""), title: p.name, keyboard: true })
            .bindTooltip(p.name, { direction: "top", offset: [0, -10] }).on("click", () => selectPlace(id)).addTo(eMap);
        });
      }
      selectPlace("mara");
    }, 60);
    $("#countryTabs").addEventListener("click", e => {
      const b = e.target.closest("[data-country]"); if (!b) return;
      $$("#countryTabs .tab").forEach(x => x.classList.toggle("active", x === b));
      const c = b.dataset.country;
      const ids = Object.keys(D.places).filter(id => c === "All" || D.places[id].country === c);
      if (eMap) eMap.fitBounds(L.latLngBounds(ids.map(id => [D.places[id].lat, D.places[id].lng])).pad(0.2));
      selectPlace({ All: "mara", Kenya: "amboseli", Tanzania: "serengeti", Uganda: "bwindi" }[c]);
    });
    exploreMig = migrationWidget({ range: "#migRange", ticks: "#migTicks", card: "#migCard", play: "#migPlay", map: "#migMap", base: "Satellite" });
    renderHeat($("#heatTable2"));
  }
  function selectPlace(id) {
    const p = D.places[id];
    Object.entries(eMarkers).forEach(([k, m]) => { const el = m.getElement(); if (el) el.firstChild.classList.toggle("active", k === id); });
    if (eMap) eMap.panTo([p.lat, p.lng]);
    const tours = D.tours.filter(t => t.route.includes(id));
    const m = new Date().getMonth();
    $("#placePanel").innerHTML = `
      <img src="${IMG + p.img}" alt="${p.name}">
      <div><span class="eyebrow" style="margin-bottom:4px">${p.country} · ${p.type}</span><h3 style="font-size:1.6rem;margin:0">${p.name}</h3></div>
      <p class="muted" style="margin:0">${p.blurb}</p>
      <div><strong style="font-size:.85rem">Wildlife</strong><div class="tags" style="margin-top:6px">${p.wildlife.map(w => `<span class="tag">${w}</span>`).join("")}</div></div>
      <div><strong style="font-size:.85rem">Best months</strong>
        <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:3px;margin-top:6px">${p.best.map((r, i) => `<div title="${MONTHS_LONG[i]}" style="text-align:center;font-size:.66rem;font-weight:700;color:var(--muted)"><div style="height:${10 + r * 10}px;border-radius:4px;margin-bottom:3px;background:${["", "#e2c9a0", "#a9c98a", "#3f8a5c"][r]};${i === m ? "outline:2px solid var(--gold)" : ""}"></div>${MONTHS[i][0]}</div>`).join("")}</div></div>
      <div><strong style="font-size:.85rem">${tours.length} safari${tours.length === 1 ? "" : "s"} visit ${p.name}</strong>
        <div class="mini-tours" style="margin-top:8px">${tours.slice(0, 6).map(t => `<a class="mini-tour" href="#/tour/${t.id}"><img src="${IMG + t.img}" alt=""><span><strong>${esc(t.title)}</strong><span>${daysLabel(t)} · from <span data-usd="${fromPrice(t)}">${money(fromPrice(t))}</span></span></span></a>`).join("") || `<a class="btn btn-gold btn-sm" href="#/builder">Add it to a custom trip</a>`}</div></div>`;
    $("#placePanel").scrollTop = 0;
  }

  /* ---------------- TRAVEL INFO ---------------- */
  let infoDone = false;
  function initInfo(q) {
    const tab = q && q.get("tab");
    if (!infoDone) {
      infoDone = true;
      $("#healthGrid").innerHTML = D.health.map(h => `<div class="health-card"><span class="ico">${icon(h.icon)}</span><div><h3>${h.t}</h3><p>${h.d}</p></div></div>`).join("");
      $("#infoTabs").addEventListener("click", e => { const b = e.target.closest("[data-panel]"); if (b) showInfo(b.dataset.panel); });
      // packing
      const done = new Set(store.get("cl-pack", []));
      const total = D.packing.reduce((s, g) => s + g.items.length, 0);
      const prog = () => { $("#packProgress").style.width = (done.size / total * 100) + "%"; };
      $("#packGrid").innerHTML = D.packing.map((g, gi) => `<div class="pack-col"><h4>${g.g}</h4>${g.items.map((it, ii) => { const k = gi + "-" + ii; return `<label class="${done.has(k) ? "done" : ""}"><input type="checkbox" data-k="${k}" ${done.has(k) ? "checked" : ""}><span>${it}</span></label>`; }).join("")}</div>`).join("");
      $("#packGrid").addEventListener("change", e => { const k = e.target.dataset.k; if (!k) return; e.target.checked ? done.add(k) : done.delete(k); e.target.parentElement.classList.toggle("done", e.target.checked); store.set("cl-pack", [...done]); prog(); if (done.size === total) toast("All packed — have an amazing safari!", "sparkle"); });
      $("#packReset").addEventListener("click", () => { done.clear(); store.set("cl-pack", []); $$("#packGrid input").forEach(i => { i.checked = false; i.parentElement.classList.remove("done"); }); prog(); });
      prog();
      // faq
      renderFaq($("#fullFaq"), D.faqs);
      $("#faqSearch").addEventListener("input", debounce(() => { const s = $("#faqSearch").value.toLowerCase(); renderFaq($("#fullFaq"), D.faqs.filter(f => (f.q + f.a).toLowerCase().includes(s))); }, 150));
      // pill planner
      $("#ptCalc").addEventListener("click", planPills);
    }
    showInfo(tab || "health");
  }
  function showInfo(p) {
    $$("#infoTabs .tab").forEach(b => b.classList.toggle("active", b.dataset.panel === p));
    $$(".info-panel").forEach(x => x.classList.toggle("active", x.dataset.panel === p));
  }
  /* Malaria chemoprophylaxis schedule — per CDC Yellow Book regimens */
  const DRUGS = {
    ap: { name: "Atovaquone‑proguanil", every: 1, before: 1, beforeLabel: "1–2 days before", after: 7, afterLabel: "7 days after leaving",
          tips: ["Take once daily at the same time, with food or a milky drink.", "If you vomit within 1 hour of a dose, take another dose.", "Not suitable in severe kidney impairment or (generally) pregnancy — tell your prescriber."] },
    doxy: { name: "Doxycycline", every: 1, before: 1, beforeLabel: "1–2 days before", after: 28, afterLabel: "4 weeks after leaving",
          tips: ["Take with a full glass of water and food, and stay upright for 30 minutes — don't take it just before bed.", "It increases sun sensitivity: use high-SPF sunscreen and cover up.", "Not for pregnancy or children under 8."] },
    meflo: { name: "Mefloquine", every: 7, before: 14, beforeLabel: "at least 2 weeks before", after: 28, afterLabel: "4 weeks after leaving",
          tips: ["Take once a week on the same day of the week, after a meal.", "Stop and seek medical advice if you notice anxiety, depression, restlessness, confusion or sleep problems.", "Not suitable with some heart-rhythm, psychiatric or seizure conditions."] }
  };
  function planPills() {
    const a = $("#ptArrive").value, l = $("#ptLeave").value, d = DRUGS[$("#ptDrug").value];
    const out = $("#ptResult");
    if (!a || !l || l < a) { toast("Please enter valid travel dates", "info"); return; }
    const day = 864e5, A = new Date(a + "T00:00"), Lv = new Date(l + "T00:00");
    const start = new Date(A - d.before * day), end = new Date(+Lv + d.after * day);
    const doses = []; for (let t = +start; t <= +end; t += d.every * day) doses.push(new Date(t));
    const fmt = x => x.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const cls = x => x < A ? "pre" : x <= Lv ? "trip" : "post";
    out.innerHTML = `<div class="inc-grid" style="margin-top:6px">
        <div class="inc-box"><h4>${icon("pill")} ${d.name}</h4><ul>
          <li>${icon("check")}<span><strong>First dose:</strong> ${fmt(start)} (${d.beforeLabel} entering the malaria area)</span></li>
          <li>${icon("check")}<span><strong>Last dose:</strong> ${fmt(end)} (${d.afterLabel})</span></li>
          <li>${icon("check")}<span><strong>Total doses:</strong> ${doses.length} ${d.every === 7 ? "weekly" : "daily"} tablets — pack a few spare.</span></li></ul></div>
        <div class="inc-box"><h4>${icon("info")} Taking it well</h4><ul>${d.tips.map(x => `<li>${icon("check")}<span>${x}</span></li>`).join("")}</ul></div></div>
      <div class="dose-cal" aria-label="Dose calendar">${doses.map(x => `<span class="${cls(x)}" title="${fmt(x)}">${x.getDate()}/${x.getMonth() + 1}</span>`).join("")}</div>
      <div class="legend"><span><i style="background:rgba(201,150,44,.25)"></i>Before arrival</span><span><i style="background:#3f8a5c"></i>In malaria area</span><span><i style="background:#a9c98a"></i>After leaving — keep going!</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="btn btn-dark btn-sm" id="ptIcs">${icon("cal")} Add reminders to my calendar</button></div>
      <p class="muted" style="font-size:.8rem;margin-top:12px">Always follow the dose and timing on your own prescription if it differs. No antimalarial is 100% effective — bite prevention matters too.</p>`;
    out.classList.add("show");
    $("#ptIcs").addEventListener("click", () => {
      const ymd = x => x.toISOString().slice(0, 10).replace(/-/g, "");
      const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Crownland Safaris Tour//Malaria planner//EN", "BEGIN:VEVENT",
        `UID:${Date.now()}@crownlandsafaris`, `DTSTAMP:${ymd(new Date())}T000000Z`, `DTSTART:${ymd(start)}T080000`, `DTEND:${ymd(start)}T081500`,
        `RRULE:FREQ=${d.every === 7 ? "WEEKLY" : "DAILY"};COUNT=${doses.length}`, `SUMMARY:Take ${d.name} (malaria prevention)`,
        `DESCRIPTION:Last dose ${fmt(end)}. ${d.tips[0]}`, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:Malaria tablet", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      download("malaria-tablet-reminders.ics", ics, "text/calendar");
      toast("Calendar reminders downloaded", "cal");
    });
  }
  function download(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------- CONTACT ---------------- */
  let contactDone = false;
  function initContact(q) {
    if (q && q.get("tour")) $("#cTour").value = q.get("tour");
    if (contactDone) return; contactDone = true;
    $("#contactForm").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      const bad = $$("[required]", f).filter(i => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
      $$("input,textarea", f).forEach(i => i.style.borderColor = "");
      if (bad.length) { bad.forEach(i => i.style.borderColor = "var(--bad)"); bad[0].focus(); toast("Please complete the required fields", "info"); return; }
      const data = Object.fromEntries(new FormData(f));
      const t = tourById(data.tour);
      submitEnquiry({ ...data, tour: t ? t.title : "Tailor-made safari" }, () => f.reset());
    });
    $("#payBtn").addEventListener("click", () => {
      if (CFG.paymentLink) { window.open(CFG.paymentLink, "_blank", "noopener"); return; }
      openModal(`<div class="modal-head"><span class="eyebrow">Secure payment</span><h2 id="modalTitle">Pay your deposit</h2></div><div class="modal-body">
        <p>Once your safari is confirmed, your consultant sends a secure payment link with your invoice. Payments are processed by a PCI-compliant provider — we never see your card details.</p>
        <div class="pay-badges"><span>VISA</span><span>Mastercard</span><span>M-PESA</span><span>Bank transfer</span><span>PayPal</span></div>
        <a class="btn btn-whatsapp" style="margin-top:20px" href="${waLink("Hello Crownland Safaris, I'd like to pay my safari deposit. My booking name is: ")}" target="_blank" rel="noopener">${icon("whatsapp")} Request my payment link</a></div>`);
    });
  }

  /* ---------------- Enquiry submission ---------------- */
  function enquiryText(d) {
    return [`New safari enquiry — Crownland Safaris Tour`, `Tour: ${d.tour}`, d.date && `Travel date: ${d.date}`, d.travellers && `Travellers: ${d.travellers}`,
      d.estimate && `Estimate shown: ${d.estimate}`, `Name: ${d.name}`, `Email: ${d.email}`, d.phone && `Phone: ${d.phone}`, d.country && `Country: ${d.country}`, d.message && `Message: ${d.message}`].filter(Boolean).join("\n");
  }
  function submitEnquiry(d, onDone) {
    const log = store.get("cl-enquiries", []); log.push({ ...d, at: new Date().toISOString() }); store.set("cl-enquiries", log.slice(-20));
    const text = enquiryText(d);
    const success = (sent) => {
      openModal(`<div class="modal-body" style="text-align:center;padding:48px 28px">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;margin:0 auto 16px"><svg style="width:34px;height:34px" aria-hidden="true"><use href="#i-check"/></svg></div>
        <h2 id="modalTitle">${sent ? "Enquiry sent!" : "Almost there!"}</h2>
        <p class="muted">${sent ? `Thank you, ${esc(d.name.split(" ")[0])}. A Crownland safari consultant will reply within 24 hours.` : "Choose how you'd like to send your enquiry — it's already written for you."}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">
          <a class="btn btn-whatsapp" href="${waLink(text)}" target="_blank" rel="noopener">${icon("whatsapp")} ${sent ? "Also chat on WhatsApp" : "Send via WhatsApp"}</a>
          ${sent ? "" : `<a class="btn btn-dark" href="mailto:${CFG.email}?subject=${encodeURIComponent("Safari enquiry: " + d.tour)}&body=${encodeURIComponent(text)}">${icon("mail")} Send via email</a>`}
        </div></div>`);
      onDone && onDone();
    };
    if (CFG.formEndpoint) {
      fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...d, _subject: "Safari enquiry: " + d.tour }) })
        .then(r => success(r.ok)).catch(() => success(false));
    } else success(false);
  }

  /* ---------------- Modal system ---------------- */
  let lastFocus = null;
  function openModal(html, wide = false) {
    lastFocus = document.activeElement;
    $("#modalContent").innerHTML = html;
    $("#modalCard").classList.toggle("wide", wide);
    $("#modal").classList.add("open"); document.body.style.overflow = "hidden";
    setTimeout(() => { const f = $("#modalContent").querySelector("input,button,select,a"); (f || $(".modal-close")).focus(); }, 50);
  }
  function closeModal() { $("#modal").classList.remove("open"); document.body.style.overflow = ""; lastFocus && lastFocus.focus && lastFocus.focus(); }

  /* Enquiry wizard */
  function openEnquiry({ tour, custom, adults = 2, kids = 0, date = "", tier, total }) {
    const title = tour ? tour.title : "Tailor-made safari";
    const q = tour ? quote(tour, { adults, kids, month: date ? new Date(date + "T00:00").getMonth() + 1 : 2, tier }) : null;
    const estimate = q ? q.total : total;
    openModal(`<div class="modal-head"><span class="eyebrow">Request to book</span><h2 id="modalTitle" style="font-size:1.6rem">${esc(title)}</h2>
      ${custom ? `<p class="muted" style="font-size:.9rem">${esc(custom)}</p>` : ""}
      <div class="wizard-progress"><span class="done"></span><span></span><span></span></div></div>
      <form class="modal-body" id="wizForm" novalidate>
        <div class="wiz-step active" data-step="0">
          <h3>When are you travelling?</h3>
          <div class="form-grid-2"><div class="form-row"><label for="wDate">Start date</label><input type="date" id="wDate" name="date" value="${date}"></div>
          <div class="form-row"><label for="wFlex">Flexibility</label><select id="wFlex" name="flex"><option>Exact dates</option><option>± 3 days</option><option>± 1 week</option><option>Just researching</option></select></div>
          <div class="form-row"><label for="wAdults">Adults</label><input type="number" min="1" id="wAdults" name="adults" value="${adults}"></div>
          <div class="form-row"><label for="wKids">Children (3–11)</label><input type="number" min="0" id="wKids" name="kids" value="${kids}"></div></div>
        </div>
        <div class="wiz-step" data-step="1">
          <h3>Your details</h3>
          <div class="form-grid-2"><div class="form-row"><label for="wName">Full name *</label><input id="wName" name="name" required autocomplete="name"></div>
          <div class="form-row"><label for="wEmail">Email *</label><input id="wEmail" name="email" type="email" required autocomplete="email"></div>
          <div class="form-row"><label for="wPhone">Phone / WhatsApp</label><input id="wPhone" name="phone" type="tel" autocomplete="tel"></div>
          <div class="form-row"><label for="wCountry">Country</label><input id="wCountry" name="country" autocomplete="country-name"></div></div>
        </div>
        <div class="wiz-step" data-step="2">
          <h3>Anything else?</h3>
          <div class="form-row"><label for="wMsg">Special requests, celebrations, dietary needs…</label><textarea id="wMsg" name="message" rows="4"></textarea></div>
          <div class="quote-box" id="wSummary"></div>
        </div>
        <div class="wiz-nav"><button type="button" class="btn btn-ghost" id="wBack" style="visibility:hidden">Back</button><button type="button" class="btn btn-gold" id="wNext">Continue ${icon("arrow")}</button></div>
      </form>`);
    let step = 0;
    const form = $("#wizForm");
    form.addEventListener("submit", e => { e.preventDefault(); $("#wNext").click(); });
    const go = n => {
      step = n;
      $$(".wiz-step", form).forEach(s => s.classList.toggle("active", +s.dataset.step === n));
      $$(".wizard-progress span").forEach((s, i) => s.classList.toggle("done", i <= n));
      $("#wBack").style.visibility = n ? "visible" : "hidden";
      $("#wNext").innerHTML = n === 2 ? `${icon("send")} Send request` : `Continue ${icon("arrow")}`;
      if (n === 2) {
        const a = +$("#wAdults").value || 1, k = +$("#wKids").value || 0;
        const qq = tour ? quote(tour, { adults: a, kids: k, month: $("#wDate").value ? new Date($("#wDate").value + "T00:00").getMonth() + 1 : 2, tier }) : null;
        const tot = qq ? qq.total : estimate;
        $("#wSummary").innerHTML = `<div class="quote-line"><span>Safari</span><strong>${esc(title)}</strong></div><div class="quote-line"><span>Date</span><span>${$("#wDate").value || "Flexible"} (${$("#wFlex").value})</span></div><div class="quote-line"><span>Travellers</span><span>${a} adult(s)${k ? ", " + k + " child(ren)" : ""}</span></div>${tot ? `<div class="quote-total"><span class="muted">Estimated total</span><strong>${money(tot)}</strong></div>` : ""}`;
        form.dataset.total = tot || "";
      }
    };
    $("#wBack").addEventListener("click", () => go(step - 1));
    $("#wNext").addEventListener("click", () => {
      if (step === 1) {
        const bad = $$("[required]", $('[data-step="1"]')).filter(i => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
        $$("input", form).forEach(i => i.style.borderColor = "");
        if (bad.length) { bad.forEach(i => i.style.borderColor = "var(--bad)"); bad[0].focus(); return; }
      }
      if (step < 2) return go(step + 1);
      const d = Object.fromEntries(new FormData(form));
      submitEnquiry({ tour: title + (custom ? ` — ${custom}` : ""), date: d.date ? `${d.date} (${d.flex})` : d.flex, travellers: `${d.adults} adults, ${d.kids} children`, estimate: form.dataset.total ? money(+form.dataset.total, "USD") : "", name: d.name, email: d.email, phone: d.phone, country: d.country, message: d.message });
    });
  }

  /* Quiz */
  const QUIZ = [
    { q: "Who's coming on safari?", k: "who", opts: [["couple", "💑", "A couple", "Romance & honeymoons"], ["family", "👨‍👩‍👧", "Family", "Kids or multi-generation"], ["friends", "🧑‍🤝‍🧑", "Friends", "Group adventure"], ["solo", "🧭", "Just me", "Solo explorer"]] },
    { q: "What would make the trip unforgettable?", k: "see", opts: [["migration", "🐃", "The Great Migration", "River crossings & herds"], ["bigfive", "🦁", "The Big Five", "Lion, leopard, elephant, buffalo, rhino"], ["gorillas", "🦍", "Mountain gorillas", "Trekking in Uganda"], ["beach", "🏝️", "Bush & beach", "Safari plus Indian Ocean"], ["kilimanjaro", "🏔️", "Kilimanjaro views", "Elephants under the snow-cap"], ["rare", "🦓", "Rare & off the beaten track", "Samburu, Meru, Ol Pejeta"]] },
    { q: "How long can you travel?", k: "days", opts: [["1", "⏱️", "A day or two", "Stopover / layover"], ["4", "🗓️", "3 – 5 days", "Short escape"], ["7", "📅", "6 – 8 days", "The classic safari"], ["10", "🌍", "9+ days", "Two countries"]] },
    { q: "Budget per person?", k: "budget", opts: [["1500", "💵", "Under $2,000", "Great value"], ["3000", "💳", "$2,000 – $3,500", "Comfortable lodges"], ["4500", "💎", "$3,500 – $5,000", "Premium"], ["9000", "👑", "$5,000+", "No compromise"]] },
    { q: "When would you like to go?", k: "month", opts: [["1", "☀️", "Jan – Mar", "Dry, calving season"], ["4", "🌧️", "Apr – May", "Green season, best rates"], ["8", "🔥", "Jun – Oct", "Peak dry & migration"], ["11", "🌦️", "Nov – Dec", "Short rains, festive"]] }
  ];
  function scoreTour(t, a) {
    let s = 40;
    if (a.see && t.tags.includes(a.see)) s += 30; else if (a.see === "bigfive" && t.tags.includes("rhino")) s += 15;
    if (a.who === "couple" && t.tags.some(x => ["honeymoon", "luxury", "beach"].includes(x))) s += 10;
    if (a.who === "family" && t.tags.some(x => ["family", "value", "short"].includes(x))) s += 10;
    if (a.who === "friends" && t.tags.some(x => ["bigfive", "migration", "active"].includes(x))) s += 8;
    const d = +a.days; if (d) s += Math.max(-25, 15 - Math.abs(t.days - d) * 6);
    const b = +a.budget, p = fromPrice(t); if (b) s += p <= b ? 10 : -Math.min(30, (p - b) / 100);
    const m = +a.month; if (m) { const avg = t.route.reduce((x, id) => x + (D.places[id] ? D.places[id].best[m - 1] : 2), 0) / t.route.length; s += (avg - 2) * 8; }
    if (a.see === "gorillas" && t.cat !== "uganda") s -= 20;
    return Math.max(5, Math.min(99, Math.round(s)));
  }
  function openQuiz() {
    const ans = {};
    const render = i => {
      if (i >= QUIZ.length) return results();
      const qq = QUIZ[i];
      openModal(`<div class="modal-head"><span class="eyebrow">Safari match · ${i + 1} of ${QUIZ.length}</span><h2 id="modalTitle" style="font-size:1.7rem">${qq.q}</h2>
        <div class="wizard-progress">${QUIZ.map((_, k) => `<span class="${k <= i ? "done" : ""}"></span>`).join("")}</div></div>
        <div class="modal-body"><div class="quiz-options">${qq.opts.map(([v, e, l, s]) => `<button class="quiz-opt ${ans[qq.k] === v ? "active" : ""}" data-v="${v}"><span class="emo">${e}</span><span><strong>${l}</strong><span>${s}</span></span></button>`).join("")}</div>
        <div class="wiz-nav"><button class="btn btn-ghost" id="qzBack" style="visibility:${i ? "visible" : "hidden"}">Back</button><button class="btn btn-ghost" id="qzSkip">Skip</button></div></div>`);
      $$(".quiz-opt").forEach(b => b.addEventListener("click", () => { ans[qq.k] = b.dataset.v; b.classList.add("active"); setTimeout(() => render(i + 1), 220); }));
      $("#qzBack").addEventListener("click", () => render(i - 1));
      $("#qzSkip").addEventListener("click", () => render(i + 1));
    };
    const results = () => {
      const ranked = D.tours.map(t => ({ t, s: scoreTour(t, ans) })).sort((a, b) => b.s - a.s).slice(0, 4);
      store.set("cl-quiz", ans);
      openModal(`<div class="modal-head"><span class="eyebrow">Your matches</span><h2 id="modalTitle">We found your perfect safaris</h2><p class="muted">Ranked by how well each itinerary fits your answers.</p></div>
        <div class="modal-body">${ranked.map(({ t, s }) => `<a class="match" href="#/tour/${t.id}" data-close-modal-link><img src="${IMG + t.img}" alt=""><div><strong>${esc(t.title)}</strong><div class="muted" style="font-size:.85rem">${daysLabel(t)} · from ${money(fromPrice(t))} pp</div></div><div class="score"><strong>${s}%</strong><small>match</small></div></a>`).join("")}
        <div class="wiz-nav"><button class="btn btn-ghost" id="qzRestart">Retake quiz</button><a class="btn btn-gold" href="#/builder" data-close-modal-link>Or build your own ${icon("arrow")}</a></div></div>`);
      $("#qzRestart").addEventListener("click", () => render(0));
    };
    render(0);
  }

  /* Compare */
  function openCompare() {
    const ts = compare.map(tourById);
    const best = (fn, min = true) => { const vals = ts.map(fn); const b = min ? Math.min(...vals) : Math.max(...vals); return vals.map(v => v === b); };
    const cheap = best(fromPrice), long = best(t => t.days, false);
    const row = (label, cells) => `<tr><th>${label}</th>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
    openModal(`<div class="modal-head"><span class="eyebrow">Side by side</span><h2 id="modalTitle">Compare safaris</h2></div><div class="modal-body" style="overflow-x:auto">
      <table class="compare-table" style="min-width:${ts.length * 220 + 150}px">
        ${row("", ts.map(t => `<img src="${IMG + t.img}" alt=""><strong style="display:block;margin-top:8px">${esc(t.title)}</strong>`))}
        ${row("From (pp)", ts.map((t, i) => `<span class="${cheap[i] ? "best" : ""}">${money(fromPrice(t))}${cheap[i] && ts.length > 1 ? " ★ lowest" : ""}</span>`))}
        ${row("Duration", ts.map((t, i) => `<span class="${long[i] && ts.length > 1 ? "best" : ""}">${daysLabel(t)}</span>`))}
        ${row("Per day", ts.map(t => money(fromPrice(t) / Math.max(1, t.days))))}
        ${row("Route", ts.map(t => uniqRoute(t.route).map(placeName).join(" → ")))}
        ${row("Highlights", ts.map(t => `<ul style="padding-left:18px;margin:0">${t.highlights.map(h => `<li>${h}</li>`).join("")}</ul>`))}
        ${row("Experiences", ts.map(t => `<div class="tags">${t.tags.filter(x => TAGS[x]).map(x => `<span class="tag">${TAGS[x]}</span>`).join("")}</div>`))}
        ${row("", ts.map(t => `<a class="btn btn-gold btn-sm" href="#/tour/${t.id}" data-close-modal-link>View tour</a>`))}
      </table></div>`, true);
  }

  /* Saved drawer */
  function renderSaved() {
    const list = [...saved].map(tourById).filter(Boolean);
    $("#savedList").innerHTML = list.length ? `<div class="mini-tours">${list.map(t => `<div class="mini-tour"><img src="${IMG + t.img}" alt=""><a href="#/tour/${t.id}" style="flex:1"><strong>${esc(t.title)}</strong><span>${daysLabel(t)} · from ${money(fromPrice(t))}</span></a><button class="icon-btn" data-save="${t.id}" aria-label="Remove">${icon("x")}</button></div>`).join("")}</div>
      <a class="btn btn-whatsapp btn-block" style="margin-top:18px" target="_blank" rel="noopener" href="${waLink("Hello Crownland Safaris! I'm interested in these safaris:\n" + list.map(t => "• " + t.title).join("\n"))}">${icon("whatsapp")} Ask about these on WhatsApp</a>`
      : `<div class="empty-state">${icon("heart")}<p>Tap the heart on any safari to save it here.</p><a href="#/tours" class="btn btn-gold btn-sm">Browse safaris</a></div>`;
  }
  function openDrawer(open) { $("#savedDrawer").classList.toggle("open", open); $("#savedDrawer").setAttribute("aria-hidden", !open); if (open) renderSaved(); }

  /* Share */
  function share(title, url) {
    if (navigator.share) { navigator.share({ title, url }).catch(() => {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("Link copied to clipboard", "share")).catch(() => prompt("Copy this link:", url));
  }

  /* ---------------- Concierge chat ---------------- */
  const chat = { open: false, started: false };
  function botSay(html, chips) {
    const log = $("#chatLog");
    const typing = document.createElement("div"); typing.className = "msg bot typing"; typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing); log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const m = document.createElement("div"); m.className = "msg bot"; m.innerHTML = html; log.appendChild(m);
      setChips(chips || ["Prices", "Best time to go", "Gorillas", "Visas", "Malaria advice", "Talk to a human"]);
      log.scrollTop = log.scrollHeight;
    }, 550 + Math.min(900, html.length * 4));
  }
  function setChips(c) { $("#chatChips").innerHTML = c.map(x => `<button type="button">${x}</button>`).join(""); }
  function userSay(t) { const m = document.createElement("div"); m.className = "msg me"; m.textContent = t; $("#chatLog").appendChild(m); $("#chatLog").scrollTop = 1e9; }
  const tl = t => `<a href="#/tour/${t.id}">${esc(t.title)}</a> — from ${money(fromPrice(t))}`;
  function answer(raw) {
    const q = raw.toLowerCase();
    const has = (...w) => w.some(x => q.includes(x));
    if (has("hello", "hi ", "hey", "jambo", "good morning", "good evening") || q === "hi") return botSay("Jambo! 👋 I'm the Crownland Concierge. Ask me about safari prices, the migration, gorillas, visas or health — or I can connect you with a human expert.");
    if (has("human", "agent", "person", "call", "whatsapp", "speak", "talk")) return botSay(`Of course! Our safari experts are on WhatsApp: <a href="${waLink("Hello! I was chatting with your website assistant and would like to speak to an expert.")}" target="_blank" rel="noopener">open WhatsApp</a>, call <a href="tel:${CFG.phonePrimary.replace(/\s/g, "")}">${CFG.phonePrimary}</a> or email <a href="mailto:${CFG.email}">${CFG.email}</a>.`);
    if (has("gorilla", "uganda", "chimp", "bwindi", "primate")) return botSay(`Gorilla trekking is magical 🦍. Our Uganda safaris include the US$800 gorilla permit and chimp tracking:<br>• ${D.tours.filter(t => t.cat === "uganda").map(tl).join("<br>• ")}<br>Minimum age is 15. Book 3–6 months ahead as permits sell out.`);
    if (has("migration", "wildebeest", "river crossing", "crossing")) { const m = D.migration[new Date().getMonth()]; return botSay(`This month (${m.m}) the herds are around <b>${m.area}</b>. ${m.note} River crossings in the Masai Mara peak July – October. See it live on our <a href="#/explore">migration tracker</a>.`, ["Migration safaris", "Best time to go", "Prices"]); }
    if (has("migration safari")) return botSay(D.tours.filter(t => t.tags.includes("migration")).slice(0, 4).map(tl).join("<br>"));
    if (has("best time", "when to", "season", "weather", "rain")) return botSay("Best game viewing is in the dry seasons: <b>late June – October</b> (migration in the Mara) and <b>January – March</b>. April – May is the green season with lower prices. Check the <a href=\"#/explore\">month-by-month guide</a>.");
    if (has("visa", "eta", "passport", "entry")) return botSay("Kenya: apply online for an <b>eTA</b> before travel. Tanzania & Uganda: <b>e-Visa</b> online. The East Africa Tourist Visa covers Kenya, Uganda & Rwanda. Rules change — always confirm on official government portals. More on our <a href=\"#/travel-info?tab=visas\">visa page</a>.");
    if (has("malaria", "vaccin", "yellow fever", "health", "sick", "medic", "tablet", "doctor")) return botSay("Key health points:<br>• <b>Yellow fever</b>: certificate required for Uganda (age 1+) and for Tanzania if arriving from Kenya.<br>• <b>Malaria</b>: present in safari areas — take prescribed tablets every day and keep going after you leave (7 days or 4 weeks depending on the drug).<br>• See a travel clinic 4–8 weeks before.<br>Try our <a href=\"#/travel-info\">malaria tablet planner</a> for exact start/stop dates and reminders. This is general info, not personal medical advice.");
    if (has("beach", "honeymoon", "romantic", "diani", "zanzibar")) return botSay(`Bush + beach is perfect for couples 💛<br>• ${D.tours.filter(t => t.tags.includes("honeymoon")).map(tl).join("<br>• ")}`);
    if (has("family", "kid", "child")) return botSay(`Children aged 3–11 sharing with adults are charged ${Math.round(CFG.childFactor * 100)}% of the adult rate. Family favourites:<br>• ${D.tours.filter(t => t.tags.includes("family")).slice(0, 3).map(tl).join("<br>• ")}`);
    if (has("pay", "deposit", "card", "mpesa", "m-pesa", "book")) return botSay(`A ${CFG.depositPercent}% deposit confirms your safari; the balance is due before travel. We accept cards, bank transfer and M-Pesa. Ready? Open any tour and tap <b>Request to book</b>, or use the <a href="#/contact">contact form</a>.`);
    if (has("pack", "wear", "cloth", "luggage")) return botSay("Pack neutral layers, a warm fleece for dawn drives, hat, sunscreen, repellent and binoculars — and a soft bag (~15 kg for bush flights). Tick it off with our <a href=\"#/travel-info?tab=packing\">interactive packing list</a>.");
    if (has("day trip", "day tour", "excursion", "layover", "half day", "nairobi")) return botSay(`Short on time? Our Nairobi excursions:<br>• ${D.tours.filter(t => t.cat === "day").slice(0, 4).map(tl).join("<br>• ")}`);
    if (has("custom", "tailor", "build", "own")) return botSay("Design your own route in the <a href=\"#/builder\">Trip Builder</a> — pick parks and nights, and the price updates instantly.");
    if (has("cheap", "budget", "price", "cost", "how much", "afford", "rate")) { const s = D.tours.filter(t => t.cat !== "day").sort((a, b) => fromPrice(a) - fromPrice(b)).slice(0, 3); return botSay(`Multi-day safaris start from ${money(fromPrice(s[0]))} per person (2 sharing). Best-value picks:<br>• ${s.map(tl).join("<br>• ")}<br>Day trips start from ${money(Math.min(...D.tours.filter(t => t.cat === "day").map(fromPrice)))}. Each tour page has a live price calculator.`, ["Luxury safaris", "Day trips", "Build my own"]); }
    if (has("luxury", "premium", "5 star", "five star")) return botSay(`Our most indulgent journeys:<br>• ${D.tours.filter(t => t.tags.includes("luxury")).slice(0, 4).map(tl).join("<br>• ")}`);
    const n = q.match(/(\d+)\s*(day|night)/);
    if (n) { const d = +n[1]; const m = D.tours.filter(t => Math.abs(t.days - d) <= 1 && t.cat !== "day").slice(0, 4); if (m.length) return botSay(`Safaris around ${d} days:<br>• ${m.map(tl).join("<br>• ")}`); }
    const place = Object.entries(D.places).find(([id, p]) => q.includes(p.name.toLowerCase().split(" ")[0].toLowerCase()) || q.includes(id));
    if (place) { const [id, p] = place; const m = D.tours.filter(t => t.route.includes(id)).slice(0, 4); return botSay(`<b>${p.name}</b>: ${p.blurb}${m.length ? "<br><br>Safaris visiting " + p.name + ":<br>• " + m.map(tl).join("<br>• ") : ""}`); }
    return botSay(`I'm not sure about that one — but our team will know! <a href="${waLink("Hello! Question from your website: " + raw)}" target="_blank" rel="noopener">Ask on WhatsApp</a> or try one of these topics:`);
  }
  function openChat(o) {
    chat.open = o; $("#chat").classList.toggle("open", o);
    $(".fab-chat .ping") && o && $(".fab-chat .ping").remove();
    if (o && !chat.started) { chat.started = true; botSay("Jambo! 👋 I'm the Crownland Concierge, an automated assistant. What would you like to know about your safari?"); }
    if (o) setTimeout(() => $("#chatInput").focus(), 300);
  }

  /* ---------------- Reveal on scroll ---------------- */
  let revealIO;
  function observeReveals() {
    if (!revealIO) revealIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.in)").forEach(el => revealIO.observe(el));
  }

  /* ---------------- Theme ---------------- */
  function setThemeIcon() {
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    $("#themeToggle").innerHTML = icon(dark ? "sun" : "moon");
    return dark;
  }

  /* ---------------- Global events ---------------- */
  function bindGlobal() {
    document.addEventListener("click", e => {
      const s = e.target.closest("[data-save]"); if (s) { e.preventDefault(); toggleSave(s.dataset.save); return; }
      if (e.target.closest("[data-open-quiz]")) { e.preventDefault(); openMobile(false); openQuiz(); return; }
      if (e.target.closest("[data-close-modal]")) { closeModal(); return; }
      if (e.target.closest("[data-close-modal-link]")) { setTimeout(closeModal, 10); return; }
      if (e.target.closest("[data-close-mobile]")) { openMobile(false); return; }
      if (e.target.closest("[data-close-drawer]")) { openDrawer(false); return; }
      const lbb = e.target.closest("[data-lb]"); if (lbb) { const a = lbb.dataset.lb; a === "close" ? closeLb() : lbStep(a === "next" ? 1 : -1); return; }
      if (e.target.id === "lightbox") closeLb();
      if (e.target.closest("#savedDrawer a[href^='#/']")) openDrawer(false);
    });
    document.addEventListener("change", e => { const c = e.target.closest("[data-compare]"); if (c) toggleCompare(c.dataset.compare, c.checked); });
    $("#compareClear").addEventListener("click", () => { compare = []; toggleCompare("", false); });
    $("#compareOpen").addEventListener("click", () => compare.length < 2 ? toast("Select at least 2 safaris to compare", "info") : openCompare());
    $("#menuToggle").addEventListener("click", () => openMobile(true));
    $("#savedBtn").addEventListener("click", () => openDrawer(true));
    $("#themeToggle").addEventListener("click", () => {
      const dark = setThemeIcon();
      const next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("cl-theme", next); } catch (e) {}
      setThemeIcon();
    });
    $("#chatOpen").addEventListener("click", () => openChat(!chat.open));
    $("#chatClose").addEventListener("click", () => openChat(false));
    $("#chatForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#chatInput").value.trim(); if (!v) return; $("#chatInput").value = ""; userSay(v); answer(v); });
    $("#chatChips").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; userSay(b.textContent); answer(b.textContent === "Build my own" ? "build" : b.textContent === "Migration safaris" ? "migration safari" : b.textContent); });
    $("#nlForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#nlEmail").value; if (!/^\S+@\S+\.\S+$/.test(v)) return toast("Please enter a valid email", "info"); const l = store.get("cl-newsletter", []); l.push(v); store.set("cl-newsletter", l); e.target.reset(); toast("Welcome aboard! Check your inbox soon.", "mail"); });
    $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.addEventListener("keydown", e => {
      if ($("#lightbox").classList.contains("open")) { if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") lbStep(1); if (e.key === "ArrowLeft") lbStep(-1); return; }
      if (e.key === "Escape") { if ($("#modal").classList.contains("open")) closeModal(); openMobile(false); openDrawer(false); if (chat.open) openChat(false); $("#filters").classList.remove("open"); }
      if (e.key === "Tab" && $("#modal").classList.contains("open")) {
        const f = $$("#modalCard a[href],#modalCard button,#modalCard input,#modalCard select,#modalCard textarea").filter(x => !x.disabled && x.offsetParent);
        if (!f.length) return; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // header, progress, to-top
    const onScroll = () => {
      const y = window.scrollY;
      $("#siteHeader").classList.toggle("scrolled", y > 10);
      const h = document.documentElement.scrollHeight - innerHeight;
      $("#scrollProgress").style.width = (h > 0 ? y / h * 100 : 0) + "%";
      $("#toTop").classList.toggle("show", y > 800);
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    // mega menu keyboard support on touch
    $(".has-mega > .nav-link").addEventListener("touchstart", e => { const li = e.currentTarget.parentElement; if (!li.classList.contains("open")) { e.preventDefault(); li.classList.add("open"); } }, { passive: false });
    document.addEventListener("click", e => { if (!e.target.closest(".has-mega")) $$(".has-mega").forEach(x => x.classList.remove("open")); });
    addEventListener("hashchange", () => { $$(".has-mega").forEach(x => x.classList.remove("open")); route(); });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    bindConfig();
    buildMenus();
    bindGlobal();
    setThemeIcon();
    updateSavedCount();
    route();
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && window.top === window.self) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
