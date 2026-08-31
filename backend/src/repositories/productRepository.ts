import { pool } from "../db";

/*
 * Returns object with product id and name
 *
 * @param name - The name of the product we are searching for
 */
export async function getProductByName(name : string) {
  const result = await pool.query("SELECT * FROM products WHERE name = $1",
    [name]
  );

  return result.rows[0];
}

/*
 * Returns all product names ordered alphabetically
 */
export async function getAllProductNames() {
  const result = await pool.query<{ name: string }>(
    "SELECT name FROM products ORDER BY name ASC"
  );

  return result.rows.map((row) => row.name);
}