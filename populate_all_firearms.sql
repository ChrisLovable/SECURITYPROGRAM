-- Populate Firearm Inventory with ALL 102 firearms from Excel data
-- Run this AFTER running the setup_firearm_inventory_quick.sql

-- Clear existing firearms (optional - remove this if you want to keep existing data)
-- DELETE FROM firearms;

-- Insert ALL firearms from your Excel file
-- Galil .223 REM (25 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2053967', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2063245', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008076', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '1303500', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2014768', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008999', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2014570', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2012603', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2001641', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2010558', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2050455', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2069757', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2013997', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2024488', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2035693', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2067262', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008494', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2051095', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2002300', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2042627', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '1303160', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2017417', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2057667', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2017398', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2057967', '2024-10-22', '2029-10-21')
ON CONFLICT (serial_number) DO NOTHING;

-- Galil .223 REM (5.56x45) (4 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2049122', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2069318', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2054474', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2059981', '2021-05-26', '2026-05-25')
ON CONFLICT (serial_number) DO NOTHING;

-- Galil .223 (Carbine) Rifle (2 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Carbine) Rifle'), '2049986', '2022-05-27', '2027-05-26'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Carbine) Rifle'), '2072564', '2015-12-07', '2020-12-06')
ON CONFLICT (serial_number) DO NOTHING;

-- Vektor LM 5.233 REM (5.56x45) (10 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664273/RS A563933', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664317/RS A564287', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664199/RS A582034', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664276/RS A564961', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA663596/RS A564739', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664297/RS A564439', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664234/RS A564746', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664299/RS A563928', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA663650/RS A564221', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664286/RS A564466', '2024-01-29', '2029-01-29')
ON CONFLICT (serial_number) DO NOTHING;

-- Glock 9MM par (9 x 19MM) (9 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD209', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR688', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR687', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR686', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD207', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD120', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR689', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'TXB613', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD206', '2024-10-22', '2029-10-21')
ON CONFLICT (serial_number) DO NOTHING;

-- Aero Precision .223 REM (5 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097546', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097549', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X096105', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097532', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097537', '2021-05-26', '2026-05-25')
ON CONFLICT (serial_number) DO NOTHING;

-- Norinco .223 REM (5.56x45) (4 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA270', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA301', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA290', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA304', '2024-01-29', '2029-01-29')
ON CONFLICT (serial_number) DO NOTHING;

-- Khan 12 GA (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120180', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120177', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '16/PM120178', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120174', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120173', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120179', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120175', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120176', '2021-05-26', '2026-05-25')
ON CONFLICT (serial_number) DO NOTHING;

-- .223 Rifle SAR (3 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'KT476502', '2015-12-07', '2020-12-06'),
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'AE495786', '2021-11-24', '2026-11-23'),
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'AE495857', '2021-11-24', '2026-11-23')
ON CONFLICT (serial_number) DO NOTHING;

-- Vektor LM 4.223 REM (1 firearm)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 4.223 REM'), 'RSA563613', '2024-10-22', '2029-10-21')
ON CONFLICT (serial_number) DO NOTHING;

-- Shotgun (6 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00504', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00503', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00508', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00505', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00517', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00516', '2021-10-20', '2026-10-19')
ON CONFLICT (serial_number) DO NOTHING;

-- Galil .223 (Rifle/Carbine) (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '1606808', '2021-10-12', '2026-10-11'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2017670', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2003069', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2053863', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2047072', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '1303617', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2050581', '2021-10-21', '2026-10-20'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2011176', '2021-10-22', '2026-10-21')
ON CONFLICT (serial_number) DO NOTHING;

-- Galil 5.56x45mm (9 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2023000', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2073957', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2048091', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2051655', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2055287', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2038820', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2073267', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2028019', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2020679', '2022-06-06', '2027-06-05')
ON CONFLICT (serial_number) DO NOTHING;

-- Khan 12 GA Shotguns (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1376', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1377', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1378', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1379', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1380', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1381', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1382', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1383', '2024-01-29', '2029-01-29')
ON CONFLICT (serial_number) DO NOTHING;

-- Verify the data was inserted
SELECT 'Data population complete!' as status;
SELECT 
    ft.category,
    COUNT(*) as count
FROM firearms f
JOIN firearm_types ft ON f.firearm_type_id = ft.id
GROUP BY ft.category
ORDER BY ft.category;

SELECT 'Total firearms: ' || COUNT(*) as total_count FROM firearms;




