const INSTAGRAM_URL = "https://www.instagram.com/shah.knits";
const PHONE_E164 = "+919160188322";

// Keep this list in sync with the image files in the folder.
// Filenames are parsed to extract "Name @price".
const IMAGE_FILES = [
  "Beigh Claw clip @155_-.jpg",
  "Berry Blush Babe @165_-.jpg",
  "Cherry Bag Charm @180_-.jpg",
  "Cherry Bow clip @180_-.jpg",
  "Cocoa claw clip @195_-.jpg",
  "Cookie Keychain @150_-.jpg",
  "Cute Angry Clip @155_-.jpg",
  "Cutie bloom Duo @180_-(1).jpg",
  "Cutie bloom Duo @180_-.jpg",
  "Daisy Claw clip @145_-.jpg",
  "Daisy Glow Bouquet @750_-.jpg",
  "Daisy Keychain @150_-.jpg",
  "Daisy Pinteresty clip @230_-.jpg",
  "Enchanted lavender whispers bouquet @699_-.jpg",
  "Evil eye Keychain @250_-.jpg",
  "Floral Airpods pouch @220_-(1).jpg",
  "Floral Airpods pouch @220_-(2).jpg",
  "Floral Airpods pouch @220_-.jpg",
  "Floral Clip @95_-.jpg",
  "Forever Gajra @380_-.jpg",
  "Lilac sky bloom @200_-.jpg",
  "Lily pot @499_-.jpg",
  "Loop love bag @650_-.jpg",
  "Pink daisy clutch clip @230_-.jpg",
  "Pout pouch @250_-.jpg",
  "Purple Meadow Bouquet @850_-.jpg",
  "Red rose @200_-.jpg",
  "Rosy Charm Claw clip @125_-.jpg",
  "Spiderman Keychain @ 350_-.jpg",
  "Sunflower claw clip @145_-.jpg",
  "Sunflower clutch clip @190_-.jpg",
  "Tulip Clutch Clip @190_-.jpg",
];

function normalizeFilename(filename) {
  // Remove extension
  let base = filename.replace(/\.(jpe?g|png|webp|gif)$/i, "");
  // Remove trailing common upload suffixes like "_-" and duplicates "(1)"
  base = base.replace(/_-\s*$/i, "").replace(/_-\(\d+\)\s*$/i, "");
  base = base.replace(/\(\d+\)\s*$/i, "").trim();
  return base;
}

function parseProductFromFilename(filename) {
  const base = normalizeFilename(filename);
  const match = base.match(/^(.*?)\s*@\s*(\d+)\s*$/);
  if (!match) {
    return {
      id: base.toLowerCase().replaceAll(/\s+/g, "-"),
      name: base,
      price: null,
      filename,
    };
  }

  const name = match[1].trim().replaceAll(/\s+/g, " ");
  const price = Number(match[2]);
  const id = `${name}-${price}`.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");

  return { id, name, price, filename };
}

function formatPriceInr(price) {
  if (typeof price !== "number" || Number.isNaN(price)) return "Price on request";
  return `₹${price}`;
}

function buildDmPrefillText(product) {
  const priceText = product.price ? `₹${product.price}` : "[Price]";
  const nameText = product.name || "[Product Name]";
  return `Hi! I’d like to order: ${nameText}. Price: ${priceText}. Please confirm availability and delivery details.`;
}

function buildInstagramDmUrl(_text) {
  // Direct DM deep-links vary; profile link is the reliable fallback.
  // We still keep the message ready to paste via the Copy button.
  return INSTAGRAM_URL;
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function productCategoryHint(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("clip") || s.includes("claw") || s.includes("blush") ) return "Clip";
  if (s.includes("keychain") || s.includes("charm")) return "Keychain";
  if (s.includes("bouquet") || s.includes("rose") || s.includes("sky bloom"))
    return "Bouquet";
  return "Others";
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = String(v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, String(v));
  }
  for (const child of children) node.append(child);
  return node;
}

function renderProducts(products, category) {
  const grid = document.getElementById("productGrid");
  const stats = document.getElementById("stats");
  if (!grid || !stats) return;

  const cat = (category || "").trim();
  const filtered = cat
    ? products.filter((p) => productCategoryHint(p.name) === cat)
    : products;

  stats.textContent = cat
    ? `Showing ${filtered.length} product(s) in ${cat}.`
    : `Showing ${filtered.length} product(s).`;

  grid.replaceChildren();
  for (const product of filtered) {
    const imgSrc = encodeURI(`./${product.filename}`);
    const badgeText = productCategoryHint(product.name);

    const card = el(
      "article",
      {
        class: "card",
      },
      [
        el("div", { class: "card-media" }, [
          el("span", { class: "badge", text: badgeText }),
          el("img", { src: imgSrc, alt: product.name, loading: "lazy" }),
        ]),
        el("div", { class: "card-body" }, [
          el("div", { class: "card-title", text: product.name }),
          el("div", { class: "card-meta" }, [
            el("div", { class: "price", text: formatPriceInr(product.price) }),
          ]),
        ]),
      ]
    );

    grid.append(card);
  }
}

function initMobileNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!nav || !toggle || !menu) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    setOpen(!isOpen);
  });

  menu.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(e.target)) return;
    setOpen(false);
  });

  globalThis.addEventListener("resize", () => {
    if (globalThis.matchMedia("(min-width: 641px)").matches) setOpen(false);
  });
}

function renderLandingCarousel(products) {
  const track = document.getElementById("landingCarousel");
  if (!track) return;

  const safeProducts = products.slice(0, 12);
  track.replaceChildren();

  for (const product of safeProducts) {
    const imgSrc = encodeURI(`./${product.filename}`);

    const card = el("article", { class: "landing-carousel-card" }, [
      el("div", { class: "landing-carousel-media" }, [
        el("img", { src: imgSrc, alt: product.name, loading: "lazy" }),
      ]),
      el("div", { class: "landing-carousel-meta" }, [
        el("div", { class: "landing-carousel-name", text: product.name }),
        el("div", { class: "landing-carousel-price", text: formatPriceInr(product.price) }),
      ]),
    ]);

    track.append(card);
  }

  const gap = 12;
  function cardStepPx() {
    const first = track.querySelector(".landing-carousel-card");
    const w = first ? first.getBoundingClientRect().width : 240;
    return w + gap;
  }

  function hasOverflow() {
    return track.scrollWidth > track.clientWidth + 2;
  }

  function canLoopToStart() {
    return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }

  function scrollByOne(direction) {
    if (!hasOverflow()) return;
    const delta = direction * cardStepPx();
    if (direction > 0 && canLoopToStart()) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    track.scrollBy({ left: delta, behavior: "smooth" });
  }


  let timer = null;
  const intervalMs = 1500;
  function startAuto() {
    if (timer) return;
    timer = globalThis.setInterval(() => scrollByOne(1), intervalMs);
  }
  function stopAuto() {
    if (!timer) return;
    globalThis.clearInterval(timer);
    timer = null;
  }

  // Auto-move, but pause when user interacts.
  // Defer until after layout so card widths are measurable on first load.
  globalThis.requestAnimationFrame(() => {
    globalThis.requestAnimationFrame(() => {
      stopAuto();
      startAuto();
    });
  });
  track.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseleave", startAuto);
  track.addEventListener("focusin", stopAuto);
  track.addEventListener("focusout", startAuto);
  globalThis.addEventListener("resize", () => {
    stopAuto();
    startAuto();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });
}

function main() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  initMobileNav();

  const rawProducts = IMAGE_FILES.map(parseProductFromFilename);
  const products = uniqueBy(rawProducts, (p) => `${p.name}@@${p.price ?? ""}`);
  products.sort((a, b) => a.name.localeCompare(b.name));

  // Landing page carousel (if present)
  renderLandingCarousel(products);

  // Landing page doesn't have the shop UI.
  const grid = document.getElementById("productGrid");
  const stats = document.getElementById("stats");
  const categoryFilter = document.getElementById("categoryFilter");
  if (!grid || !stats || !categoryFilter) return;

  categoryFilter.addEventListener("change", () => renderProducts(products, categoryFilter.value));

  renderProducts(products, "");
}

document.addEventListener("DOMContentLoaded", main);

