import { pool } from "../db";
import { haversineDistance } from "../utils/distance";

/*
 * Recommends the best store based on total price and distance
 *
 * @param items - List of items that user wants to buy
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @return The recommended store with the lowest score (total price + distance penalty)
 */
export async function recommendStore(items: string[], userLat: number, userLon: number) {
  const stores = await getStoreTotals(items);
  
  const scoredStores = stores.map(store => {
    const distance = haversineDistance(userLat, userLon, store.lat, store.lng);

    const score = calculateScore(Number(store.total_price), distance);

    return {
      ...store,
      distance,
      score
    }
  });

  scoredStores.sort((a, b) => a.score - b.score);

  return scoredStores[0];
}
/*
 * Returns store for which the total price of the items is the lowest
 *
 * @param items - List of items that user wants to buy
 */
async function getStoreTotals(items : string[]) {
  const result = await pool.query(
    `SELECT 
      s.id,
      s.name,
      s.lat,
      s.lng,
      SUM(sp.price) AS total_price
    FROM store_prices sp
    JOIN stores s ON s.id = sp.store_id
    JOIN products p ON p.id = sp.product_id
    WHERE p.name = ANY($1)
    GROUP BY s.id, s.name, s.lat, s.lng
    ORDER BY total_price ASC;
    `, [items]);

    return result.rows;
}

/*
 * Calculates a score for a store based on total price and distance
 *
 * @param totalPrice - Total price of the items at the store
 * @param distance - Distance from the user to the store in kilometers
 * @return A score where lower is better (total price + distance penalty)
 */
function calculateScore(totalPrice: number, distance: number): number {
  const distancePenaltyPerKM = 0.2; // Weight for distance in the score (Each km equates to $0.20)

  return totalPrice + distance * distancePenaltyPerKM;
}