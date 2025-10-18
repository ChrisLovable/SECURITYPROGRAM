-- PERFORMANCE NOTES SYSTEM
-- Track employee performance with dates and comments

-- Create performance notes table
CREATE TABLE IF NOT EXISTS performance_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- 'general', 'positive', 'negative', 'improvement', 'warning'
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_notes_employee ON performance_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_notes_date ON performance_notes(note_date);
CREATE INDEX IF NOT EXISTS idx_performance_notes_type ON performance_notes(note_type);

-- Create function to get performance notes for an employee
CREATE OR REPLACE FUNCTION get_employee_performance_notes(p_employee_id UUID)
RETURNS TABLE (
    id UUID,
    note_date DATE,
    note_text TEXT,
    note_type VARCHAR(50),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pn.id,
        pn.note_date,
        pn.note_text,
        pn.note_type,
        pn.created_by,
        pn.created_at
    FROM performance_notes pn
    WHERE pn.employee_id = p_employee_id
    ORDER BY pn.note_date DESC, pn.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get performance summary for an employee
CREATE OR REPLACE FUNCTION get_employee_performance_summary(p_employee_id UUID)
RETURNS TABLE (
    total_notes INTEGER,
    positive_notes INTEGER,
    negative_notes INTEGER,
    improvement_notes INTEGER,
    warning_notes INTEGER,
    general_notes INTEGER,
    latest_note_date DATE,
    latest_note_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_notes,
        COUNT(*) FILTER (WHERE note_type = 'positive')::INTEGER as positive_notes,
        COUNT(*) FILTER (WHERE note_type = 'negative')::INTEGER as negative_notes,
        COUNT(*) FILTER (WHERE note_type = 'improvement')::INTEGER as improvement_notes,
        COUNT(*) FILTER (WHERE note_type = 'warning')::INTEGER as warning_notes,
        COUNT(*) FILTER (WHERE note_type = 'general')::INTEGER as general_notes,
        MAX(note_date) as latest_note_date,
        (SELECT note_type FROM performance_notes 
         WHERE employee_id = p_employee_id 
         ORDER BY note_date DESC, created_at DESC 
         LIMIT 1) as latest_note_type
    FROM performance_notes
    WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE performance_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON performance_notes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON performance_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON performance_notes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON performance_notes FOR DELETE USING (true);

-- Insert sample performance notes
INSERT INTO performance_notes (employee_id, note_date, note_text, note_type, created_by) 
SELECT 
    e.id,
    CURRENT_DATE - INTERVAL '30 days' * (RANDOM() * 10)::INTEGER,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'Excellent performance during night shift. Very alert and professional.'
        WHEN RANDOM() < 0.6 THEN 'Good communication with team members. Reliable attendance.'
        WHEN RANDOM() < 0.8 THEN 'Needs improvement in punctuality. Arrived 15 minutes late.'
        ELSE 'Warning issued for not following proper procedures during incident.'
    END,
    CASE 
        WHEN RANDOM() < 0.2 THEN 'positive'
        WHEN RANDOM() < 0.4 THEN 'negative'
        WHEN RANDOM() < 0.6 THEN 'improvement'
        WHEN RANDOM() < 0.8 THEN 'warning'
        ELSE 'general'
    END,
    'System Admin'
FROM employees e
WHERE e.status = 'active'
LIMIT 50;

-- Show verification
SELECT 'PERFORMANCE NOTES SYSTEM INSTALLED SUCCESSFULLY' as status;

-- Show sample performance notes
SELECT 
    e.name as employee_name,
    pn.note_date,
    pn.note_text,
    pn.note_type,
    pn.created_by
FROM performance_notes pn
JOIN employees e ON e.id = pn.employee_id
ORDER BY pn.note_date DESC
LIMIT 10;





