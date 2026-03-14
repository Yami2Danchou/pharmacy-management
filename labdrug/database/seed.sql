-- ============================================================
-- LABDRUG PHARMACY - Complete Seed Data
-- Run this in your Neon SQL Editor AFTER schema.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO category (category_name, description) VALUES
  ('Prescription Drugs', 'Medicines requiring a valid doctor prescription'),
  ('Over-the-Counter', 'Medicines available without prescription'),
  ('Vitamins & Supplements', 'Nutritional supplements, vitamins, and minerals'),
  ('Personal Care', 'Hygiene, skincare, and personal care products'),
  ('Medical Supplies', 'Medical equipment, devices, and supplies'),
  ('Antibiotics', 'Antibiotic medicines requiring prescription'),
  ('Cardiovascular', 'Heart and blood pressure medications'),
  ('Diabetes Care', 'Insulin, glucometers, and diabetic supplies'),
  ('Respiratory', 'Asthma, cough, and respiratory medications'),
  ('Gastrointestinal', 'Antacids, laxatives, and digestive medicines')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BRANDS
-- ============================================================
INSERT INTO brand (brand_name, description) VALUES
  ('Generic', 'Generic pharmaceutical products'),
  ('Unilab', 'United Laboratories Inc. — leading Philippine pharma'),
  ('GlaxoSmithKline', 'GSK pharmaceutical products'),
  ('Pfizer', 'Pfizer Inc. pharmaceutical products'),
  ('Novartis', 'Novartis AG pharmaceutical products'),
  ('Roche', 'Roche pharmaceutical products'),
  ('Abbott', 'Abbott Laboratories products'),
  ('Sanofi', 'Sanofi pharmaceutical products'),
  ('Johnson & Johnson', 'Johnson & Johnson consumer health products'),
  ('Bayer', 'Bayer AG pharmaceutical products'),
  ('Astellas', 'Astellas Pharma pharmaceutical products'),
  ('Boehringer Ingelheim', 'Boehringer Ingelheim pharmaceutical products'),
  ('Actavis', 'Actavis generic pharmaceutical products'),
  ('Natrapharm', 'Natrapharm Inc. Philippine pharmaceutical products'),
  ('Interphil', 'Interphil Laboratories pharmaceutical products')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUPPLIERS
-- ============================================================
INSERT INTO supplier (supplier_name, contact_person, contact_number, address) VALUES
  ('Unilab Direct Sales', 'Maria Santos', '09171234567', 'UNILAB Bldg., 66 United St., Mandaluyong City, Metro Manila'),
  ('Zuellig Pharma Philippines', 'Jose Reyes', '09281234567', 'Zuellig Pharma Bldg., Km 14 South Super Highway, Paranaque City'),
  ('Mediline Pharma Corp.', 'Ana Dela Cruz', '09391234567', 'Mediline Bldg., 123 Shaw Blvd., Mandaluyong City'),
  ('PhilCare Medical Supplies', 'Roberto Tan', '09501234567', '456 Quezon Ave., Quezon City, Metro Manila'),
  ('SouthMed Distributors', 'Liza Gonzales', '09201234567', 'Blk 5 Lot 3, National Highway, General Santos City'),
  ('AllMeds Wholesale', 'Carlos Bautista', '09321234567', '789 Magsaysay Ave., Davao City'),
  ('MedPrime Distributors', 'Elena Villanueva', '09431234567', '12 Rizal St., Cotabato City, BARMM'),
  ('RxDirect Inc.', 'Fernando Cruz', '09561234567', '34 JP Laurel Ave., Davao City')
ON CONFLICT DO NOTHING;

-- ============================================================
-- EMPLOYEES
-- ============================================================
INSERT INTO employee (employee_name, employee_gender, employee_age, employee_address, employee_contacts) VALUES
  ('System Administrator', 'N/A', 0, 'Labdrug Pharmacy, Isulan', '09000000000'),
  ('Maria Luz Espinosa', 'Female', 34, 'Purok 3, Brgy. Kolumbio, Isulan, Sultan Kudarat', '09171112233'),
  ('Juan Carlo Reyes', 'Male', 28, 'Purok 1, Brgy. Kalawag I, Isulan, Sultan Kudarat', '09282223344'),
  ('Ana Grace Villanueva', 'Female', 31, 'Purok 5, Brgy. Kalawag II, Isulan, Sultan Kudarat', '09393334455'),
  ('Roberto Miguel Santos', 'Male', 45, 'Purok 7, Brgy. Poblacion, Isulan, Sultan Kudarat', '09504445566'),
  ('Liza Marie Dela Cruz', 'Female', 26, 'Purok 2, Brgy. Kenram, Isulan, Sultan Kudarat', '09615556677'),
  ('Mark Anthony Bautista', 'Male', 38, 'Purok 4, Brgy. Sampao, Isulan, Sultan Kudarat', '09726667788'),
  ('Jenny Rose Gomez', 'Female', 23, 'Purok 6, Brgy. Tayugo, Isulan, Sultan Kudarat', '09837778899')
ON CONFLICT DO NOTHING;

-- ============================================================
-- USERS (passwords are all 'password123' hashed with bcrypt)
-- Admin: admin / admin123
-- Others: password123
-- ============================================================
INSERT INTO users (username, password_hash, role, employee_id, is_active) VALUES
  ('admin',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin',   1, TRUE),
  ('maria.espinosa',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager', 2, TRUE),
  ('juan.reyes',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cashier', 3, TRUE),
  ('ana.villanueva',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cashier', 4, TRUE),
  ('roberto.santos',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager', 5, TRUE),
  ('liza.delacruz',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cashier', 6, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CUSTOMERS
-- ============================================================
INSERT INTO customer (customer_name, birth_date, gender, contacts, address) VALUES
  ('Pedro Marcos Aguinaldo', '1975-03-15', 'Male',   '09171001001', 'Purok 1, Brgy. Kalawag I, Isulan, Sultan Kudarat'),
  ('Rosa Linda Mendoza',     '1988-07-22', 'Female', '09282002002', 'Purok 3, Brgy. Kolumbio, Isulan, Sultan Kudarat'),
  ('Eduardo Jose Ramos',     '1960-11-05', 'Male',   '09393003003', 'Purok 5, Brgy. Poblacion, Isulan, Sultan Kudarat'),
  ('Carmen Luz Torres',      '1995-01-30', 'Female', '09504004004', 'Purok 2, Brgy. Kenram, Isulan, Sultan Kudarat'),
  ('Fernando Cruz Dela Rosa','1982-09-18', 'Male',   '09615005005', 'Purok 4, Brgy. Sampao, Isulan, Sultan Kudarat'),
  ('Maricel Santos Reyes',   '1970-04-12', 'Female', '09726006006', 'Purok 6, Brgy. Tayugo, Isulan, Sultan Kudarat'),
  ('Andres Bonifacio Lim',   '1991-12-25', 'Male',   '09837007007', 'Purok 8, Brgy. Kalawag III, Isulan, Sultan Kudarat'),
  ('Gloria May Pascual',     '1965-06-08', 'Female', '09948008008', 'Purok 1, Brgy. Buenaflor, Isulan, Sultan Kudarat'),
  ('Ramon Alva Soriano',     '1978-02-14', 'Male',   '09159009009', 'Purok 7, Brgy. Bambad, Isulan, Sultan Kudarat'),
  ('Teresita Abad Santos',   '1955-08-20', 'Female', '09260010010', 'Purok 3, Brgy. Bual Norte, Isulan, Sultan Kudarat'),
  ('Miguel Lorenzo Flores',  '2000-05-17', 'Male',   '09371011011', 'Purok 9, Brgy. Kalawag I, Isulan, Sultan Kudarat'),
  ('Juana Batista Navarro',  '1948-10-03', 'Female', '09482012012', 'Purok 2, Brgy. Poblacion, Isulan, Sultan Kudarat'),
  ('Ernesto Dizon Garcia',   '1972-07-29', 'Male',   '09593013013', 'Purok 5, Brgy. Kolumbio, Isulan, Sultan Kudarat'),
  ('Rosario Felipe Castillo','1985-03-11', 'Female', '09604014014', 'Purok 4, Brgy. Kenram, Isulan, Sultan Kudarat'),
  ('Antonio Jacinto Morales','1968-11-19', 'Male',   '09715015015', 'Purok 6, Brgy. Sampao, Isulan, Sultan Kudarat')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO product (product_name, unit, price, category_id, description, brand_id, reorder_level) VALUES
  -- OTC Pain / Fever
  ('Paracetamol 500mg',           'tablet',  5.00,  2, 'Analgesic and antipyretic tablet',                   1,  100),
  ('Mefenamic Acid 500mg',        'capsule', 8.50,  2, 'NSAID for pain relief',                              2,   80),
  ('Ibuprofen 400mg',             'tablet',  7.00,  2, 'Anti-inflammatory and analgesic',                    1,   80),
  ('Aspirin 80mg',                'tablet',  3.50,  2, 'Low-dose aspirin for cardiovascular prevention',     10,  60),
  ('Biogesic 500mg',              'tablet',  6.50,  2, 'Paracetamol brand by Unilab',                        2,   80),

  -- Antibiotics (Prescription)
  ('Amoxicillin 500mg',           'capsule', 12.00, 6, 'Broad-spectrum penicillin antibiotic',               1,   60),
  ('Azithromycin 500mg',          'tablet',  55.00, 6, 'Macrolide antibiotic for respiratory infections',    4,   40),
  ('Ciprofloxacin 500mg',         'tablet',  18.00, 6, 'Fluoroquinolone antibiotic',                         1,   40),
  ('Clarithromycin 500mg',        'tablet',  45.00, 6, 'Macrolide antibiotic, H. pylori treatment',          5,   30),
  ('Co-Amoxiclav 625mg',          'tablet',  38.00, 6, 'Amoxicillin + clavulanic acid combination',          3,   30),

  -- Cardiovascular
  ('Amlodipine 5mg',              'tablet',  9.00,  7, 'Calcium channel blocker for hypertension',           1,   60),
  ('Losartan 50mg',               'tablet',  14.00, 7, 'ARB for hypertension and heart failure',             1,   60),
  ('Atorvastatin 20mg',           'tablet',  22.00, 7, 'Statin for cholesterol management',                  4,   50),
  ('Metoprolol 50mg',             'tablet',  18.00, 7, 'Beta-blocker for hypertension and angina',           5,   40),
  ('Enalapril 10mg',              'tablet',  11.00, 7, 'ACE inhibitor for hypertension',                     1,   40),

  -- Diabetes
  ('Metformin 500mg',             'tablet',  8.00,  8, 'First-line oral antidiabetic medication',            1,   60),
  ('Glibenclamide 5mg',           'tablet',  6.50,  8, 'Sulfonylurea for type 2 diabetes',                   1,   40),
  ('Insulin Glargine 100IU/mL',   'vial',    850.00,8, 'Long-acting insulin analogue',                       8,   10),
  ('Glucometer Test Strips',      'box',     380.00,8, '50 strips per box for blood glucose monitoring',     7,   15),
  ('Insulin Syringe 1mL',         'piece',   12.00, 8, '1mL insulin syringe with needle',                    9,   50),

  -- Respiratory
  ('Salbutamol 2mg',              'tablet',  4.50,  9, 'Bronchodilator for asthma relief',                   1,   50),
  ('Salbutamol Inhaler 100mcg',   'bottle',  280.00,9, 'Metered-dose inhaler for acute asthma',              3,   15),
  ('Cetirizine 10mg',             'tablet',  8.00,  9, 'Antihistamine for allergic rhinitis',                1,   60),
  ('Loratadine 10mg',             'tablet',  7.50,  9, 'Non-drowsy antihistamine',                           2,   60),
  ('Montelukast 10mg',            'tablet',  32.00, 9, 'Leukotriene receptor antagonist for asthma',        4,   30),

  -- GI
  ('Omeprazole 20mg',             'capsule', 14.00,10, 'Proton pump inhibitor for GERD and ulcers',          1,   60),
  ('Ranitidine 150mg',            'tablet',  9.00, 10, 'H2 blocker for acid reflux',                         1,   50),
  ('Loperamide 2mg',              'capsule', 6.00, 10, 'Antidiarrheal medication',                           2,   60),
  ('Domperidone 10mg',            'tablet',  10.00,10, 'Antiemetic and prokinetic agent',                    2,   50),
  ('Bisacodyl 5mg',               'tablet',  5.00, 10, 'Stimulant laxative for constipation',                1,   40),

  -- Vitamins
  ('Vitamin C 500mg',             'tablet',  6.00,  3, 'Ascorbic acid immune support',                       2,  100),
  ('Vitamin B Complex',           'tablet',  8.00,  3, 'Complete B vitamin complex',                         2,  100),
  ('Vitamin E 400IU',             'capsule', 12.00, 3, 'Antioxidant vitamin E softgel',                      2,   60),
  ('Calcium + Vitamin D3 500mg',  'tablet',  15.00, 3, 'Bone health supplement',                             7,   60),
  ('Ferrous Sulfate 325mg',       'tablet',  7.00,  3, 'Iron supplement for anemia',                         1,   50),
  ('Zinc 50mg',                   'tablet',  9.50,  3, 'Zinc supplement for immunity',                       1,   50),
  ('Folic Acid 5mg',              'tablet',  4.00,  3, 'Folate supplement for pregnancy',                    1,   60),
  ('Fish Oil 1000mg',             'capsule', 18.00, 3, 'Omega-3 fatty acid supplement',                      9,   40),

  -- Personal Care
  ('Betadine Antiseptic 60mL',    'bottle',  95.00, 4, 'Povidone-iodine antiseptic solution',                9,   20),
  ('Hydrogen Peroxide 3% 250mL',  'bottle',  45.00, 4, 'Antiseptic wound cleanser',                         1,   20),
  ('Alcohol 70% Isopropyl 500mL', 'bottle',  85.00, 4, 'Isopropyl alcohol disinfectant',                    1,   25),
  ('Cotton Balls 100pcs',         'box',     35.00, 4, 'Sterile cotton balls for wound care',                9,   20),
  ('Band-Aid Assorted 20pcs',     'box',     55.00, 4, 'Adhesive bandage strips',                            9,   15),
  ('Gauze Pad Sterile 4x4',       'piece',   8.00,  5, 'Sterile gauze pad for wound dressing',               1,   40),

  -- Medical Supplies
  ('Surgical Gloves Medium',      'pair',    18.00, 5, 'Sterile latex surgical gloves size M',               1,   30),
  ('Disposable Syringe 5mL',      'piece',   8.00,  5, '5mL disposable syringe with needle',                 1,   50),
  ('Digital Thermometer',         'piece',   185.00,5, 'Digital oral/axillary thermometer',                  7,   10),
  ('Blood Pressure Monitor',      'piece',   1250.00,5,'Automatic digital blood pressure monitor',           7,    5),
  ('Nebulizer Machine',           'piece',   2500.00,5,'Compressor nebulizer for respiratory therapy',       7,    3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT EXPIRATION DATES (Batch Inventory)
-- ============================================================
INSERT INTO product_expirationdate (batch_code, product_id, quantity, expirationdate) VALUES
  -- Paracetamol 500mg (product_id=1)
  ('LOT-PAR-001', 1, 500, '2027-06-30'),
  ('LOT-PAR-002', 1, 300, '2026-12-31'),

  -- Mefenamic Acid (2)
  ('LOT-MEF-001', 2, 200, '2027-03-31'),

  -- Ibuprofen (3)
  ('LOT-IBU-001', 3, 250, '2027-08-31'),

  -- Aspirin 80mg (4)
  ('LOT-ASP-001', 4, 400, '2027-09-30'),
  ('LOT-ASP-002', 4,  50, '2026-05-31'),  -- expiring soon!

  -- Biogesic (5)
  ('LOT-BIO-001', 5, 300, '2027-04-30'),

  -- Amoxicillin (6)
  ('LOT-AMX-001', 6, 200, '2026-11-30'),
  ('LOT-AMX-002', 6, 100, '2027-02-28'),

  -- Azithromycin (7)
  ('LOT-AZI-001', 7,  80, '2027-01-31'),

  -- Ciprofloxacin (8)
  ('LOT-CIP-001', 8, 120, '2026-10-31'),

  -- Clarithromycin (9)
  ('LOT-CLA-001', 9,  60, '2027-05-31'),

  -- Co-Amoxiclav (10)
  ('LOT-COA-001',10,  90, '2026-09-30'),
  ('LOT-COA-002',10,  20, '2026-04-15'),  -- expiring soon!

  -- Amlodipine (11)
  ('LOT-AML-001',11, 180, '2027-07-31'),

  -- Losartan (12)
  ('LOT-LOS-001',12, 160, '2027-06-30'),

  -- Atorvastatin (13)
  ('LOT-ATO-001',13, 100, '2027-03-31'),

  -- Metoprolol (14)
  ('LOT-MET-001',14,  80, '2026-12-31'),

  -- Enalapril (15)
  ('LOT-ENA-001',15,  90, '2027-02-28'),

  -- Metformin (16)
  ('LOT-MFM-001',16, 200, '2027-08-31'),

  -- Glibenclamide (17)
  ('LOT-GLI-001',17, 120, '2027-04-30'),

  -- Insulin Glargine (18)
  ('LOT-INS-001',18,  15, '2026-07-31'),
  ('LOT-INS-002',18,  10, '2026-08-31'),

  -- Glucometer Strips (19)
  ('LOT-GLS-001',19,  30, '2026-06-30'),
  ('LOT-GLS-002',19,  20, '2026-04-30'),  -- expiring soon!

  -- Insulin Syringe (20)
  ('LOT-ISY-001',20, 100, '2028-01-31'),

  -- Salbutamol tablet (21)
  ('LOT-SAL-001',21, 150, '2027-09-30'),

  -- Salbutamol Inhaler (22)
  ('LOT-SAI-001',22,  25, '2026-11-30'),

  -- Cetirizine (23)
  ('LOT-CET-001',23, 200, '2027-05-31'),

  -- Loratadine (24)
  ('LOT-LOR-001',24, 180, '2027-06-30'),

  -- Montelukast (25)
  ('LOT-MON-001',25,  60, '2027-01-31'),

  -- Omeprazole (26)
  ('LOT-OMP-001',26, 150, '2027-03-31'),

  -- Ranitidine (27) -- intentionally low stock
  ('LOT-RAN-001',27,   8, '2026-10-31'),

  -- Loperamide (28)
  ('LOT-LOP-001',28, 200, '2027-07-31'),

  -- Domperidone (29)
  ('LOT-DOM-001',29, 120, '2027-04-30'),

  -- Bisacodyl (30)
  ('LOT-BIS-001',30, 100, '2027-08-31'),

  -- Vitamin C (31)
  ('LOT-VIC-001',31, 500, '2027-12-31'),

  -- Vitamin B Complex (32)
  ('LOT-VIB-001',32, 400, '2027-11-30'),

  -- Vitamin E (33)
  ('LOT-VIE-001',33, 150, '2027-09-30'),

  -- Calcium + D3 (34)
  ('LOT-CAL-001',34, 120, '2027-10-31'),

  -- Ferrous Sulfate (35)
  ('LOT-FER-001',35, 180, '2027-06-30'),

  -- Zinc (36)
  ('LOT-ZIN-001',36, 150, '2027-07-31'),

  -- Folic Acid (37)
  ('LOT-FOL-001',37, 200, '2027-08-31'),

  -- Fish Oil (38)
  ('LOT-FSH-001',38,  80, '2027-05-31'),

  -- Betadine (39)
  ('LOT-BET-001',39,  35, '2026-12-31'),

  -- Hydrogen Peroxide (40)
  ('LOT-H2O-001',40,  40, '2026-11-30'),

  -- Alcohol 70% (41)
  ('LOT-ALC-001',41,  50, '2026-10-31'),

  -- Cotton Balls (42)
  ('LOT-COT-001',42,  30, '2027-03-31'),

  -- Band-Aid (43)
  ('LOT-BND-001',43,  20, '2027-06-30'),

  -- Gauze Pad (44)
  ('LOT-GAU-001',44, 100, '2027-09-30'),

  -- Surgical Gloves (45)
  ('LOT-GLV-001',45,  40, '2027-12-31'),

  -- Disposable Syringe (46)
  ('LOT-DSY-001',46,  80, '2028-01-31'),

  -- Digital Thermometer (47) -- no expiry for devices
  ('LOT-THM-001',47,  12, NULL),

  -- BP Monitor (48)
  ('LOT-BPM-001',48,   6, NULL),

  -- Nebulizer (49)
  ('LOT-NEB-001',49,   3, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUPPLY DELIVERIES (past deliveries)
-- ============================================================
INSERT INTO supply (supply_date, supplier_id, employee_id, user_id, total_amount) VALUES
  ('2026-01-10', 1, 2, 2, 15200.00),
  ('2026-01-25', 2, 5, 5, 28750.00),
  ('2026-02-05', 3, 2, 2, 9800.00),
  ('2026-02-20', 1, 5, 5, 18500.00),
  ('2026-03-01', 6, 2, 2, 12300.00),
  ('2026-03-08', 2, 5, 5, 34100.00)
ON CONFLICT DO NOTHING;

INSERT INTO supply_details (supply_id, product_id, quantity, supply_amount, subtotal) VALUES
  -- Supply 1 (Jan 10)
  (1,  1, 500, 3.00,   1500.00),
  (1,  6, 200, 8.00,   1600.00),
  (1, 31, 500, 4.00,   2000.00),
  (1, 32, 400, 5.50,   2200.00),
  (1, 41,  50, 60.00,  3000.00),
  (1, 39,  35, 70.00,  2450.00),
  (1, 40,  40, 35.00,  1400.00),
  (1, 42,  30, 25.00,   750.00),
  (1, 43,  20, 40.00,   800.00),
  -- Supply 2 (Jan 25)
  (2, 18,  15, 700.00, 10500.00),
  (2, 19,  30, 300.00,  9000.00),
  (2, 48,   6, 950.00,  5700.00),
  (2, 49,   3,1850.00,  5550.00),
  -- Supply 3 (Feb 5)
  (3, 11, 180, 6.50,   1170.00),
  (3, 12, 160, 9.50,   1520.00),
  (3, 16, 200, 5.50,   1100.00),
  (3, 26, 150, 9.00,   1350.00),
  (3, 28, 200, 4.00,    800.00),
  (3, 21, 150, 3.00,    450.00),
  (3, 23, 200, 5.00,   1000.00),
  (3, 24, 180, 5.00,    900.00),
  (3, 35, 180, 5.00,    900.00),
  -- Supply 4 (Feb 20)
  (4,  7,  80, 40.00,  3200.00),
  (4, 13, 100, 16.00,  1600.00),
  (4, 14,  80, 13.00,  1040.00),
  (4, 25,  60, 22.00,  1320.00),
  (4, 22,  25, 210.00, 5250.00),
  (4, 34, 120, 10.00,  1200.00),
  (4, 38,  80, 13.00,  1040.00),
  (4, 33, 150,  8.00,  1200.00),
  (4, 36, 150,  6.50,   975.00),
  (4, 37, 200,  2.75,   550.00),
  -- Supply 5 (Mar 1)
  (5,  2, 200, 5.50,   1100.00),
  (5,  3, 250, 4.50,   1125.00),
  (5,  5, 300, 4.00,   1200.00),
  (5, 29, 120, 6.50,    780.00),
  (5, 30, 100, 3.50,    350.00),
  (5, 27,   8, 6.00,     48.00),
  (5, 44, 100, 5.50,    550.00),
  (5, 45,  40, 12.00,   480.00),
  (5, 46,  80, 5.50,    440.00),
  (5, 47,  12, 120.00, 1440.00),
  (5, 20, 100, 8.00,    800.00),
  -- Supply 6 (Mar 8)
  (6,  8, 120, 12.00,  1440.00),
  (6,  9,  60, 30.00,  1800.00),
  (6, 10,  90, 26.00,  2340.00),
  (6, 15,  90, 7.50,    675.00),
  (6, 17, 120, 4.50,    540.00),
  (6, 23, 200, 5.00,   1000.00),
  (6,  4, 400, 2.00,    800.00),
  (6, 32, 400, 5.50,   2200.00),
  (6,  1, 500, 3.00,   1500.00),
  (6, 31, 500, 4.00,   2000.00),
  (6, 29, 120, 6.50,    780.00),
  (6, 26, 150, 9.00,   1350.00),
  (6, 28, 200, 4.00,    800.00),
  (6, 35, 180, 5.00,    900.00),
  (6, 36, 150, 6.50,    975.00),
  (6, 37, 200, 2.75,    550.00),
  (6, 38,  80,13.00,   1040.00),
  (6, 46,  80, 5.50,    440.00),
  (6, 20, 100, 8.00,    800.00),
  (6, 42,  30,25.00,    750.00),
  (6, 43,  20,40.00,    800.00),
  (6, 44, 100, 5.50,    550.00),
  (6, 45,  40,12.00,    480.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SALES TRANSACTIONS (past 2 months)
-- ============================================================
INSERT INTO sale (sale_date, customer_id, sale_description, total_amount, user_id) VALUES
  ('2026-01-12', 1,  NULL,   85.00, 3),
  ('2026-01-13', 2,  NULL,  280.00, 4),
  ('2026-01-14', NULL, NULL,  42.50, 3),
  ('2026-01-15', 3,  NULL,  165.00, 4),
  ('2026-01-18', 4,  NULL,   72.00, 3),
  ('2026-01-20', 5,  'Rx: Amoxicillin for URTI', 168.00, 4),
  ('2026-01-22', NULL, NULL,  55.00, 3),
  ('2026-01-25', 6,  NULL,  430.00, 4),
  ('2026-01-28', 7,  NULL,   96.00, 3),
  ('2026-01-30', 8,  'Rx: Azithromycin for pneumonia', 330.00, 4),
  ('2026-02-02', 9,  NULL,  148.00, 3),
  ('2026-02-05', 10, NULL,  1200.00, 4),
  ('2026-02-07', 1,  NULL,   63.00, 3),
  ('2026-02-10', 11, NULL,  215.00, 4),
  ('2026-02-12', 2,  NULL,   88.50, 3),
  ('2026-02-14', 12, 'Rx: Insulin for DM2', 1785.00, 4),
  ('2026-02-17', 3,  NULL,  112.00, 3),
  ('2026-02-19', NULL, NULL,  35.00, 3),
  ('2026-02-21', 4,  NULL,  560.00, 4),
  ('2026-02-24', 13, NULL,   95.00, 3),
  ('2026-02-26', 5,  NULL,  248.00, 4),
  ('2026-02-28', 14, NULL,  178.00, 3),
  ('2026-03-03', 6,  NULL,  340.00, 4),
  ('2026-03-05', NULL, NULL, 156.00, 3),
  ('2026-03-07', 7,  NULL,   74.50, 3),
  ('2026-03-09', 15, 'Rx: Losartan for hypertension', 126.00, 4),
  ('2026-03-10', 8,  NULL,  685.00, 4),
  ('2026-03-11', NULL, NULL,  48.00, 3),
  ('2026-03-12', 9,  NULL,  392.00, 3),
  ('2026-03-13', 1,  NULL,  210.00, 4)
ON CONFLICT DO NOTHING;

INSERT INTO sales_details (sale_id, product_id, quantity, unit_price) VALUES
  -- Sale 1
  (1, 1, 10, 5.00),  (1, 31, 5, 6.00),  (1, 23, 2, 8.00),
  -- Sale 2
  (2, 22, 1, 280.00),
  -- Sale 3
  (3, 1, 5, 5.00),   (3, 28, 2, 6.00),
  -- Sale 4
  (4, 26, 5,14.00),  (4, 29, 5,10.00),  (4, 30, 5, 5.00),
  -- Sale 5
  (5, 31,6, 6.00),   (5, 32, 3, 8.00),  (5, 23, 1, 8.00),
  -- Sale 6
  (6, 6, 14,12.00),
  -- Sale 7
  (7, 1, 5, 5.00),   (7, 35, 4, 7.00),
  -- Sale 8
  (8, 18, 1,850.00), (8, 19, 1,380.00),  (8, 20,10,12.00),
  -- Sale 9
  (9, 31,10, 6.00),  (9, 32, 4, 8.00),  (9, 37, 3, 4.00),
  -- Sale 10
  (10, 7, 6,55.00),
  -- Sale 11
  (11, 11,5, 9.00),  (11, 26,5,14.00),  (11, 29,3,10.00),
  -- Sale 12
  (12, 48,1,1200.00),
  -- Sale 13
  (13, 1, 5, 5.00),  (13,31, 4, 6.00),  (13,35, 2, 7.00),
  -- Sale 14
  (14, 13,5,22.00),  (14,11, 5, 9.00),  (14,12, 5,14.00),
  -- Sale 15
  (15, 23,5, 8.00),  (15,24, 3, 7.50),
  -- Sale 16
  (16, 18,1,850.00), (16,20,50,12.00),  (16,19,1,380.00),
  -- Sale 17
  (17, 26,4,14.00),  (17,28,5, 6.00),   (17,30,3, 5.00),
  -- Sale 18
  (18,  1,5, 5.00),  (18,28,2, 6.00),
  -- Sale 19
  (19, 22,1,280.00), (19,23,10, 8.00),  (19,25,5,32.00),  (19,21,6, 4.50),
  -- Sale 20
  (20, 31,5, 6.00),  (20,32, 5, 8.00),  (20,36,3, 9.50),
  -- Sale 21
  (21, 13,5,22.00),  (21,12, 5,14.00),  (21,15,4,11.00),
  -- Sale 22
  (22, 26,5,14.00),  (22,29,5,10.00),   (22,27,3, 9.00),
  -- Sale 23
  (23, 18,1,850.00), (23,19,1,380.00),  (23,20,10,12.00),  (23,16,5, 8.00),
  -- Sale 24
  (24, 1, 8, 5.00),  (24,31,6, 6.00),   (24,32,4, 8.00),
  -- Sale 25
  (25, 2, 3, 8.50),  (25,26,2,14.00),   (25,28,2, 6.00),
  -- Sale 26
  (26, 12,9,14.00),
  -- Sale 27
  (27, 22,1,280.00), (27,23,5, 8.00),   (27,21,5, 4.50),   (27,19,1,380.00),
  -- Sale 28
  (28,  1,6, 5.00),  (28,31,3, 6.00),
  -- Sale 29
  (29, 13,5,22.00),  (29,11,5, 9.00),   (29,12,5,14.00),   (29,26,5,14.00),
  -- Sale 30
  (30, 31,10, 6.00), (30,32,5, 8.00),   (30,34,5,15.00),   (30,36,5, 9.50)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STOCK OUT RECORDS
-- ============================================================
INSERT INTO stock_out (stock_out_date, employee_id, user_id, total) VALUES
  ('2026-02-01', 2, 2, 0.00),
  ('2026-02-15', 5, 5, 0.00),
  ('2026-03-05', 2, 2, 0.00)
ON CONFLICT DO NOTHING;

INSERT INTO stock_out_details (stock_out_id, product_id, quantity, description) VALUES
  (1, 4,  5, 'expired'),
  (1, 9,  3, 'damaged'),
  (2, 27, 2, 'expired'),
  (2, 10, 4, 'damaged'),
  (3, 19, 2, 'expired'),
  (3, 5,  5, 'damaged')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT RETURNS
-- ============================================================
INSERT INTO return_of_products (return_date, return_type, reason, verified_by_employee_id, sale_id, customer_name, user_id) VALUES
  ('2026-02-03', 'Defective',  'Tablet was crumbling, quality issue',           2, 6,  'Fernando Cruz Dela Rosa', 3),
  ('2026-02-18', 'Wrong Item', 'Customer received wrong dosage',                5, 14, 'Andres Bonifacio Lim',    4),
  ('2026-03-06', 'Resellable', 'Customer bought excess, unopened and in date',  2, 24, NULL,                      3)
ON CONFLICT DO NOTHING;

INSERT INTO return_details (return_id, product_id, quantity) VALUES
  (1, 6,  7),
  (2, 11, 5),
  (3, 1,  3),
  (3, 31, 2)
ON CONFLICT DO NOTHING;
