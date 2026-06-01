import { pool } from "../db";

/*
 * Returns array of objects with store_id, product_id, and price for a given store id
 *
 * @param storeId - The id of the store we want to get prices for 
 */
export async function getPricesForStore(storeId : number) {
  const result = await pool.query("SELECT * FROM store_prices WHERE store_id = $1",
    [storeId]
  );

  return result.rows;
}

/*
 * Returns object with price for a given store id and product id
 *
 * @param storeId - The id of the store we want to get price for
 * @param productId - The id of the product we want to get price for
 * 
 */
export async function getPrice(storeId : number, productId : number) {
  const result = await pool.query("SELECT price FROM store_prices WHERE store_id = $1 AND product_id = $2",
    [storeId, productId]
  );

  return result.rows[0];
}