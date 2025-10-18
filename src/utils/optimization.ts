import { addDays, format, differenceInDays } from 'date-fns'
import { Guard, Site, Assignment } from '@/types'
import { 
  isOnDuty, 
  getOnDutyGuards, 
  getDaysWorkedAtSite, 
  getTotalDaysWorked, 
  getLastSiteWorked 
} from './scheduling'

export interface OptimizationResult {
  assignments: Omit<Assignment, 'id' | 'created_at'>[]
  unfilled_gaps: number
  stats: {
    permanent_filled: number
    rotation_filled: number
    total_posts: number
  }
}

/**
 * Main roster optimization algorithm
 * Fills assignments for a date range using the business rules
 */
export function buildRoster(
  sites: Site[],
  guards: Guard[],
  existingAssignments: Assignment[],
  startDate: Date,
  days: number
): OptimizationResult {
  const assignments: Omit<Assignment, 'id' | 'created_at'>[] = []
  let unfilledGaps = 0
  let permanentFilled = 0
  let rotationFilled = 0

  // Calculate total posts per day
  const totalPostsPerDay = sites.reduce(
    (sum, site) => sum + site.required_base + site.required_relief, 
    0
  )

  // Process each day
  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDate = addDays(startDate, dayOffset)
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    
    // Get guards available today
    const onDutyGuards = getOnDutyGuards(guards, currentDate)
    const permanentGuards = onDutyGuards.filter(g => g.permanent_site_id)
    const rotationGuards = onDutyGuards.filter(g => !g.permanent_site_id && g.in_rotation)

    // Track which guards have been assigned today
    const assignedToday = new Set<string>()
    
    // Step 1: Fill permanent assignments first
    for (const site of sites) {
      // Fill base posts with permanent guards
      for (let post = 0; post < site.required_base; post++) {
        const permanentGuard = permanentGuards.find(
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
          permanentFilled++
        } else {
          // Try to fill with rotation guard
          const rotationGuard = findBestRotationGuard(
            rotationGuards,
            site,
            currentDate,
            existingAssignments,
            assignedToday
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
            rotationFilled++
          } else {
            // Unfilled gap
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
      
      // Fill relief posts with rotation guards only
      for (let post = 0; post < site.required_relief; post++) {
        const rotationGuard = findBestRotationGuard(
          rotationGuards,
          site,
          currentDate,
          existingAssignments,
          assignedToday
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
          rotationFilled++
        } else {
          // Unfilled gap
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

  return {
    assignments,
    unfilled_gaps: unfilledGaps,
    stats: {
      permanent_filled: permanentFilled,
      rotation_filled: rotationFilled,
      total_posts: totalPostsPerDay * days
    }
  }
}

/**
 * Finds the best rotation guard for a site using optimization criteria
 */
function findBestRotationGuard(
  availableGuards: Guard[],
  targetSite: Site,
  date: Date,
  existingAssignments: Assignment[],
  assignedToday: Set<string>
): Guard | null {
  const candidates = availableGuards.filter(g => !assignedToday.has(g.id))
  
  if (candidates.length === 0) return null
  
  // Score each candidate based on optimization criteria
  const scored = candidates.map(guard => {
    const lastSite = getLastSiteWorked(existingAssignments, guard.id, date)
    const daysWorkedAtSite = getDaysWorkedAtSite(
      existingAssignments, 
      guard.id, 
      targetSite.id, 
      addDays(date, -30), 
      date
    )
    const totalDaysWorked = getTotalDaysWorked(
      existingAssignments, 
      guard.id, 
      addDays(date, -90), 
      addDays(date, 90)
    )
    
    let score = 0
    
    // Prefer guards who worked at this site recently (stability)
    if (lastSite === targetSite.id) {
      score += 100
    }
    
    // Prefer guards with fewer recent days at this site (balance)
    score += (10 - daysWorkedAtSite) * 10
    
    // Prefer guards with fewer total days worked (fairness)
    score += (50 - totalDaysWorked) * 2
    
    return { guard, score }
  })
  
  // Sort by score (highest first) and return the best
  scored.sort((a, b) => b.score - a.score)
  return scored[0].guard
}

/**
 * Analyzes resourcing and provides optimization suggestions
 */
export function suggestOptimalResourcing(
  sites: Site[],
  guards: Guard[],
  assignments: Assignment[],
  analysisDays: number = 14
): {
  required_headcount: number
  available_headcount: number
  surplus: number
  risk_sites: Array<{
    site_id: string
    site_name: string
    gaps_next_14_days: number
  }>
  recommendations: Array<{
    type: 'permanent' | 'relief'
    site_id: string
    site_name: string
    reason: string
  }>
} {
  const totalPosts = sites.reduce(
    (sum, site) => sum + site.required_base + site.required_relief, 
    0
  )
  
  const requiredHeadcount = Math.ceil(totalPosts / 0.8334) // 83.33% availability
  const availableHeadcount = guards.filter(g => g.active).length
  const surplus = availableHeadcount - requiredHeadcount
  
  // Analyze risk sites (sites with unfilled gaps in next 14 days)
  const today = new Date()
  const riskSites = sites.map(site => {
    const gaps = assignments.filter(a => 
      a.site_id === site.id &&
      a.status === 'unfilled' &&
      new Date(a.work_date) >= today &&
      new Date(a.work_date) <= addDays(today, analysisDays)
    ).length
    
    return {
      site_id: site.id,
      site_name: site.name,
      gaps_next_14_days: gaps
    }
  }).filter(site => site.gaps_next_14_days > 0)
  
  // Generate recommendations
  const recommendations: Array<{
    type: 'permanent' | 'relief'
    site_id: string
    site_name: string
    reason: string
  }> = []
  
  // Recommend permanent guards for high-risk sites
  riskSites.forEach(site => {
    if (site.gaps_next_14_days > 5) {
      recommendations.push({
        type: 'permanent',
        site_id: site.site_id,
        site_name: site.site_name,
        reason: `High gap risk: ${site.gaps_next_14_days} unfilled days in next 14 days`
      })
    }
  })
  
  // Recommend relief posts for sites with no relief but high base requirements
  sites.forEach(site => {
    if (site.required_relief === 0 && site.required_base >= 3) {
      recommendations.push({
        type: 'relief',
        site_id: site.id,
        site_name: site.name,
        reason: `Large site (${site.required_base} posts) has no relief coverage`
      })
    }
  })
  
  return {
    required_headcount: requiredHeadcount,
    available_headcount: availableHeadcount,
    surplus,
    risk_sites: riskSites,
    recommendations
  }
}

