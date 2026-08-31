import express from "express";
import { recommendStore } from "./services/recommendationService";

const app = express();
const PORT = 3000;

type RequestItem = {
  product: string;
  quantity: number;
};

type RecommendRequest = {
  items: RequestItem[];
  lat: number;
  lon: number;
};

type GeocodeRequest = {
  address: string;
};

type GeocodeResult = {
  lat: number;
  lon: number;
  display_name?: string;
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

async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    throw new Error("Address is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key is not configured");
  }

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(trimmedAddress)}` +
    `&key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to geocode that address");
  }

  const payload = (await response.json()) as {
    results?: Array<{
      geometry?: {
        location?: {
          lat?: number;
          lng?: number;
        };
      };
      formatted_address?: string;
    }>;
  };

  const match = payload.results?.[0];
  const location = match?.geometry?.location;
  const lat = Number(location?.lat);
  const lon = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Coordinates could not be determined for that address");
  }

  return {
    lat,
    lon,
    display_name: match?.formatted_address,
  };
}

function normalizeCoordinate(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function validateRecommendationRequest(items: unknown, lat: unknown, lon: unknown) {
  const normalizedLat = normalizeCoordinate(lat);
  const normalizedLon = normalizeCoordinate(lon);

  if (
    normalizedLat === undefined ||
    normalizedLon === undefined ||
    normalizedLat < -90 ||
    normalizedLat > 90 ||
    normalizedLon < -180 ||
    normalizedLon > 180
  ) {
    return { error: "Invalid latitude or longitude" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "At least one item is required" };
  }

  const validationErrors: Array<{
    index: number;
    product?: unknown;
    quantity?: unknown;
    message: string;
  }> = [];

  items.forEach((item, index) => {
    const itemRecord = item as { product?: unknown; quantity?: unknown } | null;

    if (!itemRecord || typeof itemRecord !== "object") {
      validationErrors.push({ index, message: "Invalid item object" });
      return;
    }

    const product = itemRecord.product;
    const quantity = itemRecord.quantity;

    if (typeof product !== "string" || !product.trim()) {
      validationErrors.push({ index, product, quantity, message: "Product name cannot be empty" });
      return;
    }

    if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
      validationErrors.push({ index, product, quantity, message: "Quantity must be a number" });
      return;
    }

    if (!Number.isInteger(quantity)) {
      validationErrors.push({ index, product, quantity, message: "Quantity must be an integer" });
      return;
    }

    if (quantity <= 0) {
      validationErrors.push({ index, product, quantity, message: "Quantity must be greater than zero" });
    }
  });

  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  return {
    normalizedItems: items.map((item) => {
      const itemRecord = item as { product: string; quantity: number };
      return {
        product: itemRecord.product.trim(),
        quantity: Math.floor(Number(itemRecord.quantity)),
      };
    }),
  };
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/geocode", async (req, res) => {
  try {
    const { address } = req.body as Partial<GeocodeRequest>;

    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ error: "Address is required" });
    }

    const coordinates = await geocodeAddress(address);
    return res.json({
      lat: coordinates.lat,
      lon: coordinates.lon,
      display_name: coordinates.display_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to geocode address";
    return res.status(400).json({ error: message });
  }
});

app.post("/api/recommend", async (req, res) => {
  try {
    const { items, lat, lon } = req.body as Partial<RecommendRequest>;
    console.log("recommend payload", { items, lat, lon, normalizedLat: normalizeCoordinate(lat), normalizedLon: normalizeCoordinate(lon) });
    const validation = validateRecommendationRequest(items, lat, lon);

    if ("error" in validation) {
      return res.status(400).json({ error: validation.error });
    }

    if ("errors" in validation) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await recommendStore(validation.normalizedItems, lat as number, lon as number);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal server error" });
  }
});

app.post("/recommend", async (req, res) => {
  try {
    const { items, lat, lon } = req.body as Partial<RecommendRequest>;
    const validation = validateRecommendationRequest(items, lat, lon);

    if ("error" in validation) {
      return res.status(400).json({ error: validation.error });
    }

    if ("errors" in validation) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await recommendStore(validation.normalizedItems, lat as number, lon as number);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});