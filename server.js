// Supermarkten die we willen behouden
const ALLOWED_STORES = [
  "Albert Heijn",
  "Jumbo",
  "Lidl",
  "Aldi",
  "Dirk",
  "Plus",
  "Hoogvliet",
  "Vomar"
];

app.get("/api/deals", async (req, res) => {
  let allDeals = [];

  for (const term of SEARCH_TERMS) {
    const results = await scrapeTerm(term);
    allDeals = allDeals.concat(results);
  }

  // Filter op toegestane supermarkten
  const filtered = allDeals.filter(d =>
    ALLOWED_STORES.includes(d.store)
  );

  // Duplicaten verwijderen
  const unique = [];
  const seen = new Set();

  for (const d of filtered) {
    const key = `${d.store}-${d.item}-${d.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(d);
    }
  }

  res.json(unique);
});
