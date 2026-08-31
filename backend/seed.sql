-- docker exec -i grocery-db psql -U MilcToast -d grocery_optimizer < seed.sql

-- =========================
-- STORES
-- =========================

INSERT INTO stores (name, lat, lon) VALUES
('No Frills Downtown', 49.2790, -123.1180),
('Safeway UBC', 49.2665, -123.2490),
('T&T Richmond', 49.1830, -123.1360),
('Save-On-Foods Kitsilano', 49.2680, -123.1680),
('Walmart Metrotown', 49.2276, -123.0036);

-- =========================
-- PRODUCTS
-- =========================

INSERT INTO products (name) VALUES
('milk'),
('eggs'),
('rice'),
('bread'),
('chicken breast'),
('apples'),
('bananas'),
('pasta'),
('tomatoes'),
('cheese');

-- =========================
-- STORE PRICES
-- =========================

-- No Frills Downtown (store_id = 1)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(1, 1, 4.49),
(1, 2, 3.29),
(1, 3, 8.99),
(1, 4, 2.99),
(1, 5, 12.49),
(1, 6, 4.99),
(1, 7, 1.89),
(1, 8, 2.49),
(1, 9, 3.99),
(1, 10, 5.49);

-- Safeway UBC (store_id = 2)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(2, 1, 5.29),
(2, 2, 3.89),
(2, 3, 9.49),
(2, 4, 3.49),
(2, 5, 13.99),
(2, 6, 5.49),
(2, 7, 2.19),
(2, 8, 2.99),
(2, 9, 4.49),
(2, 10, 6.29);

-- T&T Richmond (store_id = 3)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(3, 1, 4.79),
(3, 2, 3.39),
(3, 3, 7.99),
(3, 4, 3.19),
(3, 5, 11.99),
(3, 6, 5.29),
(3, 7, 1.99),
(3, 8, 2.69),
(3, 9, 3.79),
(3, 10, 5.89);

-- Save-On-Foods Kitsilano (store_id = 4)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(4, 1, 5.09),
(4, 2, 3.69),
(4, 3, 8.79),
(4, 4, 3.39),
(4, 5, 13.49),
(4, 6, 5.19),
(4, 7, 2.09),
(4, 8, 2.89),
(4, 9, 4.19),
(4, 10, 6.09);

-- Walmart Metrotown (store_id = 5)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(5, 1, 4.19),
(5, 2, 3.09),
(5, 3, 7.49),
(5, 4, 2.79),
(5, 5, 11.49),
(5, 6, 4.79),
(5, 7, 1.79),
(5, 8, 2.29),
(5, 9, 3.69),
(5, 10, 5.19);