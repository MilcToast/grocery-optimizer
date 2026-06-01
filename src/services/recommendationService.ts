import { pool } from "../db";

/*
 * Returns store for which the total price of the items is the lowest
 *
 * @param items - List of items that user wants to buy
 */
export async function cheapestStore(items : string[]) {
  const result = await pool.query(
    `SELECT 
      s.id,
      s.name,
      SUM(sp.price) AS total_price
    FROM store_prices sp
    JOIN stores s ON s.id = sp.store_id
    JOIN products p ON p.id = sp.product_id
    WHERE p.name = ANY($1)
    GROUP BY s.id, s.name
    ORDER BY total_price ASC
    LIMIT 1;
    `, [items]);

    return result.rows[0]
}