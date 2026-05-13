import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

// Supermarkten + filtercodes
const SUPERMARKETS = {
  "Albert Heijn": "ah",
  "Jumbo": "jumbo",
  "Lidl": "lidl",
  "Aldi": "aldi",
  "Dirk": "dirk",
  "Plus": "plus",
  "Hoogvliet": "hoogvliet",
  "Vomar": "vomar"
};

// Scraper per supermarkt
async function scrapeSupermarket(name, code) {
  const url = `https://www.voordeelmuis.nl/cgi-bin/v.cgi?a=ss&d=1&f=${code}`;

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const deals = [];

    $("table tr").each((i, el) => {
      const item = $(el).find("td:nth-child(2)").text().trim();
      const price = $(el).find("td:nth-child(3)").text().trim();

      if (item) {
        deals.push({
          store: name,
          item,
          price
        });
      }
    });

    return deals;
  } catch (err) {
    console.error(`Error scraping ${name}:`, err.message);
    return [];
  }
}

app.get("/api/deals", async (req, res) => {
  let allDeals = [];

  for (const [name, code] of Object.entries(SUPERMARKETS)) {
    const results = await scrapeSupermarket(name, code);
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
  console.log("Voordeelmuis supermarkt scraper draait op http://localhost:3000");
});

