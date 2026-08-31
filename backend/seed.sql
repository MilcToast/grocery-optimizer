-- docker exec -i grocery-db psql -U MilcToast -d grocery_optimizer < seed.sql

-- =========================
-- STORES
-- =========================

INSERT INTO stores (name, lat, lon) VALUES
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
('rice'), -- todo
('white bread'),
('chicken breast'), -- todo
('gala apples (3lb)'),
('bananas (1 bunch)'),
('pasta'),
('tomatoes (on the vine)'),
('cheese (500g)'),
('yellow potatoes (10lb)'),
('onions (3lb)'),
('carrots (3lb)'),
('cereal'), -- todo
('butter (1lb)'), 
('yogurt (650g)'),
('ground beef (1lb)'),
('orange juice (2.63L)'),
('coffee'), -- todo
('flour (2.5kg)');

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
(1, 10, 6.45),
(1, 11, 7.99),
(1, 12, 3.79),
(1, 13, 8.99),
(1, 14, 4.50),
(1, 15, 4.50),
(1, 16, 3.49),
(1, 17, 8.50),
(1, 18, 8.99),
(1, 19, 3.12),
(1, 20, 3.79);

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
(2, 10, 8.5),
(2, 11, 7.99),
(2, 12, 5.49),
(2, 13, 5.24),
(2, 14, 8.29),
(2, 15, 8.29),
(2, 16, 5.49),
(2, 17, 6.99),
(2, 18, 11.99),
(2, 19, 3.12),
(2, 20, 4.99);

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
(3, 10, 5.89),
(3, 11, 7.99),
(3, 12, 4.21),
(3, 13, 8.99),
(3, 14, 2.50),
(3, 15, 12.49),
(3, 16, 9.99),
(3, 17, 1.98),
(3, 18, 2.00),
(3, 19, 3.12),
(3, 20, 6.45);

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
(4, 10, 6.65),
(4, 11, 9.99),
(4, 12, 4.99),
(4, 13, 5.49),
(4, 14, 6.69),
(4, 15, 6.69),
(4, 16, 3.29),
(4, 17, 8.50),
(4, 18, 8.99),
(4, 19, 6.26),
(4, 20, 6.69);

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
(5, 10, 6.25),
(5, 11, 7.97),
(5, 12, 2.94),
(5, 13, 2.94),
(5, 14, 4.97),
(5, 15, 4.97),
(5, 16, 3.27),
(5, 17, 7.98),
(5, 18, 8.44),
(5, 19, 2.90),
(5, 20, 3.77);