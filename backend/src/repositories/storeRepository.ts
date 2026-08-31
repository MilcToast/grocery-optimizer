import { pool } from "../db";

/*
 * Returns object with all stores in the database with
 * store id, name, lat, lon
 */
export async function getStores() {
  const result = await pool.query("SELECT * FROM stores");

  console.log(result.rows);

  return result.rows;
}