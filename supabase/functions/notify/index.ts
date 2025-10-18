import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get notifications ready to be delivered
    const now = new Date().toISOString()
    const { data: notifications, error: fetchError } = await supabaseClient
      .from('notifications')
      .select(`
        *,
        guard:guards(*)
      `)
      .lte('deliver_at', now)
      .eq('delivered', false)
      .limit(100)

    if (fetchError) throw fetchError

    let deliveredCount = 0
    let failedCount = 0

    // Process each notification
    for (const notification of notifications || []) {
      try {
        // Send push notification (simplified - in real app would use web push API)
        const pushResult = await sendPushNotification(notification)
        
        if (pushResult.success) {
          // Mark as delivered
          await supabaseClient
            .from('notifications')
            .update({ delivered: true })
            .eq('id', notification.id)
          
          deliveredCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Failed to deliver notification ${notification.id}:`, error)
        failedCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications?.length || 0,
        delivered: deliveredCount,
        failed: failedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing notifications:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Simplified push notification function
async function sendPushNotification(notification: any) {
  // In a real implementation, this would:
  // 1. Get the guard's push subscription from their profile
  // 2. Use the Web Push API to send the notification
  // 3. Handle different platforms (Chrome, Safari, etc.)
  
  console.log(`Sending notification to guard ${notification.guard?.badge}:`, {
    title: notification.title,
    body: notification.body
  })
  
  // For now, just simulate success
  return { success: true }
}








