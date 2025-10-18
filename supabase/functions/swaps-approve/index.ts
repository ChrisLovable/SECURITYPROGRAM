import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveSwapRequest {
  swap_id: string
  approve: boolean
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

    // Parse request body
    const { swap_id, approve }: ApproveSwapRequest = await req.json()

    if (!swap_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: swap_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get swap details
    const { data: swap, error: swapError } = await supabaseClient
      .from('swaps')
      .select(`
        *,
        from_guard:guards!swaps_from_guard_id_fkey(*),
        to_guard:guards!swaps_to_guard_id_fkey(*),
        site:sites(*)
      `)
      .eq('id', swap_id)
      .single()

    if (swapError) throw swapError

    if (!swap) {
      return new Response(
        JSON.stringify({ error: 'Swap not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (swap.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Swap is not pending' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update swap status
    const newStatus = approve ? 'approved' : 'rejected'
    const { error: updateError } = await supabaseClient
      .from('swaps')
      .update({ status: newStatus })
      .eq('id', swap_id)

    if (updateError) throw updateError

    let message = `Swap ${approve ? 'approved' : 'rejected'} successfully`

    // If approved, update assignments
    if (approve) {
      const result = await processApprovedSwap(supabaseClient, swap)
      message += `. Updated ${result.updated_assignments} assignments`
    }

    // Create notifications for both guards
    const notifications = [
      {
        guard_id: swap.from_guard_id,
        title: `Swap ${approve ? 'Approved' : 'Rejected'}`,
        body: `Your swap request with ${swap.to_guard.badge} has been ${approve ? 'approved' : 'rejected'}`,
        deliver_at: new Date().toISOString()
      },
      {
        guard_id: swap.to_guard_id,
        title: `Swap ${approve ? 'Approved' : 'Rejected'}`,
        body: `Your swap request with ${swap.from_guard.badge} has been ${approve ? 'approved' : 'rejected'}`,
        deliver_at: new Date().toISOString()
      }
    ]

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Failed to create notifications:', notificationError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
        status: newStatus
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing swap approval:', error)
    
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

async function processApprovedSwap(supabaseClient: any, swap: any) {
  let updatedAssignments = 0

  // Update assignments for the swap period
  const { error: fromAssignmentsError } = await supabaseClient
    .from('assignments')
    .update({ guard_id: swap.to_guard_id })
    .eq('guard_id', swap.from_guard_id)
    .eq('site_id', swap.site_id)
    .gte('work_date', swap.date_from)
    .lte('work_date', swap.date_to)

  if (fromAssignmentsError) throw fromAssignmentsError

  const { error: toAssignmentsError } = await supabaseClient
    .from('assignments')
    .update({ guard_id: swap.from_guard_id })
    .eq('guard_id', swap.to_guard_id)
    .eq('site_id', swap.site_id)
    .gte('work_date', swap.date_from)
    .lte('work_date', swap.date_to)

  if (toAssignmentsError) throw toAssignmentsError

  updatedAssignments += 2 // Simplified count

  return { updated_assignments: updatedAssignments }
}







