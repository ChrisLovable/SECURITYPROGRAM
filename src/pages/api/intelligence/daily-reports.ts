// src/pages/api/intelligence/daily-reports.ts
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
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    // Get daily intelligence reports
    const { data: reports, error } = await supabase
      .from('v_daily_intelligence')
      .select('*')
      .gte('report_date', new Date().toISOString().split('T')[0])
      .lte('report_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('report_date')

    if (error) throw error

    return new Response(JSON.stringify(reports || []), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in daily-reports API:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}





