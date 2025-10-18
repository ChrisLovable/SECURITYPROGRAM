import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OptimizeRequest {
  start_date: string
  days: number
}

interface OptimizeResponse {
  success: boolean
  assignments_created: number
  unfilled_gaps: number
  message: string
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
    const { start_date, days }: OptimizeRequest = await req.json()

    if (!start_date || !days) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: start_date, days' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch sites and guards
    const { data: sites, error: sitesError } = await supabaseClient
      .from('sites')
      .select('*')
      .eq('permanent_only', false)

    if (sitesError) throw sitesError

    const { data: guards, error: guardsError } = await supabaseClient
      .from('guards')
      .select('*')
      .eq('active', true)

    if (guardsError) throw guardsError

    // Fetch existing assignments for the period
    const endDate = new Date(start_date)
    endDate.setDate(endDate.getDate() + days - 1)
    
    const { data: existingAssignments, error: assignmentsError } = await supabaseClient
      .from('assignments')
      .select('*')
      .gte('work_date', start_date)
      .lte('work_date', endDate.toISOString().split('T')[0])

    if (assignmentsError) throw assignmentsError

    // Run optimization algorithm
    const result = await optimizeRoster(
      sites,
      guards,
      existingAssignments || [],
      new Date(start_date),
      days
    )

    // Clear existing assignments for the period
    const { error: deleteError } = await supabaseClient
      .from('assignments')
      .delete()
      .gte('work_date', start_date)
      .lte('work_date', endDate.toISOString().split('T')[0])

    if (deleteError) throw deleteError

    // Insert new assignments
    if (result.assignments.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('assignments')
        .insert(result.assignments)

      if (insertError) throw insertError
    }

    const response: OptimizeResponse = {
      success: true,
      assignments_created: result.assignments.length,
      unfilled_gaps: result.unfilled_gaps,
      message: `Created ${result.assignments.length} assignments with ${result.unfilled_gaps} unfilled gaps`
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error optimizing roster:', error)
    
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

// Optimization algorithm (simplified version of the main algorithm)
async function optimizeRoster(
  sites: any[],
  guards: any[],
  existingAssignments: any[],
  startDate: Date,
  days: number
) {
  const assignments: any[] = []
  let unfilledGaps = 0

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + dayOffset)
    const dateStr = currentDate.toISOString().split('T')[0]
    
    // Get guards available today (simplified - just check cycle)
    const onDutyGuards = guards.filter(guard => {
      const cycleStart = new Date(guard.cycle_start)
      const daysSinceStart = Math.floor((currentDate.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))
      const cyclePosition = ((daysSinceStart % 72) + 72) % 72
      return cyclePosition < 60
    })

    const assignedToday = new Set<string>()
    
    // Fill assignments for each site
    for (const site of sites) {
      // Fill base posts
      for (let post = 0; post < site.required_base; post++) {
        const permanentGuard = onDutyGuards.find(
          g => g.permanent_site_id === site.id && !assignedToday.has(g.id)
        )
        
        if (permanentGuard) {
          assignments.push({
            site_id: site.id,
            guard_id: permanentGuard.id,
            work_date: dateStr,
            shift: 'day',
            status: 'scheduled'
          })
          assignedToday.add(permanentGuard.id)
        } else {
          const rotationGuard = onDutyGuards.find(
            g => g.in_rotation && !assignedToday.has(g.id)
          )
          
          if (rotationGuard) {
            assignments.push({
              site_id: site.id,
              guard_id: rotationGuard.id,
              work_date: dateStr,
              shift: 'day',
              status: 'scheduled'
            })
            assignedToday.add(rotationGuard.id)
          } else {
            assignments.push({
              site_id: site.id,
              guard_id: null,
              work_date: dateStr,
              shift: 'day',
              status: 'unfilled'
            })
            unfilledGaps++
          }
        }
      }
      
      // Fill relief posts
      for (let post = 0; post < site.required_relief; post++) {
        const rotationGuard = onDutyGuards.find(
          g => g.in_rotation && !assignedToday.has(g.id)
        )
        
        if (rotationGuard) {
          assignments.push({
            site_id: site.id,
            guard_id: rotationGuard.id,
            work_date: dateStr,
            shift: 'day',
            status: 'scheduled'
          })
          assignedToday.add(rotationGuard.id)
        } else {
          assignments.push({
            site_id: site.id,
            guard_id: null,
            work_date: dateStr,
            shift: 'day',
            status: 'unfilled'
          })
          unfilledGaps++
        }
      }
    }
  }

  return { assignments, unfilled_gaps: unfilledGaps }
}







