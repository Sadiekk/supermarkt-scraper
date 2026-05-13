import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

// Werkende Voordeelmuis supermarkt-URL's
const SUPERMARKET_URLS = {
  "Albert Heijn": "https://www.voordeelmuis.nl/aanbiedingen/ah",
  "Jumbo": "https://www.voordeelmuis.nl/aanbiedingen/jumbo",
  "Lidl": "https://www.voordeelmuis.nl/aanbiedingen/lidl",
  "Aldi": "https://www.voordeelmuis.nl/aanbiedingen/aldi",
  "Dirk": "https://www.voordeelmuis.nl/aanbiedingen/dirk",
  "Plus": "https://www.voordeelmuis.nl/aanbiedingen/plus",
  "Hoogvliet": "https://www.voordeelmuis.nl/aanbiedingen/hoogvliet",
  "Vomar": "https://www.voordeelmuis.nl/aanbiedingen/vomar"
};

// Scraper voor 1 supermarkt
async function scrapeSupermarket(store, url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const deals = [];

    $(".product-list-item").each((i, el) => {
      const item = $(el).find(".product-title").text().trim();
      const price = $(el).find(".price").text().trim();

      if (item) {
        deals.push({
          store,
          item,
          price
        });
      }
    });

    return deals;
  } catch (err) {
    console.error(`Error scraping ${store}:`, err.message);
    return [];
  }
}

app.get("/api/deals", async (req, res) => {
  let allDeals = [];

  for (const [store, url] of Object.entries(SUPERMARKET_URLS)) {
    const results = await scrapeSupermarket(store, url);
    allDeals = allDeals.concat(results);
  }

  // Duplicaten verwijderen
  const unique = [];
  const seen = new Set();

  for (const d of allDeals) {
    const key = `${d.store}-${d.item}-${d.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(d);
    }
  }

  res.json(unique);
});

app.listen(3000, () => {
  console.log("Supermarkt scraper draait op http://localhost:3000");
});
