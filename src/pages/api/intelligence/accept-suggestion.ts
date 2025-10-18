// src/pages/api/intelligence/accept-suggestion.ts
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
    const { alertId, suggestion } = body

    if (!alertId || !suggestion) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create intelligence event for the accepted suggestion
    const { data: event, error: eventError } = await supabase
      .from('intelligence_events')
      .insert({
        event_type: 'replacement_suggestion',
        severity: 'medium',
        payload: {
          alert_id: alertId,
          suggestion: suggestion,
          action: 'accepted',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (eventError) throw eventError

    return new Response(JSON.stringify({ success: true, event }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in accept-suggestion API:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}





