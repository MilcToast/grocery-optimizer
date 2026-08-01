import express from "express";
import { recommendStore } from "./services/recommendationService";

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

/*
 * Health check endpoint to verify that the server is running
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
})

/*
 * Endpoint to recommend the best store based on total price and distance
 *
 * Request body should contain:
 * - items: List of items that user wants to buy
 * - lat: User's latitude
 * - lng: User's longitude
 * Example request body:
 *  {
 *   "items": ["milk", "bread", "eggs"],
 *   "lat": 40.7128,
 *   "lng": -74.0060 
 *  }
 */
app.post("/recommend", async (req, res) => {
  try {
    const { items, lat, lng } = req.body;

    if (!items || !lat || !lng) {
      return res.status(400).json({
        error: "Missing required fields: items, lat, lng"
      });
    }

    const result = await recommendStore(items, lat, lng);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "internal server error"
    });
  }
});

/*
 * Start the server and listen on the specified port
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});