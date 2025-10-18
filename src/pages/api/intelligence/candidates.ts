// src/pages/api/intelligence/candidates.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const { site_id, assigned_date, shift_type } = body

    if (!site_id || !assigned_date || !shift_type) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get replacement candidates using the database function
    const { data: candidates, error } = await supabase
      .rpc('find_replacement_candidates', {
        p_site_id: site_id,
        p_assigned_date: assigned_date,
        p_shift_type: shift_type
      })

    if (error) throw error

    return new Response(JSON.stringify(candidates || []), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in candidates API:', error as Error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}





