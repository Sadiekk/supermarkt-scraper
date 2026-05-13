import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Root route (test)
app.get("/", (req, res) => {
  res.send("Server is online ✅");
});

// Test-API route
app.get("/api/deals", (req, res) => {
  res.json([
    { store: "Testwinkel", item: "Testproduct", price: "1.00" }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});

