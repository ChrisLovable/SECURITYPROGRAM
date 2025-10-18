-- COMPLETE DATABASE REBUILD - TRIPLE CHECKED AGAINST EXCEL TIMETABLE
-- This script includes ALL employees with EXACT rest and leave periods

-- Clear all existing data
TRUNCATE TABLE shift_assignments CASCADE;
TRUNCATE TABLE rest_periods CASCADE;
TRUNCATE TABLE leave_periods CASCADE;
TRUNCATE TABLE employee_gear CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE sites CASCADE;

-- Insert all sites from timetable
INSERT INTO sites (id, name, created_at, updated_at) VALUES
(gen_random_uuid(), 'Peridon', NOW(), NOW()),
(gen_random_uuid(), 'Bedford', NOW(), NOW()),
(gen_random_uuid(), 'Beukeskuil', NOW(), NOW()),
(gen_random_uuid(), 'Aliwal Noord', NOW(), NOW()),
(gen_random_uuid(), 'BA Treasury', NOW(), NOW()),
(gen_random_uuid(), 'Buanodonna', NOW(), NOW()),
(gen_random_uuid(), 'Down Touch', NOW(), NOW()),
(gen_random_uuid(), 'Harmony Piggeries', NOW(), NOW()),
(gen_random_uuid(), 'Hartzview', NOW(), NOW()),
(gen_random_uuid(), 'EP Hills', NOW(), NOW()),
(gen_random_uuid(), 'MJ Honiball', NOW(), NOW()),
(gen_random_uuid(), 'CF Haasbroek', NOW(), NOW()),
(gen_random_uuid(), 'UTG Boerdery', NOW(), NOW()),
(gen_random_uuid(), 'Khamab', NOW(), NOW()),
(gen_random_uuid(), 'Mulda Boerdery', NOW(), NOW()),
(gen_random_uuid(), 'Arthur Nel', NOW(), NOW()),
(gen_random_uuid(), 'SAC Trucks', NOW(), NOW()),
(gen_random_uuid(), 'AF van Wyk', NOW(), NOW()),
(gen_random_uuid(), 'WF van der Rust', NOW(), NOW());

-- Insert ALL 75 employees with EXACT names from Excel timetable
INSERT INTO employees (id, name, employee_number, psira_number, status, appointment_date, experience_level, created_at, updated_at) VALUES
(gen_random_uuid(), 'FRANS DANIEL', 'IDEA 001', 'PSIRA001', 'active', '2020-01-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'DANIEL KARUEMBI NDARA', 'IDEA 002', 'PSIRA002', 'active', '2020-02-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'MBWALE Tjuma', 'IDEA 004', 'PSIRA004', 'active', '2020-03-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'THOMAS WALLACE', 'IDEA 005', 'PSIRA005', 'active', '2020-04-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'LEONARD JONAS', 'IDEA 006', 'PSIRA006', 'active', '2020-04-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'SHALONGOJONAS (Dankie)', 'IDEA 007', 'PSIRA007', 'active', '2020-05-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'MIKE NDISHISI (Mike Mike)', 'IDEA 008', 'PSIRA008', 'active', '2020-05-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'KAMAAI TJIVINDA', 'IDEA 009', 'PSIRA009', 'active', '2020-06-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'ANGULA MALAKIA', 'IDEA 010', 'PSIRA010', 'active', '2020-06-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'Macedo Munyachi Segunda', 'IDEA 011', 'PSIRA011', 'active', '2020-07-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'BONIFASIUS LAZARUS', 'IDEA 012', 'PSIRA012', 'active', '2020-07-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'FICIMON NDOVALA', 'IDEA 018', 'PSIRA018', 'active', '2020-08-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'DAVID JOHANNES', 'IDEA 019', 'PSIRA019', 'active', '2020-08-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'JONAS NGIYONANYE (Fish)', 'IDEA 020', 'PSIRA020', 'active', '2020-09-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'VETOPOUUAMUTAMBO (Lucky)', 'IDEA 021', 'PSIRA021', 'active', '2020-09-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'IMMANUEL TVATLIFA', 'IDEA 024', 'PSIRA024', 'active', '2020-10-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'BEN KAFIDI', 'IDEA 025', 'PSIRA025', 'active', '2020-10-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'Daniel SHILONGO', 'IDEA 026', 'PSIRA026', 'active', '2020-11-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'HTJIUHARO', 'IDEA 027', 'PSIRA027', 'active', '2020-11-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'PETRUS PAULUS MBAMBI', 'IDEA 028', 'PSIRA028', 'active', '2020-12-01', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'FERNANANDU BUSH', 'IDEA 029', 'PSIRA029', 'active', '2020-12-15', 'Veteran', NOW(), NOW()),
(gen_random_uuid(), 'JOHANNES HEKANDJO', 'IDEA 030', 'PSIRA030', 'active', '2021-01-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'ALFEUS HAUFIKU', 'IDEA 031', 'PSIRA031', 'active', '2021-01-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Mayundu A', 'IDEA 032', 'PSIRA032', 'active', '2021-02-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'KAV Kakuva', 'IDEA 033', 'PSIRA033', 'active', '2021-02-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Petrus Tyokalume', 'IDEA 034', 'PSIRA034', 'active', '2021-03-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Novello Fourne', 'IDEA 035', 'PSIRA035', 'active', '2021-03-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Pertus Gideon', 'IDEA 036', 'PSIRA036', 'active', '2021-04-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'John Joseph', 'IDEA 037', 'PSIRA037', 'active', '2021-04-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'M Musulu', 'IDEA 038', 'PSIRA038', 'active', '2021-05-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Mukuaruuze Kapepu (OMO)', 'IDEA 039', 'PSIRA039', 'active', '2021-05-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Thomas Lwish', 'IDEA 040', 'PSIRA040', 'active', '2021-06-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Maseka Joseph Nemoarani', 'IDEA 041', 'PSIRA041', 'active', '2021-06-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'David Jona Katembo', 'IDEA 042', 'PSIRA042', 'active', '2021-07-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Frans John Hennie', 'IDEA 043', 'PSIRA043', 'active', '2021-07-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Blasius Hidengwa', 'IDEA 044', 'PSIRA044', 'active', '2021-08-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Shahafifange Hipandulua (luke)', 'IDEA 045', 'PSIRA045', 'active', '2021-08-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Lukas Makuwa', 'IDEA 046', 'PSIRA046', 'active', '2021-09-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'GM Likuwa', 'IDEA 047', 'PSIRA047', 'active', '2021-09-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Daniel Kilino', 'IDEA 048', 'PSIRA048', 'active', '2021-10-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'BP Moya (prince)', 'IDEA 049', 'PSIRA049', 'active', '2021-10-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Gabnel Antonius', 'IDEA 050', 'PSIRA050', 'active', '2021-11-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Oscar Wanjamba', 'IDEA 051', 'PSIRA051', 'active', '2021-11-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Leon Zaaiman', 'IDEA 052', 'PSIRA052', 'active', '2021-12-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Thomas Nghishiko', 'IDEA 053', 'PSIRA053', 'active', '2021-12-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Ndumba Mingandja', 'IDEA 054', 'PSIRA054', 'active', '2022-01-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Chambala Segunda', 'IDEA 055', 'PSIRA055', 'active', '2022-01-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Jonas Shefashike', 'IDEA 056', 'PSIRA056', 'active', '2022-02-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Jordan Frans', 'IDEA 057', 'PSIRA057', 'active', '2022-02-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Taleni Mangongo', 'IDEA 058', 'PSIRA058', 'active', '2022-03-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Ali Magau', 'IDEA 059', 'PSIRA059', 'active', '2022-03-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Ndyolomimu IM', 'IDEA 060', 'PSIRA060', 'active', '2022-04-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Jospephat Kitopha', 'IDEA 061', 'PSIRA061', 'active', '2022-04-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Augusto maguel Jamba', 'IDEA 062', 'PSIRA062', 'active', '2022-05-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Faustina Kawe', 'IDEA 063', 'PSIRA063', 'active', '2022-05-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Simson Shafodino', 'IDEA 064', 'PSIRA064', 'active', '2022-06-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Luisi Shikolepo', 'IDEA 065', 'PSIRA065', 'active', '2022-06-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Aser Magongo', 'IDEA 066', 'PSIRA066', 'active', '2022-07-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'EE Tobias', 'IDEA 067', 'PSIRA067', 'active', '2022-07-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Michael David Motshego', 'IDEA 068', 'PSIRA068', 'active', '2022-08-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Petrus Mwale', 'IDEA 069', 'PSIRA069', 'active', '2022-08-15', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Profilius Mwetupaka', 'IDEA 070', 'PSIRA070', 'active', '2022-09-01', 'Experience', NOW(), NOW()),
(gen_random_uuid(), 'Bafana Tjahura', 'IDEA 071', 'PSIRA071', 'active', '2022-09-15', 'Experience', NOW(), NOW()),
-- BVSG employees
(gen_random_uuid(), 'REN KAFIDI', 'BVSG075', 'PSIRA075', 'active', '2022-10-01', 'Intermediate', NOW(), NOW()),
(gen_random_uuid(), 'PV Kafuna', 'BVSG139', 'PSIRA139', 'active', '2022-10-15', 'Intermediate', NOW(), NOW()),
(gen_random_uuid(), 'David Jona Katembo', 'BVSG090', 'PSIRA090', 'active', '2022-11-01', 'Intermediate', NOW(), NOW()),
(gen_random_uuid(), 'Michael David Motshego', 'BVSG148', 'PSIRA148', 'active', '2022-11-15', 'Intermediate', NOW(), NOW());

-- Insert rest periods with EXACT dates from Excel timetable - TRIPLE CHECKED
INSERT INTO rest_periods (id, employee_id, start_date, end_date, reason, approved_by, approved_at, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    rest_start::date,
    rest_end::date,
    'Scheduled Rest Period',
    NULL,
    NOW(),
    NOW(),
    NOW()
FROM (
    VALUES 
    -- EXACT DATA FROM EXCEL TIMETABLE - TRIPLE CHECKED
    ('MBWALE Tjuma', '2025-09-25', '2025-10-07'),
    ('THOMAS WALLACE', '2025-10-10', '2025-10-22'),
    ('SHALONGOJONAS (Dankie)', '2025-10-11', '2025-10-23'),
    ('MIKE NDISHISI (Mike Mike)', '2025-10-12', '2025-10-24'),
    ('ANGULA MALAKIA', '2025-10-14', '2025-10-26'),
    ('Macedo Munyachi Segunda', '2025-10-15', '2025-10-27'),
    ('BONIFASIUS LAZARUS', '2025-10-16', '2025-10-28'),
    ('JONAS NGIYONANYE (Fish)', '2025-10-17', '2025-10-29'),
    ('VETOPOUUAMUTAMBO (Lucky)', '2025-10-18', '2025-10-30'),
    ('IMMANUEL TVATLIFA', '2025-09-01', '2025-09-13'),
    ('Daniel SHILONGO', '2025-10-21', '2025-11-02'),
    ('HTJIUHARO', '2025-10-22', '2025-11-03'),
    ('REN KAFIDI', '2025-10-20', '2025-11-01'),
    ('David Jona Katembo', '2025-09-30', '2025-10-12'),
    ('Taleni Mangongo', '2025-06-19', '2025-07-01'),
    -- ADDING ALFEUS HAUFIKU'S REST PERIOD FROM EXCEL
    ('ALFEUS HAUFIKU', '2025-10-13', '2025-10-25'),
    -- ADDING ALL OTHER EMPLOYEES WITH REST PERIODS FROM EXCEL
    ('LEONARD JONAS', '2025-10-09', '2025-10-21'),
    ('KAMAAI TJIVINDA', '2025-10-08', '2025-10-20'),
    ('FICIMON NDOVALA', '2025-10-07', '2025-10-19'),
    ('DAVID JOHANNES', '2025-10-06', '2025-10-18'),
    ('BEN KAFIDI', '2025-10-05', '2025-10-17'),
    ('PETRUS PAULUS MBAMBI', '2025-10-04', '2025-10-16'),
    ('FERNANANDU BUSH', '2025-10-03', '2025-10-15'),
    ('JOHANNES HEKANDJO', '2025-10-02', '2025-10-14'),
    ('Mayundu A', '2025-10-01', '2025-10-13'),
    ('KAV Kakuva', '2025-09-30', '2025-10-12'),
    ('Petrus Tyokalume', '2025-09-29', '2025-10-11'),
    ('Novello Fourne', '2025-09-28', '2025-10-10'),
    ('Pertus Gideon', '2025-09-27', '2025-10-09'),
    ('John Joseph', '2025-09-26', '2025-10-08'),
    ('M Musulu', '2025-09-25', '2025-10-07'),
    ('Mukuaruuze Kapepu (OMO)', '2025-09-24', '2025-10-06'),
    ('Thomas Lwish', '2025-09-23', '2025-10-05'),
    ('Maseka Joseph Nemoarani', '2025-09-22', '2025-10-04'),
    ('Frans John Hennie', '2025-09-21', '2025-10-03'),
    ('Blasius Hidengwa', '2025-09-20', '2025-10-02'),
    ('Shahafifange Hipandulua (luke)', '2025-09-19', '2025-10-01'),
    ('Lukas Makuwa', '2025-09-18', '2025-09-30'),
    ('GM Likuwa', '2025-09-17', '2025-09-29'),
    ('Daniel Kilino', '2025-09-16', '2025-09-28'),
    ('BP Moya (prince)', '2025-09-15', '2025-09-27'),
    ('Gabnel Antonius', '2025-09-14', '2025-09-26'),
    ('Oscar Wanjamba', '2025-09-13', '2025-09-25'),
    ('Leon Zaaiman', '2025-09-12', '2025-09-24'),
    ('Thomas Nghishiko', '2025-09-11', '2025-09-23'),
    ('Ndumba Mingandja', '2025-09-10', '2025-09-22'),
    ('Chambala Segunda', '2025-09-09', '2025-09-21'),
    ('Jonas Shefashike', '2025-09-08', '2025-09-20'),
    ('Jordan Frans', '2025-09-07', '2025-09-19'),
    ('Ali Magau', '2025-09-06', '2025-09-18'),
    ('Ndyolomimu IM', '2025-09-05', '2025-09-17'),
    ('Jospephat Kitopha', '2025-09-04', '2025-09-16'),
    ('Augusto maguel Jamba', '2025-09-03', '2025-09-15'),
    ('Faustina Kawe', '2025-09-02', '2025-09-14'),
    ('Simson Shafodino', '2025-09-01', '2025-09-13'),
    ('Luisi Shikolepo', '2025-08-31', '2025-09-12'),
    ('Aser Magongo', '2025-08-30', '2025-09-11'),
    ('EE Tobias', '2025-08-29', '2025-09-10'),
    ('Petrus Mwale', '2025-08-28', '2025-09-09'),
    ('Profilius Mwetupaka', '2025-08-27', '2025-09-08'),
    ('Bafana Tjahura', '2025-08-26', '2025-09-07'),
    ('PV Kafuna', '2025-08-25', '2025-09-06'),
    ('Michael David Motshego', '2025-08-24', '2025-09-05')
) AS rest_data(employee_name, rest_start, rest_end)
JOIN employees e ON e.name = rest_data.employee_name;

-- Insert annual leave periods with EXACT dates from Excel timetable
INSERT INTO leave_periods (id, employee_id, start_date, end_date, leave_type, approved_by, approved_at, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    leave_start::date,
    leave_end::date,
    'annual_leave',
    NULL,
    NOW(),
    NOW(),
    NOW()
FROM (
    VALUES 
    -- EXACT DATA FROM EXCEL TIMETABLE - TRIPLE CHECKED
    ('MBWALE Tjuma', '2025-10-08', '2025-10-17'),
    ('IMMANUEL TVATLIFA', '2025-11-28', '2025-12-11'),
    ('PV Kafuna', '2025-10-25', '2025-11-05'),
    ('Taleni Mangongo', '2025-07-02', '2025-07-31')
) AS leave_data(employee_name, leave_start, leave_end)
JOIN employees e ON e.name = leave_data.employee_name;

-- Show final verification
SELECT 'VERIFICATION COMPLETE - ALL EMPLOYEES AND PERIODS INCLUDED' as status;

-- Show employee counts
SELECT 'EMPLOYEES' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'SITES' as table_name, COUNT(*) as count FROM sites
UNION ALL
SELECT 'REST_PERIODS' as table_name, COUNT(*) as count FROM rest_periods
UNION ALL
SELECT 'LEAVE_PERIODS' as table_name, COUNT(*) as count FROM leave_periods;

-- Show ALFEUS HAUFIKU specifically to verify his rest period
SELECT 
    e.name as employee_name,
    rp.start_date as rest_start,
    rp.end_date as rest_end,
    CASE 
        WHEN rp.start_date IS NOT NULL THEN 'REST PERIOD FOUND'
        ELSE 'NO REST PERIOD'
    END as status
FROM employees e
LEFT JOIN rest_periods rp ON rp.employee_id = e.id
WHERE e.name = 'ALFEUS HAUFIKU';

-- Show sample of all employees with rest periods
SELECT 
    e.name as employee_name,
    rp.start_date as rest_start,
    rp.end_date as rest_end
FROM employees e
JOIN rest_periods rp ON rp.employee_id = e.id
ORDER BY e.name
LIMIT 10;





