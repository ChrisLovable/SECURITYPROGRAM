import { Guard, Site, Assignment, Swap, Notification, LeaveRequest, UserRole, Employee, LeavePeriod } from './database'

// Re-export types for easier access
export type { Guard, Site, Assignment, Swap, Notification, LeaveRequest, UserRole, Employee, LeavePeriod }

export interface GuardWithSite extends Guard {
  site?: Site
}

export interface AssignmentWithDetails extends Assignment {
  guard?: Guard
  site: Site
}

export interface SwapWithDetails extends Swap {
  from_guard: Guard
  to_guard: Guard
  site: Site
}

export interface NotificationWithGuard extends Notification {
  guard?: Guard
}

export interface LeaveRequestWithGuard extends LeaveRequest {
  guard?: Guard
}

export interface UserRoleWithGuard extends UserRole {
  guard?: Guard
}

export interface RosterDay {
  date: string
  assignments: AssignmentWithDetails[]
  unfilled: number
}

export interface CoverageStats {
  total_posts: number
  filled_posts: number
  unfilled_posts: number
  coverage_percentage: number
}

export interface OptimizeRequest {
  start_date: string
  days: number
}

export interface OptimizeResponse {
  success: boolean
  assignments_created: number
  unfilled_gaps: number
  message: string
}

export interface ResourcingAnalysis {
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
}

// Constants
export const CYCLE_LENGTH = 72 // 60 ON + 12 OFF
export const ON_DUTY_DAYS = 60
export const OFF_DUTY_DAYS = 12
export const TIMEZONE = 'Africa/Johannesburg'
export const TOTAL_GUARDS = 69
export const TOTAL_POSTS = 39

export type GuardStatus = 'ON' | 'OFF'
export type AssignmentStatus = Assignment['status']
export type SwapStatus = Swap['status']
export type LeaveRequestStatus = LeaveRequest['status']
export type LeaveType = LeaveRequest['leave_type']
export type UserRoleType = UserRole['role']
