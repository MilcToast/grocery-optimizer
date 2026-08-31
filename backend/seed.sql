-- docker exec -i grocery-db psql -U MilcToast -d grocery_optimizer < seed.sql

-- =========================
-- STORES
-- =========================

INSERT INTO stores (name, lat, lng) VALUES
(`Joti's NoFrills Vancouver`, 49.2629, -123.1117),
('Safeway Davie Street', 49.2869, -123.1396),
('Costco Downtown', 49.2780, -123.1106),
('Save-On-Foods Olympic Village', 49.2707, -123.1059),
('Walmart North Vancouver', 49.3211, -123.1001);

-- =========================
-- PRODUCTS
-- =========================

INSERT INTO products (name) VALUES

('milk (2L)'),
('dozen (12) eggs'),
('rice'),
('white bread'),
('chicken breast'),
('gala apples (3lb)'),
('bananas (1 bunch)'),
('pasta'),
('tomatoes (on the vine)'),
('cheese (500g)'),
('potatoes'),
('onions'),
('carrots'),
('cereal'),
('butter'),
('yogurt'),
('ground beef'),
('orange juice'),
('coffee'),
('flour');

-- =========================
-- STORE PRICES
-- =========================

-- Joti's No Frills Vancouver (store_id = 1)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(1, 1, 4.97),
(1, 2, 4.21),
(1, 3, 8.99),
(1, 4, 2.50),
(1, 5, 12.49),
(1, 6, 9.99),
(1, 7, 1.98),
(1, 8, 2.00),
(1, 9, 3.12),
(1, 10, 6.45);

-- Safeway Davie Street (store_id = 2)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(2, 1, 5.89),
(2, 2, 4.25),
(2, 3, 9.49),
(2, 4, 4.29),
(2, 5, 13.99),
(2, 6, 8.99),
(2, 7, 2.25),
(2, 8, 3.29),
(2, 9, 5.47),
(2, 10, 8.5);

-- Costco Downtown (store_id = 3)
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

-- Save-On-Foods Olympic Village (store_id = 4)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(4, 1, 5.09),
(4, 2, 4.29),
(4, 3, 8.79),
(4, 4, 2.99),
(4, 5, 13.49),
(4, 6, 8.99),
(4, 7, 2.30),
(4, 8, 3.50),
(4, 9, 6.26),
(4, 10, 6.65);

-- Walmart North Vancouver (store_id = 5)
INSERT INTO store_prices (store_id, product_id, price) VALUES
(5, 1, 4.97),
(5, 2, 4.21),
(5, 3, 7.49),
(5, 4, 2.48),
(5, 5, 11.49),
(5, 6, 6.97),
(5, 7, 1.96),
(5, 8, 2.47),
(5, 9, 2.90),
(5, 10, 6.25);