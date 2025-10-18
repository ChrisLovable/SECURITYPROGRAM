// supabase/functions/intelligence-scheduler/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

export default async function handler(req: Request) {
  try {
    console.log('🧠 Starting Guard Intelligence Analysis...')

    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('guard_intelligence_settings')
      .select('*')
    
    if (settingsError) throw settingsError

    const noticeDays = settings?.find(s => s.key === 'notice_days')?.value || 14
    console.log(`📅 Analyzing conflicts within ${noticeDays} days`)

    // Find conflicts in the next N days
    const { data: conflicts, error: conflictsError } = await supabase
      .from('v_coverage_conflicts')
      .select('*')
      .gte('assigned_date', new Date().toISOString().split('T')[0])
      .lte('assigned_date', new Date(Date.now() + noticeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (conflictsError) throw conflictsError

    console.log(`⚠️ Found ${conflicts?.length || 0} coverage conflicts`)

    // Process each conflict
    for (const conflict of conflicts || []) {
      console.log(`🔍 Processing conflict: ${conflict.site_name} - ${conflict.employee_name}`)

      // Get replacement candidates
      const { data: candidates, error: candidatesError } = await supabase
        .rpc('find_replacement_candidates', {
          p_site_id: conflict.site_id,
          p_assigned_date: conflict.assigned_date,
          p_shift_type: conflict.shift_type
        })

      if (candidatesError) {
        console.error(`❌ Error getting candidates for ${conflict.site_name}:`, candidatesError)
        continue
      }

      console.log(`💡 Found ${candidates?.length || 0} replacement candidates`)

      // Create intelligence event
      const { data: event, error: eventError } = await supabase
        .from('intelligence_events')
        .insert({
          event_type: 'coverage_conflict',
          severity: 'high',
          payload: {
            conflict: conflict,
            candidates: candidates?.slice(0, 5) || [],
            analysis_date: new Date().toISOString(),
            notice_days: noticeDays
          },
          site_id: conflict.site_id,
          employee_id: conflict.employee_id
        })
        .select()
        .single()

      if (eventError) {
        console.error(`❌ Error creating intelligence event:`, eventError)
        continue
      }

      console.log(`✅ Created intelligence event: ${event.id}`)

      // Send notification (implement your notification system)
      await sendNotification({
        title: `🚨 Coverage Alert: ${conflict.site_name}`,
        body: `${conflict.employee_name} unavailable on ${conflict.assigned_date}. ${candidates?.length || 0} replacements found.`,
        data: { 
          conflict_id: conflict.assignment_id,
          site_id: conflict.site_id,
          employee_id: conflict.employee_id,
          intelligence_event_id: event.id
        }
      })
    }

    // Analyze predicted rest periods
    const { data: predictions, error: predictionsError } = await supabase
      .from('v_predicted_rest')
      .select('*')
      .eq('urgency_level', 'imminent')

    if (predictionsError) throw predictionsError

    console.log(`🛌 Found ${predictions?.length || 0} imminent rest periods`)

    // Create events for imminent rest periods
    for (const prediction of predictions || []) {
      const { data: event, error: eventError } = await supabase
        .from('intelligence_events')
        .insert({
          event_type: 'rest_prediction',
          severity: 'medium',
          payload: {
            prediction: prediction,
            analysis_date: new Date().toISOString(),
            days_until_rest: Math.ceil((new Date(prediction.predicted_rest_start).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          },
          employee_id: prediction.employee_id
        })
        .select()
        .single()

      if (eventError) {
        console.error(`❌ Error creating rest prediction event:`, eventError)
        continue
      }

      console.log(`✅ Created rest prediction event: ${event.id}`)

      // Send notification for imminent rest
      await sendNotification({
        title: `🛌 Rest Period Alert: ${prediction.employee_name}`,
        body: `${prediction.employee_name} will start rest period on ${prediction.predicted_rest_start}. Plan coverage accordingly.`,
        data: { 
          employee_id: prediction.employee_id,
          rest_start: prediction.predicted_rest_start,
          intelligence_event_id: event.id
        }
      })
    }

    // Generate daily summary
    const { data: dailySummary, error: summaryError } = await supabase
      .from('v_daily_intelligence')
      .select('*')
      .eq('report_date', new Date().toISOString().split('T')[0])
      .single()

    if (!summaryError && dailySummary) {
      const { data: summaryEvent, error: summaryEventError } = await supabase
        .from('intelligence_events')
        .insert({
          event_type: 'daily_summary',
          severity: 'low',
          payload: {
            summary: dailySummary,
            analysis_date: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (!summaryEventError) {
        console.log(`📊 Created daily summary event: ${summaryEvent.id}`)
      }
    }

    console.log('🎉 Guard Intelligence Analysis completed successfully!')

    return new Response(JSON.stringify({ 
      success: true, 
      conflicts_analyzed: conflicts?.length || 0,
      predictions_analyzed: predictions?.length || 0,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Intelligence scheduler error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function sendNotification(notification: any) {
  try {
    // Implement your notification system here
    // This could be Firebase Cloud Messaging, OneSignal, email, SMS, etc.
    
    console.log('📱 Sending notification:', notification.title)
    
    // Example: Send to a webhook or notification service
    // await fetch('YOUR_NOTIFICATION_WEBHOOK_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notification)
    // })
    
    // For now, just log the notification
    console.log('📧 Notification details:', JSON.stringify(notification, null, 2))
    
  } catch (error) {
    console.error('❌ Error sending notification:', error)
  }
}





