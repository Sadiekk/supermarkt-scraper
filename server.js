import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

// Supermarkt URLs
const URLS = {
  ah: "https://www.ah.nl/bonus",
  jumbo: "https://www.jumbo.com/aanbiedingen",
  lidl: "https://www.lidl.nl/c/aanbiedingen",
  aldi: "https://www.aldi.nl/aanbiedingen.html"
};

// Helper: HTML ophalen
async function fetchHTML(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return cheerio.load(data);
}

/* -------------------------
   SCRAPER 1 — ALBERT HEIJN
--------------------------*/
async function scrapeAH() {
  try {
    const $ = await fetchHTML(URLS.ah);
    const deals = [];

    $(".product-card").each((i, el) => {
      const item = $(el).find(".title").text().trim();
      const price = $(el).find(".price-amount").text().trim();

      if (item) {
        deals.push({
          store: "Albert Heijn",
          item,
          price: price || null
        });
      }
    });

    return deals;
  } catch {
    return [];
  }
}

/* -------------------------
   SCRAPER 2 — JUMBO
--------------------------*/
async function scrapeJumbo() {
  try {
    const $ = await fetchHTML(URLS.jumbo);
    const deals = [];

    $(".jum-card").each((i, el) => {
      const item = $(el).find(".jum-card__title").text().trim();
      const price = $(el).find(".jum-price").text().trim();

      if (item) {
        deals.push({
          store: "Jumbo",
          item,
          price: price || null
        });
      }
    });

    return deals;
  } catch {
    return [];
  }
}

/* -------------------------
   SCRAPER 3 — LIDL
--------------------------*/
async function scrapeLidl() {
  try {
    const $ = await fetchHTML(URLS.lidl);
    const deals = [];

    $(".product").each((i, el) => {
      const item = $(el).find(".product__title").text().trim();
      const price = $(el).find(".pricebox__price").text().trim();

      if (item) {
        deals.push({
          store: "Lidl",
          item,
          price: price || null
        });
      }
    });

    return deals;
  } catch {
    return [];
  }
}

/* -------------------------
   SCRAPER 4 — ALDI
--------------------------*/
async function scrapeAldi() {
  try {
    const $ = await fetchHTML(URLS.aldi);
    const deals = [];

    $(".mod-article-tile").each((i, el) => {
      const item = $(el).find(".mod-article-tile__title").text().trim();
      const price = $(el).find(".price__main").text().trim();

      if (item) {
        deals.push({
          store: "Aldi",
          item,
          price: price || null
        });
      }
    });

    return deals;
  } catch {
    return [];
  }
}

/* -------------------------
   API ENDPOINT
--------------------------*/
app.get("/api/deals", async (req, res) => {
  const [ah, jumbo, lidl, aldi] = await Promise.all([
    scrapeAH(),
    scrapeJumbo(),
    scrapeLidl(),
    scrapeAldi()
  ]);

  const allDeals = [...ah, ...jumbo, ...lidl, ...aldi];

  res.json(allDeals);
});

app.listen(3000, () => {
  console.log("Scraper draait op http://localhost:3000");
});
