// src/pages/api/intelligence/alerts.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get coverage conflicts
    const { data: conflicts, error: conflictsError } = await supabase
      .from('v_coverage_conflicts')
      .select('*')
      .gte('assigned_date', new Date().toISOString().split('T')[0])

    if (conflictsError) throw conflictsError

    // Get predicted rest periods
    const { data: predictions, error: predictionsError } = await supabase
      .from('v_predicted_rest')
      .select('*')
      .eq('urgency_level', 'imminent')

    if (predictionsError) throw predictionsError

    // Process and return intelligence data
    const alerts = [
      ...(conflicts || []).map(conflict => ({
        id: conflict.assignment_id,
        type: 'coverage_conflict',
        severity: 'high',
        site_name: conflict.site_name,
        employee_name: conflict.employee_name,
        date: conflict.assigned_date,
        reason: conflict.conflict_reason,
        suggestions: [], // Will be populated by candidate finder
        created_at: new Date().toISOString()
      })),
      ...(predictions || []).map(prediction => ({
        id: prediction.employee_id,
        type: 'rest_prediction',
        severity: 'medium',
        site_name: 'Multiple Sites',
        employee_name: prediction.employee_name,
        date: prediction.predicted_rest_start,
        reason: 'Predicted rest period',
        suggestions: [],
        created_at: new Date().toISOString()
      }))
    ]

    return new Response(JSON.stringify(alerts), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in alerts API:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}





