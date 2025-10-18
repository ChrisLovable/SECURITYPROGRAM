-- Update employee names to match the actual roster provided
-- This script updates the employees table with the correct names from the real roster

-- First, let's see what names are currently in the database
SELECT id, name, employee_number FROM employees ORDER BY name;

-- Update employee names to match the actual roster
-- Note: This assumes the employee IDs are correct, we're just updating the names

UPDATE employees SET name = 'FRANS DANIEL' WHERE employee_number = '001' OR name LIKE '%FRANS%DANIEL%';
UPDATE employees SET name = 'DANIEL KARUEMBI NDARA' WHERE employee_number = '002' OR name LIKE '%DANIEL%KARUEMBI%';
UPDATE employees SET name = 'MBWALE Tjuma' WHERE employee_number = '003' OR name LIKE '%MBWALE%';
UPDATE employees SET name = 'THOMAS WALLACE' WHERE employee_number = '004' OR name LIKE '%THOMAS%WALLACE%';
UPDATE employees SET name = 'LEONARD JONAS' WHERE employee_number = '005' OR name LIKE '%LEONARD%JONAS%';
UPDATE employees SET name = 'SHALONGOJONAS (Dankie)' WHERE employee_number = '006' OR name LIKE '%SHALONGOJONAS%';
UPDATE employees SET name = 'MIKE NDISHISI (Mike Mike)' WHERE employee_number = '007' OR name LIKE '%MIKE%NDISHISI%';
UPDATE employees SET name = 'KAMAAI TJIVINDA' WHERE employee_number = '008' OR name LIKE '%KAMAAI%';
UPDATE employees SET name = 'ANGULA MALAKIA' WHERE employee_number = '009' OR name LIKE '%ANGULA%MALAKIA%';
UPDATE employees SET name = 'Macedo Munyachi Segunda' WHERE employee_number = '010' OR name LIKE '%Macedo%Munyachi%';
UPDATE employees SET name = 'BONIFASIUS LAZARUS' WHERE employee_number = '011' OR name LIKE '%BONIFASIUS%LAZARUS%';
UPDATE employees SET name = 'FICIMON NDOVALA' WHERE employee_number = '012' OR name LIKE '%FICIMON%';
UPDATE employees SET name = 'DAVID JOHANNES' WHERE employee_number = '013' OR name LIKE '%DAVID%JOHANNES%';
UPDATE employees SET name = 'JONAS NGIYONANYE (Fish)' WHERE employee_number = '014' OR name LIKE '%JONAS%NGIYONANYE%';
UPDATE employees SET name = 'VETOPOUUAMUTAMBO (Lucky)' WHERE employee_number = '015' OR name LIKE '%VETOPOUUAMUTAMBO%';
UPDATE employees SET name = 'IMMANUEL TVATLIFA' WHERE employee_number = '016' OR name LIKE '%IMMANUEL%TVATLIFA%';
UPDATE employees SET name = 'BEN KAFIDI' WHERE employee_number = '017' OR name LIKE '%BEN%KAFIDI%';
UPDATE employees SET name = 'Daniel SHILONGO' WHERE employee_number = '018' OR name LIKE '%Daniel%SHILONGO%';
UPDATE employees SET name = 'HTJIUHARO' WHERE employee_number = '019' OR name LIKE '%HTJIUHARO%';
UPDATE employees SET name = 'PETRUS PAULUS MBAMBI' WHERE employee_number = '020' OR name LIKE '%PETRUS%PAULUS%MBAMBI%';
UPDATE employees SET name = 'FERNANANDU BUSH' WHERE employee_number = '022' OR name LIKE '%FERNANANDU%BUSH%';
UPDATE employees SET name = 'JOHANNES HEKANDJO' WHERE employee_number = '024' OR name LIKE '%JOHANNES%HEKANDJO%';
UPDATE employees SET name = 'ALFEUS HAUFIKU' WHERE employee_number = '025' OR name LIKE '%ALFEUS%HAUFIKU%';
UPDATE employees SET name = 'Mayundu A' WHERE employee_number = '026' OR name LIKE '%Mayundu%';
UPDATE employees SET name = 'KAV Kakuva' WHERE employee_number = '027' OR name LIKE '%KAV%Kakuva%';
UPDATE employees SET name = 'Petrus Tyokalume' WHERE employee_number = '031' OR name LIKE '%Petrus%Tyokalume%';
UPDATE employees SET name = 'Novello Fourne' WHERE employee_number = '032' OR name LIKE '%Novello%Fourne%';
UPDATE employees SET name = 'Pertus Gideon' WHERE employee_number = '033' OR name LIKE '%Pertus%Gideon%';
UPDATE employees SET name = 'John Joseph' WHERE employee_number = '034' OR name LIKE '%John%Joseph%';
UPDATE employees SET name = 'M Musulu' WHERE employee_number = '035' OR name LIKE '%M%Musulu%';
UPDATE employees SET name = 'Mukuaruuze Kapepu (OMO)' WHERE employee_number = '036' OR name LIKE '%Mukuaruuze%Kapepu%';
UPDATE employees SET name = 'Thomas Lwish' WHERE employee_number = '037' OR name LIKE '%Thomas%Lwish%';
UPDATE employees SET name = 'Maseka Joseph Nemoarani' WHERE employee_number = '038' OR name LIKE '%Maseka%Joseph%';
UPDATE employees SET name = 'David Jona Katembo' WHERE employee_number = '039' OR name LIKE '%David%Jona%Katembo%';
UPDATE employees SET name = 'Frans John Hennie' WHERE employee_number = '041' OR name LIKE '%Frans%John%Hennie%';
UPDATE employees SET name = 'Blasius Hidengwa' WHERE employee_number = '042' OR name LIKE '%Blasius%Hidengwa%';
UPDATE employees SET name = 'Shahafifange Hipandulua (luke)' WHERE employee_number = '043' OR name LIKE '%Shahafifange%Hipandulua%';
UPDATE employees SET name = 'Lukas Makuwa' WHERE employee_number = '044' OR name LIKE '%Lukas%Makuwa%';
UPDATE employees SET name = 'GM Likuwa' WHERE employee_number = '045' OR name LIKE '%GM%Likuwa%';
UPDATE employees SET name = 'Daniel Kilino' WHERE employee_number = '046' OR name LIKE '%Daniel%Kilino%';
UPDATE employees SET name = 'BP Moya (prince)' WHERE employee_number = '047' OR name LIKE '%BP%Moya%';
UPDATE employees SET name = 'Gabnel Antonius' WHERE employee_number = '048' OR name LIKE '%Gabnel%Antonius%';
UPDATE employees SET name = 'Oscar Wanjamba' WHERE employee_number = '049' OR name LIKE '%Oscar%Wanjamba%';
UPDATE employees SET name = 'Leon Zaaiman' WHERE employee_number = '050' OR name LIKE '%Leon%Zaaiman%';
UPDATE employees SET name = 'Thomas Nghishiko' WHERE employee_number = '051' OR name LIKE '%Thomas%Nghishiko%';
UPDATE employees SET name = 'Ndumba Mingandja' WHERE employee_number = '052' OR name LIKE '%Ndumba%Mingandja%';
UPDATE employees SET name = 'Chambala Segunda' WHERE employee_number = '053' OR name LIKE '%Chambala%Segunda%';
UPDATE employees SET name = 'Jonas Shefashike' WHERE employee_number = '054' OR name LIKE '%Jonas%Shefashike%';
UPDATE employees SET name = 'Jordan Frans' WHERE employee_number = '055' OR name LIKE '%Jordan%Frans%';
UPDATE employees SET name = 'Taleni Mangongo' WHERE employee_number = '056' OR name LIKE '%Taleni%Mangongo%';
UPDATE employees SET name = 'Ali Magau' WHERE employee_number = '057' OR name LIKE '%Ali%Magau%';
UPDATE employees SET name = 'Ndyolomimu IM' WHERE employee_number = '058' OR name LIKE '%Ndyolomimu%';
UPDATE employees SET name = 'Jospephat Kitopha' WHERE employee_number = '059' OR name LIKE '%Jospephat%Kitopha%';
UPDATE employees SET name = 'Augusto maguel Jamba' WHERE employee_number = '060' OR name LIKE '%Augusto%maguel%Jamba%';
UPDATE employees SET name = 'Faustina Kawe' WHERE employee_number = '063' OR name LIKE '%Faustina%Kawe%';
UPDATE employees SET name = 'Simson Shafodino' WHERE employee_number = '064' OR name LIKE '%Simson%Shafodino%';
UPDATE employees SET name = 'Luisi Shikolepo' WHERE employee_number = '065' OR name LIKE '%Luisi%Shikolepo%';
UPDATE employees SET name = 'Aser Magongo' WHERE employee_number = '066' OR name LIKE '%Aser%Magongo%';
UPDATE employees SET name = 'EE Tobias' WHERE employee_number = '067' OR name LIKE '%EE%Tobias%';
UPDATE employees SET name = 'Michael David Motshego' WHERE employee_number = '068' OR name LIKE '%Michael%David%Motshego%';
UPDATE employees SET name = 'Petrus Mwale' WHERE employee_number = '069' OR name LIKE '%Petrus%Mwale%';
UPDATE employees SET name = 'Profilius Mwetupaka' WHERE employee_number = '070' OR name LIKE '%Profilius%Mwetupaka%';
UPDATE employees SET name = 'Bafana Tjahura' WHERE employee_number = '071' OR name LIKE '%Bafana%Tjahura%';

-- Remove the employees that are not in the actual roster
DELETE FROM employees WHERE name IN ('MOLOMO REUBEN 9Allen)', 'U Muharukua');

-- Show the updated employee list
SELECT id, name, employee_number FROM employees ORDER BY name;

-- Show any remaining conflicts
SELECT 
    e.name as employee_name,
    rp.start_date as rest_start,
    rp.end_date as rest_end,
    lp.start_date as leave_start,
    lp.end_date as leave_end
FROM employees e
JOIN rest_periods rp ON rp.employee_id = e.id
JOIN leave_periods lp ON lp.employee_id = e.id
WHERE daterange(rp.start_date, rp.end_date, '[]') && daterange(lp.start_date, lp.end_date, '[]');





