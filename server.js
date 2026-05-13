import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

// Folderz supermarkt aanbiedingen
const URL = "https://folderz.nl/supermarkten";

async function scrapeDeals() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);
    const deals = [];

    // Elke aanbieding staat in een product-card
    $(".product-card").each((i, el) => {
      const store = $(el).find(".product-card__shop").text().trim();
      const item = $(el).find(".product-card__title").text().trim();
      const price = $(el).find(".product-card__price").text().trim();

      if (store && item) {
        deals.push({
          store,
          item,
          price: price || null
        });
      }
    });

    return deals;
  } catch (err) {
    console.error("Scraping error:", err.message);
    return [];
  }
}

app.get("/api/deals", async (req, res) => {
  const deals = await scrapeDeals();

  if (deals.length === 0) {
    return res.json({
      error: "Geen deals gevonden (scraping mislukt)",
      deals: []
    });
  }

  res.json(deals);
});

app.listen(3000, () => {
  console.log("Scraper draait op http://localhost:3000");
});
