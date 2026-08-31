import express from "express";
import { recommendStore } from "./services/recommendationService";
import { getAllProductNames } from "./repositories/productRepository";

const app = express();
const PORT = 3000;

type RequestItem = {
  product: string;
  quantity: number;
};

type RecommendRequest = {
  items: RequestItem[];
  lat: number;
  lng: number;
};

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
 * Returns all products for frontend form options
 */
app.get("/products", async (_req, res) => {
  try {
    const products = await getAllProductNames();
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

/*
 * Endpoint to recommend the best store based on total price and distance
 *
 * Request body should contain:
 * - items: List of items that user wants to buy
 * - lat: User's latitude
 * - lng: User's longitude
 * Example request body:
 *  {
 *   "items": [
 *      { "product": "milk", "quantity": 2 },
        { "product": "bread", "quantity": 1 },
        { "product": "eggs", "quantity": 12 }
      ],
 *   "lat": 40.7128,
 *   "lng": -74.0060 
 *  }
 */
app.post("/recommend", async (req, res) => {
  try {
    const { items, lat, lng } = req.body as Partial<RecommendRequest>;

    // Validate lat/lon
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        error: "Invalid latitude or longitude",
      });
    }

    // Validate presence of items in array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "At least one item is required",
      });
    }

    // Validate each row and return detailed errors
    const validationErrors: Array<{ index: number; product?: unknown; quantity?: unknown; message: string }> = []

    items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        validationErrors.push({
          index,
          message: "Invalid item object",
        });
        return;
      }

      const product = item.product;
      const quantity = item.quantity;

      if (typeof product !== "string" || !product.trim()) {
        validationErrors.push({
          index,
          product,
          quantity,
          message: "Product name cannot be empty",
        });
        return;
      }

      if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
        validationErrors.push({
          index,
          product,
          quantity,
          message: "Quantity must be a number",
        });
        return;
      }

      if (!Number.isInteger(quantity)) {
        validationErrors.push({
          index,
          product,
          quantity,
          message: "Quantity must be an integer",
        });
        return;
      }

      if (quantity <= 0) {
        validationErrors.push({
          index,
          product,
          quantity,
          message: "Quantity must be greater than zero",
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        errors: validationErrors,
      });
    }

    const normalizedItems = items.map((item) => ({ product: item.product.trim(), quantity: Math.floor(Number(item.quantity)) }))

    const result = await recommendStore(normalizedItems, lat, lng);

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