import { differenceInDays, addDays, format } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { Guard, Site, Assignment, GuardStatus, CYCLE_LENGTH, ON_DUTY_DAYS, TIMEZONE } from '@/types'

/**
 * Determines if a guard is ON duty on a given day based on their cycle
 */
export function isOnDuty(cycleStart: Date, day: Date): boolean {
  const cycleStartUtc = zonedTimeToUtc(cycleStart, TIMEZONE)
  const dayUtc = zonedTimeToUtc(day, TIMEZONE)
  
  const daysSinceStart = differenceInDays(dayUtc, cycleStartUtc)
  const cyclePosition = ((daysSinceStart % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH
  
  return cyclePosition < ON_DUTY_DAYS
}

/**
 * Gets guard status (ON/OFF) for a specific date
 */
export function getGuardStatus(guard: Guard, date: Date): GuardStatus {
  return isOnDuty(new Date(guard.cycle_start), date) ? 'ON' : 'OFF'
}

/**
 * Gets the next ON duty date for a guard
 */
export function getNextOnDate(guard: Guard, fromDate: Date = new Date()): Date {
  let checkDate = fromDate
  let attempts = 0
  const maxAttempts = CYCLE_LENGTH * 2 // Safety limit
  
  while (attempts < maxAttempts) {
    if (isOnDuty(new Date(guard.cycle_start), checkDate)) {
      return checkDate
    }
    checkDate = addDays(checkDate, 1)
    attempts++
  }
  
  throw new Error(`Could not find next ON date for guard ${guard.badge}`)
}

/**
 * Gets the next OFF duty date for a guard
 */
export function getNextOffDate(guard: Guard, fromDate: Date = new Date()): Date {
  let checkDate = fromDate
  let attempts = 0
  const maxAttempts = CYCLE_LENGTH * 2 // Safety limit
  
  while (attempts < maxAttempts) {
    if (!isOnDuty(new Date(guard.cycle_start), checkDate)) {
      return checkDate
    }
    checkDate = addDays(checkDate, 1)
    attempts++
  }
  
  throw new Error(`Could not find next OFF date for guard ${guard.badge}`)
}

/**
 * Gets all guards who are ON duty on a specific date
 */
export function getOnDutyGuards(guards: Guard[], date: Date): Guard[] {
  return guards.filter(guard => 
    guard.active && isOnDuty(new Date(guard.cycle_start), date)
  )
}

/**
 * Gets all guards who are OFF duty on a specific date
 */
export function getOffDutyGuards(guards: Guard[], date: Date): Guard[] {
  return guards.filter(guard => 
    guard.active && !isOnDuty(new Date(guard.cycle_start), date)
  )
}

/**
 * Gets days worked by a guard at a specific site within a date range
 */
export function getDaysWorkedAtSite(
  assignments: Assignment[], 
  guardId: string, 
  siteId: string, 
  startDate: Date, 
  endDate: Date
): number {
  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')
  
  return assignments.filter(assignment => 
    assignment.guard_id === guardId &&
    assignment.site_id === siteId &&
    assignment.work_date >= startStr &&
    assignment.work_date <= endStr &&
    assignment.status === 'scheduled'
  ).length
}

/**
 * Gets total days worked by a guard within a date range
 */
export function getTotalDaysWorked(
  assignments: Assignment[], 
  guardId: string, 
  startDate: Date, 
  endDate: Date
): number {
  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')
  
  return assignments.filter(assignment => 
    assignment.guard_id === guardId &&
    assignment.work_date >= startStr &&
    assignment.work_date <= endStr &&
    assignment.status === 'scheduled'
  ).length
}

/**
 * Gets the last site a guard worked at (from assignments)
 */
export function getLastSiteWorked(
  assignments: Assignment[], 
  guardId: string, 
  beforeDate: Date
): string | null {
  const beforeStr = format(beforeDate, 'yyyy-MM-dd')
  
  const recentAssignments = assignments
    .filter(assignment => 
      assignment.guard_id === guardId &&
      assignment.work_date < beforeStr &&
      assignment.status === 'scheduled'
    )
    .sort((a, b) => b.work_date.localeCompare(a.work_date))
  
  return recentAssignments.length > 0 ? recentAssignments[0].site_id : null
}

/**
 * Calculates required minimum headcount based on posts and duty cycle
 */
export function calculateRequiredHeadcount(totalPosts: number): number {
  // 12/72 = 16.67% of guards are OFF duty at any time
  // So we need 100/83.33 = 1.2x the posts to ensure coverage
  return Math.ceil(totalPosts / 0.8334)
}

/**
 * Formats date for display in South African timezone
 */
export function formatDateSA(date: Date): string {
  const saDate = utcToZonedTime(date, TIMEZONE)
  return format(saDate, 'dd MMM yyyy')
}

/**
 * Formats date for display with day of week
 */
export function formatDateWithDay(date: Date): string {
  const saDate = utcToZonedTime(date, TIMEZONE)
  return format(saDate, 'EEE, dd MMM yyyy')
}

