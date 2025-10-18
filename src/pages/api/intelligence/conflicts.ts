// src/pages/api/intelligence/conflicts.ts
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
    const { data: conflicts, error } = await supabase
      .from('v_coverage_conflicts')
      .select('*')
      .gte('assigned_date', new Date().toISOString().split('T')[0])
      .order('assigned_date')

    if (error) throw error

    return new Response(JSON.stringify(conflicts || []), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in conflicts API:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}





