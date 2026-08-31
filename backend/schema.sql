-- docker exec -i grocery-db psql -U MilcToast -d grocery_optimizer < schema.sql
-- =========================================
-- RESET OLD TABLES (safe for development)
-- =========================================

DROP TABLE IF EXISTS store_prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;

-- =========================================
-- STORES
-- =========================================

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,  
    name TEXT NOT NULL UNIQUE,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL
);

-- =========================================
-- PRODUCTS
-- =========================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- =========================================
-- STORE PRICES
-- =========================================

CREATE TABLE store_prices (
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    price NUMERIC(6,2) NOT NULL CHECK (price >= 0),

    PRIMARY KEY (store_id, product_id),

    CONSTRAINT fk_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- =========================================
-- INDEXES (good backend practice)
-- =========================================

CREATE INDEX idx_store_prices_store
ON store_prices(store_id);

CREATE INDEX idx_store_prices_product
ON store_prices(product_id);