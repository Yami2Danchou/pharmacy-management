-- ============================================================
-- LABDRUG PHARMACY - Database Schema for Neon DB (PostgreSQL)
-- Run this script in your Neon SQL Editor to initialize tables
-- ============================================================

-- Category Table
CREATE TABLE IF NOT EXISTS category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Brand Table
CREATE TABLE IF NOT EXISTS brand (
  brand_id SERIAL PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Product Table
CREATE TABLE IF NOT EXISTS product (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(200) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES category(category_id),
  description TEXT,
  brand_id INTEGER NOT NULL REFERENCES brand(brand_id),
  reorder_level INTEGER NOT NULL DEFAULT 10
);

-- Product Expiration Date Table
CREATE TABLE IF NOT EXISTS product_expirationdate (
  batch_code VARCHAR(50) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES product(product_id),
  quantity INTEGER NOT NULL DEFAULT 0,
  expirationdate DATE,
  PRIMARY KEY (batch_code, product_id)
);

-- Employee Table
CREATE TABLE IF NOT EXISTS employee (
  employee_id SERIAL PRIMARY KEY,
  employee_name VARCHAR(200),
  employee_gender VARCHAR(10),
  employee_age INTEGER,
  employee_address TEXT,
  employee_contacts VARCHAR(20)
);

-- User Table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Cashier')),
  employee_id INTEGER NOT NULL REFERENCES employee(employee_id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Customer Table
CREATE TABLE IF NOT EXISTS customer (
  customer_id SERIAL PRIMARY KEY,
  birth_date DATE,
  customer_name VARCHAR(200),
  gender VARCHAR(10),
  contacts VARCHAR(20),
  address TEXT
);

-- Supplier Table
CREATE TABLE IF NOT EXISTS supplier (
  supplier_id SERIAL PRIMARY KEY,
  supplier_name VARCHAR(200) NOT NULL UNIQUE,
  contact_person VARCHAR(200),
  contact_number VARCHAR(20),
  address TEXT
);

-- Sale Table
CREATE TABLE IF NOT EXISTS sale (
  sale_id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id INTEGER REFERENCES customer(customer_id),
  sale_description TEXT,
  total_amount DECIMAL(10,2),
  user_id INTEGER NOT NULL REFERENCES users(user_id)
);

-- Sales Details Table
CREATE TABLE IF NOT EXISTS sales_details (
  sales_detail_id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sale(sale_id),
  product_id INTEGER NOT NULL REFERENCES product(product_id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Rx Details Table
CREATE TABLE IF NOT EXISTS rx_details (
  sales_detail_id INTEGER PRIMARY KEY REFERENCES sales_details(sales_detail_id),
  quantity_remaining INTEGER
);

-- Supply Table
CREATE TABLE IF NOT EXISTS supply (
  supply_id SERIAL PRIMARY KEY,
  supply_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id INTEGER NOT NULL REFERENCES supplier(supplier_id),
  employee_id INTEGER REFERENCES employee(employee_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  total_amount DECIMAL(10,2)
);

-- Supply Details Table
CREATE TABLE IF NOT EXISTS supply_details (
  supply_id INTEGER NOT NULL REFERENCES supply(supply_id),
  product_id INTEGER NOT NULL REFERENCES product(product_id),
  quantity INTEGER NOT NULL,
  supply_amount DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  PRIMARY KEY (supply_id, product_id)
);

-- Stock Out Table
CREATE TABLE IF NOT EXISTS stock_out (
  stock_out_id SERIAL PRIMARY KEY,
  total DECIMAL(10,2),
  stock_out_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id INTEGER REFERENCES employee(employee_id),
  user_id INTEGER NOT NULL REFERENCES users(user_id)
);

-- Stock Out Details Table
CREATE TABLE IF NOT EXISTS stock_out_details (
  stock_out_id INTEGER NOT NULL REFERENCES stock_out(stock_out_id),
  product_id INTEGER NOT NULL REFERENCES product(product_id),
  quantity INTEGER NOT NULL,
  description VARCHAR(50) CHECK (description IN ('lost', 'expired', 'damaged')),
  PRIMARY KEY (stock_out_id, product_id)
);

-- Return of Products Table
CREATE TABLE IF NOT EXISTS return_of_products (
  return_product_id SERIAL PRIMARY KEY,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_type VARCHAR(50) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  verified_by_employee_id INTEGER NOT NULL REFERENCES employee(employee_id),
  sale_id INTEGER REFERENCES sale(sale_id),
  customer_name VARCHAR(200),
  user_id INTEGER NOT NULL REFERENCES users(user_id)
);

-- Return Details Table
CREATE TABLE IF NOT EXISTS return_details (
  return_details_id SERIAL PRIMARY KEY,
  return_id INTEGER NOT NULL REFERENCES return_of_products(return_product_id),
  product_id INTEGER NOT NULL REFERENCES product(product_id),
  quantity INTEGER NOT NULL
);

-- ============================================================
-- VIEWS for easy querying
-- ============================================================

-- Inventory view with current stock levels
CREATE OR REPLACE VIEW inventory_view AS
SELECT 
  p.product_id,
  p.product_name,
  p.unit,
  p.price,
  p.reorder_level,
  c.category_name,
  b.brand_name,
  COALESCE(SUM(pe.quantity), 0) AS current_stock
FROM product p
LEFT JOIN category c ON p.category_id = c.category_id
LEFT JOIN brand b ON p.brand_id = b.brand_id
LEFT JOIN product_expirationdate pe ON p.product_id = pe.product_id
GROUP BY p.product_id, p.product_name, p.unit, p.price, p.reorder_level, c.category_name, b.brand_name;

-- Expiring products view (within 90 days)
CREATE OR REPLACE VIEW expiring_products_view AS
SELECT 
  p.product_id,
  p.product_name,
  pe.batch_code,
  pe.quantity,
  pe.expirationdate,
  (pe.expirationdate - CURRENT_DATE) AS days_until_expiry,
  c.category_name
FROM product_expirationdate pe
JOIN product p ON pe.product_id = p.product_id
JOIN category c ON p.category_id = c.category_id
WHERE pe.expirationdate IS NOT NULL 
  AND pe.expirationdate <= CURRENT_DATE + INTERVAL '90 days'
  AND pe.quantity > 0
ORDER BY pe.expirationdate ASC;

-- ============================================================
-- SEED DATA - Initial categories, brands, and admin user
-- ============================================================

INSERT INTO category (category_name, description) VALUES
  ('Prescription Drugs', 'Medicines requiring a doctor prescription'),
  ('Over-the-Counter', 'Medicines available without prescription'),
  ('Vitamins & Supplements', 'Nutritional supplements and vitamins'),
  ('Personal Care', 'Hygiene and personal care products'),
  ('Medical Supplies', 'Medical equipment and supplies')
ON CONFLICT DO NOTHING;

INSERT INTO brand (brand_name, description) VALUES
  ('Generic', 'Generic pharmaceutical products'),
  ('Unilab', 'United Laboratories Inc.'),
  ('Pfizer', 'Pfizer pharmaceutical products'),
  ('Novartis', 'Novartis pharmaceutical products'),
  ('Roche', 'Roche pharmaceutical products')
ON CONFLICT DO NOTHING;

-- Default employee for admin
INSERT INTO employee (employee_name, employee_gender, employee_age, employee_address, employee_contacts)
VALUES ('System Administrator', 'N/A', 0, 'Labdrug Pharmacy, Isulan', '09000000000')
ON CONFLICT DO NOTHING;

-- Admin user: username=admin, password=admin123 (CHANGE IN PRODUCTION)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, password_hash, role, employee_id, is_active)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 1, TRUE)
ON CONFLICT DO NOTHING;
