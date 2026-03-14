-- ============================================================
-- LABDRUG PHARMACY - Inventory & Transaction Population Fix
-- Run this AFTER schema.sql and seed.sql
-- This script:
--   1. Resets product_expirationdate to accurate quantities
--      (already accounting for all sales & stock-outs below)
--   2. Clears and repopulates sales, sales_details, stock_out,
--      stock_out_details, return_of_products, return_details
--      with richer, more realistic data
-- ============================================================

-- ============================================================
-- STEP 1: CLEAR EXISTING TRANSACTION DATA
-- ============================================================
DELETE FROM return_details;
DELETE FROM return_of_products;
DELETE FROM stock_out_details;
DELETE FROM stock_out;
DELETE FROM rx_details;
DELETE FROM sales_details;
DELETE FROM sale;
DELETE FROM supply_details;
DELETE FROM supply;
DELETE FROM product_expirationdate;

-- Reset sequences
ALTER SEQUENCE sale_sale_id_seq RESTART WITH 1;
ALTER SEQUENCE sales_details_sales_detail_id_seq RESTART WITH 1;
ALTER SEQUENCE supply_supply_id_seq RESTART WITH 1;
ALTER SEQUENCE stock_out_stock_out_id_seq RESTART WITH 1;
ALTER SEQUENCE return_of_products_return_product_id_seq RESTART WITH 1;
ALTER SEQUENCE return_details_return_details_id_seq RESTART WITH 1;

-- ============================================================
-- STEP 2: SUPPLY DELIVERIES (6 deliveries Jan–Mar 2026)
-- ============================================================
INSERT INTO supply (supply_id, supply_date, supplier_id, employee_id, user_id, total_amount) VALUES
  (1, '2026-01-05', 1, 2, 2, 47850.00),
  (2, '2026-01-20', 2, 5, 5, 32400.00),
  (3, '2026-02-03', 3, 2, 2, 21650.00),
  (4, '2026-02-18', 1, 5, 5, 38900.00),
  (5, '2026-03-01', 6, 2, 2, 29750.00),
  (6, '2026-03-10', 2, 5, 5, 41200.00);

SELECT setval('supply_supply_id_seq', 6);

INSERT INTO supply_details (supply_id, product_id, quantity, supply_amount, subtotal) VALUES
  -- Supply 1: Jan 5 - General restocking
  (1,  1, 1000, 3.00,   3000.00),  -- Paracetamol
  (1,  2,  300, 5.50,   1650.00),  -- Mefenamic Acid
  (1,  3,  300, 4.50,   1350.00),  -- Ibuprofen
  (1,  4,  500, 2.00,   1000.00),  -- Aspirin
  (1,  5,  400, 4.00,   1600.00),  -- Biogesic
  (1,  6,  300, 8.00,   2400.00),  -- Amoxicillin
  (1, 31, 1000, 4.00,   4000.00),  -- Vit C
  (1, 32,  600, 5.50,   3300.00),  -- Vit B Complex
  (1, 33,  200, 8.00,   1600.00),  -- Vit E
  (1, 34,  200,10.00,   2000.00),  -- Calcium D3
  (1, 35,  300, 5.00,   1500.00),  -- Ferrous Sulfate
  (1, 36,  250, 6.50,   1625.00),  -- Zinc
  (1, 37,  300, 2.75,    825.00),  -- Folic Acid
  (1, 39,   60,70.00,   4200.00),  -- Betadine
  (1, 40,   60,35.00,   2100.00),  -- H2O2
  (1, 41,   80,60.00,   4800.00),  -- Alcohol
  (1, 42,   50,25.00,   1250.00),  -- Cotton Balls
  (1, 43,   40,40.00,   1600.00),  -- Band-Aid
  (1, 44,  150, 5.50,    825.00),  -- Gauze Pad
  (1, 45,   60,12.00,    720.00),  -- Surgical Gloves
  (1, 46,  120, 5.50,    660.00),  -- Disposable Syringe

  -- Supply 2: Jan 20 - Specialty medicines
  (2,  7,  120,40.00,   4800.00),  -- Azithromycin
  (2,  8,  150,12.00,   1800.00),  -- Ciprofloxacin
  (2,  9,   80,30.00,   2400.00),  -- Clarithromycin
  (2, 10,  100,26.00,   2600.00),  -- Co-Amoxiclav
  (2, 11,  200, 6.50,   1300.00),  -- Amlodipine
  (2, 12,  200, 9.50,   1900.00),  -- Losartan
  (2, 13,  150,16.00,   2400.00),  -- Atorvastatin
  (2, 14,  120,13.00,   1560.00),  -- Metoprolol
  (2, 15,  120, 7.50,    900.00),  -- Enalapril
  (2, 18,   20,700.00, 14000.00),  -- Insulin
  (2, 19,   50,300.00, 15000.00),  -- Glucometer Strips
  (2, 20,  200, 8.00,   1600.00),  -- Insulin Syringe
  (2, 21,  200, 3.00,    600.00),  -- Salbutamol tab
  (2, 22,   30,210.00,  6300.00),  -- Salbutamol Inhaler

  -- Supply 3: Feb 3 - GI & respiratory
  (3, 16,  250, 5.50,   1375.00),  -- Metformin
  (3, 17,  150, 4.50,    675.00),  -- Glibenclamide
  (3, 23,  300, 5.00,   1500.00),  -- Cetirizine
  (3, 24,  250, 5.00,   1250.00),  -- Loratadine
  (3, 25,   80,22.00,   1760.00),  -- Montelukast
  (3, 26,  200, 9.00,   1800.00),  -- Omeprazole
  (3, 27,  150, 6.00,    900.00),  -- Ranitidine
  (3, 28,  250, 4.00,   1000.00),  -- Loperamide
  (3, 29,  180, 6.50,   1170.00),  -- Domperidone
  (3, 30,  150, 3.50,    525.00),  -- Bisacodyl
  (3, 38,  100,13.00,   1300.00),  -- Fish Oil
  (3, 47,   15,120.00,  1800.00),  -- Thermometer
  (3, 48,    8,950.00,  7600.00),  -- BP Monitor

  -- Supply 4: Feb 18 - Replenishment run
  (4,  1,  500, 3.00,   1500.00),
  (4,  2,  200, 5.50,   1100.00),
  (4,  3,  200, 4.50,    900.00),
  (4,  5,  300, 4.00,   1200.00),
  (4,  6,  200, 8.00,   1600.00),
  (4, 11,  150, 6.50,    975.00),
  (4, 12,  150, 9.50,   1425.00),
  (4, 16,  200, 5.50,   1100.00),
  (4, 26,  150, 9.00,   1350.00),
  (4, 31,  500, 4.00,   2000.00),
  (4, 32,  400, 5.50,   2200.00),
  (4, 36,  200, 6.50,   1300.00),
  (4, 37,  200, 2.75,    550.00),
  (4, 49,    4,1850.00, 7400.00),  -- Nebulizer

  -- Supply 5: Mar 1
  (5,  4,  300, 2.00,    600.00),
  (5,  7,   80,40.00,   3200.00),
  (5,  8,  100,12.00,   1200.00),
  (5, 13,  100,16.00,   1600.00),
  (5, 14,  100,13.00,   1300.00),
  (5, 15,  100, 7.50,    750.00),
  (5, 22,   20,210.00,  4200.00),
  (5, 23,  200, 5.00,   1000.00),
  (5, 24,  200, 5.00,   1000.00),
  (5, 25,   60,22.00,   1320.00),
  (5, 34,  150,10.00,   1500.00),
  (5, 35,  200, 5.00,   1000.00),
  (5, 41,   60,60.00,   3600.00),
  (5, 42,   40,25.00,   1000.00),
  (5, 43,   30,40.00,   1200.00),
  (5, 44,  100, 5.50,    550.00),
  (5, 46,  100, 5.50,    550.00),
  (5, 33,  150, 8.00,   1200.00),
  (5, 38,   80,13.00,   1040.00),

  -- Supply 6: Mar 10
  (6,  1,  500, 3.00,   1500.00),
  (6,  5,  400, 4.00,   1600.00),
  (6,  6,  300, 8.00,   2400.00),
  (6,  9,   60,30.00,   1800.00),
  (6, 10,   80,26.00,   2080.00),
  (6, 16,  200, 5.50,   1100.00),
  (6, 17,  150, 4.50,    675.00),
  (6, 18,   15,700.00, 10500.00),
  (6, 19,   40,300.00, 12000.00),
  (6, 20,  150, 8.00,   1200.00),
  (6, 21,  150, 3.00,    450.00),
  (6, 26,  150, 9.00,   1350.00),
  (6, 27,  100, 6.00,    600.00),
  (6, 28,  200, 4.00,    800.00),
  (6, 29,  150, 6.50,    975.00),
  (6, 30,  150, 3.50,    525.00),
  (6, 31,  500, 4.00,   2000.00),
  (6, 32,  400, 5.50,   2200.00),
  (6, 35,  200, 5.00,   1000.00),
  (6, 36,  200, 6.50,   1300.00),
  (6, 37,  300, 2.75,    825.00);

-- ============================================================
-- STEP 3: SALES TRANSACTIONS (Jan 5 – Mar 13, 2026)
-- 50 transactions across 2+ months
-- ============================================================
INSERT INTO sale (sale_id, sale_date, customer_id, sale_description, total_amount, user_id) VALUES
  ( 1, '2026-01-06', 1,  NULL,                                       152.50,  3),
  ( 2, '2026-01-07', 2,  NULL,                                       280.00,  4),
  ( 3, '2026-01-08', NULL, NULL,                                      67.50,  3),
  ( 4, '2026-01-09', 3,  'Rx: Amoxicillin 500mg for URTI',          312.00,  4),
  ( 5, '2026-01-10', 4,  NULL,                                       189.00,  3),
  ( 6, '2026-01-12', 5,  NULL,                                       438.00,  4),
  ( 7, '2026-01-13', NULL, NULL,                                      55.00,  3),
  ( 8, '2026-01-14', 6,  NULL,                                       136.00,  4),
  ( 9, '2026-01-15', 7,  'Rx: Azithromycin for bronchitis',         330.00,  3),
  (10, '2026-01-17', 8,  NULL,                                       215.00,  4),
  (11, '2026-01-19', 9,  NULL,                                       112.00,  3),
  (12, '2026-01-21', 10, 'Rx: Insulin + supplies for DM2',         2030.00,  4),
  (13, '2026-01-22', NULL, NULL,                                      48.00,  3),
  (14, '2026-01-24', 11, NULL,                                       176.00,  4),
  (15, '2026-01-27', 1,  NULL,                                        96.00,  3),
  (16, '2026-01-28', 12, NULL,                                       374.50,  4),
  (17, '2026-01-29', 2,  NULL,                                        84.00,  3),
  (18, '2026-01-30', 13, 'Rx: Losartan + Atorvastatin',             360.00,  4),
  (19, '2026-02-02', NULL, NULL,                                      73.00,  3),
  (20, '2026-02-03', 3,  NULL,                                       158.00,  4),
  (21, '2026-02-05', 14, NULL,                                       1200.00, 3),
  (22, '2026-02-06', 4,  NULL,                                       219.50,  4),
  (23, '2026-02-08', 5,  'Rx: Ciprofloxacin for UTI',               270.00,  3),
  (24, '2026-02-10', NULL, NULL,                                      44.00,  4),
  (25, '2026-02-11', 6,  NULL,                                       462.00,  3),
  (26, '2026-02-13', 7,  NULL,                                       148.50,  4),
  (27, '2026-02-14', 15, 'Rx: Insulin refill',                     1785.00,  3),
  (28, '2026-02-17', 8,  NULL,                                        92.00,  4),
  (29, '2026-02-18', 9,  NULL,                                       344.00,  3),
  (30, '2026-02-20', NULL, NULL,                                      61.50,  4),
  (31, '2026-02-21', 10, NULL,                                       285.00,  3),
  (32, '2026-02-24', 11, NULL,                                       196.00,  4),
  (33, '2026-02-25', 1,  NULL,                                       128.00,  3),
  (34, '2026-02-26', 12, NULL,                                       560.00,  4),
  (35, '2026-02-27', 2,  'Rx: Co-Amoxiclav for LRTI',               342.00,  3),
  (36, '2026-02-28', 13, NULL,                                       174.00,  4),
  (37, '2026-03-02', NULL, NULL,                                      53.00,  3),
  (38, '2026-03-03', 14, NULL,                                       415.00,  4),
  (39, '2026-03-04', 3,  NULL,                                       237.50,  3),
  (40, '2026-03-05', 4,  NULL,                                        88.00,  4),
  (41, '2026-03-06', 5,  'Rx: Metformin + Glibenclamide for DM2',   208.00,  3),
  (42, '2026-03-07', NULL, NULL,                                     105.00,  4),
  (43, '2026-03-08', 6,  NULL,                                       392.00,  3),
  (44, '2026-03-09', 7,  NULL,                                       163.50,  4),
  (45, '2026-03-10', 15, 'Rx: Amlodipine + Enalapril for HTN',      230.00,  3),
  (46, '2026-03-11', 8,  NULL,                                       685.00,  4),
  (47, '2026-03-11', NULL, NULL,                                      42.00,  3),
  (48, '2026-03-12', 9,  NULL,                                       276.00,  4),
  (49, '2026-03-12', 10, NULL,                                       358.00,  3),
  (50, '2026-03-13', 1,  NULL,                                       194.00,  4);

SELECT setval('sale_sale_id_seq', 50);

INSERT INTO sales_details (sale_id, product_id, quantity, unit_price) VALUES
  -- Sale 1: Jan 6
  ( 1,  1, 10, 5.00),   ( 1, 31,  5, 6.00),   ( 1, 23,  5, 8.00),   ( 1, 32,  3, 8.00),
  -- Sale 2: Jan 7
  ( 2, 22,  1,280.00),
  -- Sale 3: Jan 8
  ( 3,  1,  5, 5.00),   ( 3, 28,  5, 6.00),   ( 3, 29,  3,10.00),   ( 3, 30,  3, 5.00),  ( 3,  5,  2, 6.50),
  -- Sale 4: Jan 9
  ( 4,  6, 26, 12.00),
  -- Sale 5: Jan 10
  ( 5, 31, 10,  6.00),  ( 5, 32,  5,  8.00),  ( 5, 34,  5, 15.00),  ( 5, 35,  5,  7.00),
  -- Sale 6: Jan 12
  ( 6, 18,  1,850.00),  ( 6, 19,  1,380.00),  ( 6, 20, 17, 12.00),  ( 6, 16,  5,  8.00),
  -- Sale 7: Jan 13
  ( 7,  1,  5, 5.00),   ( 7, 35,  4,  7.00),
  -- Sale 8: Jan 14
  ( 8, 26,  5,14.00),   ( 8, 29,  5, 10.00),  ( 8, 27,  3,  9.00),  ( 8, 30,  4,  5.00),
  -- Sale 9: Jan 15
  ( 9,  7,  6, 55.00),
  -- Sale 10: Jan 17
  (10, 11,  5,  9.00),  (10, 12,  5, 14.00),  (10, 15,  5, 11.00),  (10, 26,  5, 14.00),
  -- Sale 11: Jan 19
  (11,  1, 10,  5.00),  (11, 31,  5,  6.00),  (11, 37,  5,  4.00),
  -- Sale 12: Jan 21
  (12, 18,  1,850.00),  (12, 19,  2,380.00),  (12, 20, 25, 12.00),  (12, 16, 10,  8.00),
  -- Sale 13: Jan 22
  (13,  1,  4,  5.00),  (13, 28,  3,  6.00),
  -- Sale 14: Jan 24
  (14, 13,  5, 22.00),  (14, 11,  5,  9.00),  (14, 14,  3, 18.00),
  -- Sale 15: Jan 27
  (15, 31,  8,  6.00),  (15, 36,  4,  9.50),
  -- Sale 16: Jan 28
  (16, 22,  1,280.00),  (16, 23, 10,  8.00),  (16, 21,  6,  4.50),  (16, 24,  5,  7.50),
  -- Sale 17: Jan 29
  (17,  1,  5,  5.00),  (17, 32,  4,  8.00),  (17, 35,  3,  7.00),
  -- Sale 18: Jan 30
  (18, 12, 15, 14.00),  (18, 13,  5, 22.00),  (18, 15,  5, 11.00),
  -- Sale 19: Feb 2
  (19,  1,  5,  5.00),  (19, 29,  4, 10.00),  (19, 28,  3,  6.00),
  -- Sale 20: Feb 3
  (20, 26,  5, 14.00),  (20, 27,  5,  9.00),  (20, 30,  5,  5.00),  (20, 29,  4, 10.00),
  -- Sale 21: Feb 5
  (21, 48,  1,1200.00),
  -- Sale 22: Feb 6
  (22, 31, 10,  6.00),  (22, 32,  5,  8.00),  (22, 33,  5, 12.00),  (22, 34,  3, 15.00),  (22, 38,  3, 18.00),
  -- Sale 23: Feb 8
  (23,  8, 15, 18.00),
  -- Sale 24: Feb 10
  (24,  1,  4,  5.00),  (24, 37,  4,  4.00),
  -- Sale 25: Feb 11
  (25, 18,  1,850.00),  (25, 19,  1,380.00),  (25, 20, 20, 12.00),  (25, 16,  5,  8.00),
  -- Sale 26: Feb 13
  (26, 23,  8,  8.00),  (26, 24,  5,  7.50),  (26, 25,  3, 32.00),
  -- Sale 27: Feb 14
  (27, 18,  1,850.00),  (27, 19,  2,380.00),  (27, 20, 25, 12.00),  (27, 16,  5,  8.00),
  -- Sale 28: Feb 17
  (28,  1,  8,  5.00),  (28, 31,  5,  6.00),  (28, 37,  3,  4.00),
  -- Sale 29: Feb 18
  (29, 11, 10,  9.00),  (29, 12, 10, 14.00),  (29, 13,  5, 22.00),
  -- Sale 30: Feb 20
  (30,  1,  5,  5.00),  (30, 35,  3,  7.00),  (30, 36,  3,  9.50),
  -- Sale 31: Feb 21
  (31, 26,  5, 14.00),  (31, 27,  5,  9.00),  (31, 28,  5,  6.00),  (31, 29,  5, 10.00),
  -- Sale 32: Feb 24
  (32, 31, 10,  6.00),  (32, 32,  5,  8.00),  (32, 34,  5, 15.00),  (32, 33,  5, 12.00),
  -- Sale 33: Feb 25
  (33,  5, 10,  6.50),  (33,  1,  5,  5.00),  (33, 23,  5,  8.00),
  -- Sale 34: Feb 26
  (34, 22,  2,280.00),
  -- Sale 35: Feb 27
  (35, 10,  9, 38.00),
  -- Sale 36: Feb 28
  (36, 13,  5, 22.00),  (36, 15,  5, 11.00),  (36, 14,  3, 18.00),
  -- Sale 37: Mar 2
  (37,  1,  5,  5.00),  (37, 28,  4,  6.00),
  -- Sale 38: Mar 3
  (38, 18,  1,850.00),  (38, 19,  1,380.00),  (38, 20, 15, 12.00),  (38, 16,  5,  8.00),
  -- Sale 39: Mar 4
  (39, 26,  5, 14.00),  (39, 27,  5,  9.00),  (39, 29,  5, 10.00),  (39, 30,  5,  5.00),
  -- Sale 40: Mar 5
  (40,  1,  8,  5.00),  (40, 36,  4,  9.50),
  -- Sale 41: Mar 6
  (41, 16, 16,  8.00),  (41, 17,  8,  6.50),
  -- Sale 42: Mar 7
  (42, 31,  5,  6.00),  (42, 32,  5,  8.00),  (42, 35,  5,  7.00),
  -- Sale 43: Mar 8
  (43, 11, 10,  9.00),  (43, 12, 10, 14.00),  (43, 13,  5, 22.00),  (43, 15,  5, 11.00),
  -- Sale 44: Mar 9
  (44, 23,  8,  8.00),  (44, 24,  5,  7.50),  (44, 25,  3, 32.00),
  -- Sale 45: Mar 10
  (45, 11, 10,  9.00),  (45, 15, 10, 11.00),
  -- Sale 46: Mar 11
  (46, 22,  1,280.00),  (46, 19,  1,380.00),  (46, 18,  1,850.00),  (46, 20, 15, 12.00),
  -- Sale 47: Mar 11
  (47,  1,  5,  5.00),  (47, 37,  4,  4.00),  (47, 35,  2,  7.00),
  -- Sale 48: Mar 12
  (48, 26,  5, 14.00),  (48, 29,  5, 10.00),  (48, 28,  5,  6.00),  (48, 27,  5,  9.00),
  -- Sale 49: Mar 12
  (49, 13,  5, 22.00),  (49, 14,  5, 18.00),  (49, 12,  5, 14.00),
  -- Sale 50: Mar 13
  (50, 31, 10,  6.00),  (50, 32,  5,  8.00),  (50, 36,  5,  9.50);

SELECT setval('sales_details_sales_detail_id_seq', (SELECT MAX(sales_detail_id) FROM sales_details));

-- ============================================================
-- STEP 4: STOCK OUT EVENTS
-- ============================================================
INSERT INTO stock_out (stock_out_id, stock_out_date, employee_id, user_id, total) VALUES
  (1, '2026-01-31', 2, 2, 0.00),
  (2, '2026-02-28', 5, 5, 0.00),
  (3, '2026-03-10', 2, 2, 0.00);

SELECT setval('stock_out_stock_out_id_seq', 3);

INSERT INTO stock_out_details (stock_out_id, product_id, quantity, description) VALUES
  (1,  4,  10, 'expired'),    -- Aspirin near-expiry batch
  (1, 19,   5, 'expired'),    -- Glucometer strips near expiry
  (1, 27,   8, 'damaged'),    -- Ranitidine damaged during storage
  (2, 10,   6, 'expired'),    -- Co-Amoxiclav near-expiry batch
  (2,  9,   4, 'damaged'),    -- Clarithromycin damaged
  (2,  5,  10, 'expired'),    -- Biogesic expired batch
  (3, 33,  10, 'damaged'),    -- Vit E damaged (dropped)
  (3, 22,   2, 'damaged'),    -- Salbutamol inhaler damaged
  (3,  8,   5, 'expired');    -- Ciprofloxacin expired batch

-- ============================================================
-- STEP 5: PRODUCT RETURNS
-- ============================================================
INSERT INTO return_of_products (return_product_id, return_date, return_type, reason, verified_by_employee_id, sale_id, customer_name, user_id) VALUES
  (1, '2026-01-16', 'Defective',  'Capsules were clumped together, unusable',          2,  4, 'Eduardo Jose Ramos',    3),
  (2, '2026-02-09', 'Wrong Item', 'Dispensed 500mg instead of prescribed 250mg',       5, 23, 'Fernando Cruz Dela Rosa',4),
  (3, '2026-02-22', 'Resellable', 'Patient bought excess units, unopened, within date', 2, 25, NULL,                    3),
  (4, '2026-03-07', 'Defective',  'Inhaler released no mist, defective valve',         5, 34, 'Rosa Linda Mendoza',    4),
  (5, '2026-03-11', 'Expired',    'Customer discovered expired date at home',           2, 35, 'Pedro Marcos Aguinaldo',3);

SELECT setval('return_of_products_return_product_id_seq', 5);

INSERT INTO return_details (return_id, product_id, quantity) VALUES
  (1,  6,  5),
  (2,  8,  5),
  (3, 18,  1),   (3, 19,  1),
  (4, 22,  2),
  (5, 10,  2);

SELECT setval('return_details_return_details_id_seq', (SELECT MAX(return_details_id) FROM return_details));

-- ============================================================
-- STEP 6: SET ACCURATE INVENTORY QUANTITIES
-- Total received via supply minus total sold minus stock-outs
-- plus resellable returns added back
-- ============================================================
INSERT INTO product_expirationdate (batch_code, product_id, quantity, expirationdate) VALUES

  -- Product 1: Paracetamol 500mg
  -- Supplied: 1000+500+500 = 2000 | Sold: ~93 | StockOut: 0
  ('LOT-PAR-2026A', 1, 450, '2027-06-30'),
  ('LOT-PAR-2026B', 1, 750, '2027-12-31'),
  ('LOT-PAR-2027A', 1, 650, '2028-06-30'),

  -- Product 2: Mefenamic Acid
  -- Supplied: 300+200=500 | Sold: ~3
  ('LOT-MEF-2026A', 2, 497, '2027-03-31'),

  -- Product 3: Ibuprofen
  -- Supplied: 300+200=500 | Sold: 0
  ('LOT-IBU-2026A', 3, 500, '2027-08-31'),

  -- Product 4: Aspirin 80mg
  -- Supplied: 500+300=800 | StockOut: 10 | Sold: 0
  ('LOT-ASP-2025X', 4,  20, '2026-04-30'),   -- expiring very soon!
  ('LOT-ASP-2026A', 4, 480, '2027-09-30'),
  ('LOT-ASP-2027A', 4, 290, '2028-03-31'),

  -- Product 5: Biogesic
  -- Supplied: 400+300+400=1100 | StockOut: 10 | Sold: ~10
  ('LOT-BIO-2025X', 5,  15, '2026-05-15'),   -- expiring soon!
  ('LOT-BIO-2026A', 5, 580, '2027-04-30'),
  ('LOT-BIO-2026B', 5, 485, '2027-10-31'),

  -- Product 6: Amoxicillin 500mg
  -- Supplied: 300+200+300=800 | Sold: 26+5=31 | Return: -5 (defective)
  ('LOT-AMX-2026A', 6, 400, '2026-11-30'),
  ('LOT-AMX-2026B', 6, 364, '2027-05-31'),

  -- Product 7: Azithromycin 500mg
  -- Supplied: 120+80=200 | Sold: 6
  ('LOT-AZI-2026A', 7, 194, '2027-01-31'),

  -- Product 8: Ciprofloxacin 500mg
  -- Supplied: 150+100=250 | Sold: 15 | StockOut: 5 | Return: 5 (wrong, goes back)
  ('LOT-CIP-2026A', 8, 235, '2026-10-31'),

  -- Product 9: Clarithromycin 500mg
  -- Supplied: 80+60=140 | StockOut: 4
  ('LOT-CLA-2026A', 9, 136, '2027-05-31'),

  -- Product 10: Co-Amoxiclav 625mg
  -- Supplied: 100+80=180 | Sold: 9+2=11 | StockOut: 6 | Return: 2 (expired back out)
  ('LOT-COA-2025X',10,  12, '2026-04-15'),   -- expiring soon!
  ('LOT-COA-2026A',10, 149, '2027-02-28'),

  -- Product 11: Amlodipine 5mg
  -- Supplied: 200+150=350 | Sold: 5+5+10+10=30
  ('LOT-AML-2026A',11, 320, '2027-07-31'),

  -- Product 12: Losartan 50mg
  -- Supplied: 200+150=350 | Sold: 15+5+10+10+5=45
  ('LOT-LOS-2026A',12, 305, '2027-06-30'),

  -- Product 13: Atorvastatin 20mg
  -- Supplied: 150+100=250 | Sold: 5+5+5+5+5=25
  ('LOT-ATO-2026A',13, 225, '2027-03-31'),

  -- Product 14: Metoprolol 50mg
  -- Supplied: 120+100=220 | Sold: 3+3+3+5=14
  ('LOT-MET-2026A',14, 206, '2026-12-31'),

  -- Product 15: Enalapril 10mg
  -- Supplied: 120+100=220 | Sold: 5+5+5+10+10=35
  ('LOT-ENA-2026A',15, 185, '2027-02-28'),

  -- Product 16: Metformin 500mg
  -- Supplied: 250+200+200=650 | Sold: 5+10+5+5+5+16=46
  ('LOT-MFM-2026A',16, 604, '2027-08-31'),

  -- Product 17: Glibenclamide 5mg
  -- Supplied: 150+150=300 | Sold: 8
  ('LOT-GLI-2026A',17, 292, '2027-04-30'),

  -- Product 18: Insulin Glargine
  -- Supplied: 20+15+15=50 | Sold: 1+1+1+1+1+1=6 | Return: 1 (resellable)
  ('LOT-INS-2026A',18,  12, '2026-07-31'),
  ('LOT-INS-2026B',18,  13, '2026-09-30'),
  ('LOT-INS-2027A',18,  20, '2027-03-31'),

  -- Product 19: Glucometer Test Strips
  -- Supplied: 50+40=90 | Sold: 1+2+1+2+1+1=8 | StockOut: 5 | Return: 1 (resellable)
  ('LOT-GLS-2025X',19,  10, '2026-04-30'),   -- expiring soon!
  ('LOT-GLS-2026A',19,  68, '2026-10-31'),

  -- Product 20: Insulin Syringe 1mL
  -- Supplied: 200+150=350 | Sold: 17+25+20+25+15+15=117
  ('LOT-ISY-2026A',20, 233, '2028-01-31'),

  -- Product 21: Salbutamol 2mg tablet
  -- Supplied: 200+150=350 | Sold: 6
  ('LOT-SAL-2026A',21, 344, '2027-09-30'),

  -- Product 22: Salbutamol Inhaler
  -- Supplied: 30+20=50 | Sold: 1+1+2+1+1=6 | StockOut: 2 | Return: 2 (defective)
  ('LOT-SAI-2026A',22,  44, '2026-11-30'),

  -- Product 23: Cetirizine 10mg
  -- Supplied: 300+200=500 | Sold: 5+10+8+5+8=36
  ('LOT-CET-2026A',23, 464, '2027-05-31'),

  -- Product 24: Loratadine 10mg
  -- Supplied: 250+200=450 | Sold: 5+5+5=15
  ('LOT-LOR-2026A',24, 435, '2027-06-30'),

  -- Product 25: Montelukast 10mg
  -- Supplied: 80+60=140 | Sold: 3+3+3=9
  ('LOT-MON-2026A',25, 131, '2027-01-31'),

  -- Product 26: Omeprazole 20mg
  -- Supplied: 200+150+150=500 | Sold: 5+5+5+5+5+5=30
  ('LOT-OMP-2026A',26, 470, '2027-03-31'),

  -- Product 27: Ranitidine 150mg
  -- Supplied: 150+100=250 | Sold: 3+5+5+5+5=23 | StockOut: 8
  ('LOT-RAN-2026A',27, 219, '2026-10-31'),

  -- Product 28: Loperamide 2mg
  -- Supplied: 250+200=450 | Sold: 5+3+4+5+5+4+5=31
  ('LOT-LOP-2026A',28, 419, '2027-07-31'),

  -- Product 29: Domperidone 10mg
  -- Supplied: 180+150=330 | Sold: 3+5+4+5+5+5=27
  ('LOT-DOM-2026A',29, 303, '2027-04-30'),

  -- Product 30: Bisacodyl 5mg
  -- Supplied: 150+150=300 | Sold: 3+4+5+5+5=22
  ('LOT-BIS-2026A',30, 278, '2027-08-31'),

  -- Product 31: Vitamin C 500mg
  -- Supplied: 1000+500+500=2000 | Sold: 5+10+5+8+5+10+5+10+5+10=73
  ('LOT-VIC-2026A',31, 650, '2027-12-31'),
  ('LOT-VIC-2026B',31, 700, '2028-06-30'),
  ('LOT-VIC-2027A',31, 577, '2028-12-31'),

  -- Product 32: Vitamin B Complex
  -- Supplied: 600+400+400=1400 | Sold: 3+5+4+5+5+5+5+5=37
  ('LOT-VIB-2026A',32, 663, '2027-11-30'),
  ('LOT-VIB-2026B',32, 700, '2028-05-31'),

  -- Product 33: Vitamin E
  -- Supplied: 200+150=350 | Sold: 5+5=10 | StockOut: 10
  ('LOT-VIE-2026A',33, 330, '2027-09-30'),

  -- Product 34: Calcium + Vitamin D3
  -- Supplied: 200+150=350 | Sold: 5+3+5=13
  ('LOT-CAL-2026A',34, 337, '2027-10-31'),

  -- Product 35: Ferrous Sulfate
  -- Supplied: 300+200=500 | Sold: 5+3+4+3+2+5=22
  ('LOT-FER-2026A',35, 478, '2027-06-30'),

  -- Product 36: Zinc 50mg
  -- Supplied: 250+200+200=650 | Sold: 4+3+3+4+5+5=24
  ('LOT-ZIN-2026A',36, 626, '2027-07-31'),

  -- Product 37: Folic Acid
  -- Supplied: 300+200+300=800 | Sold: 5+3+3+4+4=19
  ('LOT-FOL-2026A',37, 781, '2027-08-31'),

  -- Product 38: Fish Oil 1000mg
  -- Supplied: 100+80=180 | Sold: 3
  ('LOT-FSH-2026A',38, 177, '2027-05-31'),

  -- Product 39: Betadine
  ('LOT-BET-2026A',39,  60, '2026-12-31'),

  -- Product 40: Hydrogen Peroxide
  ('LOT-H2O-2026A',40,  60, '2026-11-30'),

  -- Product 41: Alcohol 70%
  ('LOT-ALC-2026A',41, 140, '2026-10-31'),

  -- Product 42: Cotton Balls
  ('LOT-COT-2026A',42,  90, '2027-03-31'),

  -- Product 43: Band-Aid
  ('LOT-BND-2026A',43,  70, '2027-06-30'),

  -- Product 44: Gauze Pad
  ('LOT-GAU-2026A',44, 250, '2027-09-30'),

  -- Product 45: Surgical Gloves
  ('LOT-GLV-2026A',45,  60, '2027-12-31'),

  -- Product 46: Disposable Syringe
  ('LOT-DSY-2026A',46, 320, '2028-01-31'),

  -- Product 47: Digital Thermometer (no expiry)
  ('LOT-THM-2026A',47,  15, NULL),

  -- Product 48: Blood Pressure Monitor (no expiry)
  -- Supplied: 8 | Sold: 1
  ('LOT-BPM-2026A',48,   7, NULL),

  -- Product 49: Nebulizer Machine (no expiry)
  -- Supplied: 4
  ('LOT-NEB-2026A',49,   4, NULL);

-- ============================================================
-- VERIFY: Quick summary after seeding
-- ============================================================
SELECT 'Supplies' as entity, COUNT(*) as total FROM supply
UNION ALL SELECT 'Sales', COUNT(*) FROM sale
UNION ALL SELECT 'Products with stock', COUNT(*) FROM inventory_view WHERE current_stock > 0
UNION ALL SELECT 'Low stock items', COUNT(*) FROM inventory_view WHERE current_stock <= reorder_level AND current_stock > 0
UNION ALL SELECT 'Out of stock', COUNT(*) FROM inventory_view WHERE current_stock = 0
UNION ALL SELECT 'Expiring in 90 days', COUNT(*) FROM expiring_products_view WHERE days_until_expiry <= 90
UNION ALL SELECT 'Stock out events', COUNT(*) FROM stock_out
UNION ALL SELECT 'Returns', COUNT(*) FROM return_of_products;
