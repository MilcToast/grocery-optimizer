# Grocery Optimizer

## Overview

Grocery Optimizer is a full-stack application that helps users find the best grocery store for a shopping list by balancing both product prices and travel distance.

Given a list of grocery items and a user location, the application compares prices across multiple stores, calculates a distance-adjusted score for each store, and recommends the best option.

The project is currently focused on Vancouver grocery stores and serves as a learning project for full-stack development, database design, API development, and recommendation systems.

---

## Features

Current functionality includes:

* PostgreSQL database containing stores, products, and store-specific pricing information
* Distance calculation using latitude and longitude coordinates
* Price aggregation across shopping lists
* Store ranking based on total basket cost and travel distance
* REST API endpoint for retrieving recommendations
* React frontend (in progress)

---

## Tech Stack

### Backend

* TypeScript
* Node.js
* Express
* PostgreSQL
* Docker

### Frontend

* React
* TypeScript
* Vite

---

## Database Schema

### Stores

Stores contain location information used for distance calculations.

```text
stores
├── id
├── name
├── lat
└── lng
```

### Products

Products represent grocery items.

```text
products
├── id
└── name
```

### Store Prices

Stores the price of a product at a specific store.

```text
store_prices
├── store_id
├── product_id
└── price
```

---

## Recommendation Algorithm

For a given shopping list:

1. Calculate the total cost of all requested items at each store.
2. Compute the distance between the user and each store using the Haversine formula.
3. Apply a distance penalty to account for travel cost.
4. Rank stores by score.

Current scoring function:

```text
score = totalPrice + distance × distancePenaltyPerKm
```

Lower scores indicate better recommendations.

---

## Running the Backend

### Start PostgreSQL

```bash
docker start grocery-db
```

### Run the backend server

```bash
cd backend
npm install
npx tsx src/server.ts
```

The API will be available at:

```text
http://localhost:3000
```

---

## API

### POST /recommend

Request:

```json
{
  "items": ["milk", "eggs", "rice"],
  "lat": 49.2827,
  "lng": -123.1207
}
```

Response:

```json
{
  "id": 5,
  "name": "Walmart Metrotown",
  "total_price": "14.77",
  "distance": 9.88,
  "score": 16.75
}
```

---

## Current Status

Completed:

* Database schema design
* Seed data for Vancouver grocery stores
* PostgreSQL integration
* Recommendation engine
* Distance-aware ranking
* Express API

In Progress:

* React frontend
* Improved API validation
* Top-N store recommendations

Planned:

* Browser-based location support
* Additional grocery stores
* Detailed price breakdowns
* Store comparison views
* Deployment
