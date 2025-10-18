import { createClient } from '@supabase/supabase-js'

// Environment variables with proper typing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'demo-key-for-testing'

// Show warning in development if using demo values
if ((import.meta as any).env?.DEV && (supabaseUrl === 'https://demo.supabase.co' || supabaseAnonKey === 'demo-key-for-testing')) {
  console.warn('🚨 Using demo Supabase credentials. Set up real Supabase for full functionality.')
  console.warn('📝 Create .env.local with your Supabase URL and anon key')
}

// Create untyped client for now to avoid TypeScript errors
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helpers
export const auth = {
  async signIn(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Guards
  async getGuards() {
    const { data, error } = await supabase
      .from('guards')
      .select('*')
      .eq('active', true)
      .order('badge')
    
    return { data, error }
  },

  async getGuard(id: string) {
    const { data, error } = await supabase
      .from('guards')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async updateGuard(id: string, updates: any) {
    const { data, error } = await supabase
      .from('guards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Sites
  async getSites() {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name')
    
    return { data, error }
  },

  async updateSite(id: string, updates: any) {
    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Assignments
  async getAssignments(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date')
    
    return { data, error }
  },

  async getAssignmentsForGuard(guardId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('guard_id', guardId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date')
    
    return { data, error }
  },

  // Swaps
  async getSwaps(status?: string) {
    let query = supabase
      .from('swaps')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createSwap(swap: any) {
    const { data, error } = await supabase
      .from('swaps')
      .insert(swap)
      .select()
      .single()
    
    return { data, error }
  },

  async approveSwap(swapId: string, approve: boolean) {
    const { data, error } = await supabase.functions.invoke('swaps-approve', {
      body: { swap_id: swapId, approve }
    })
    
    return { data, error }
  },

  // Notifications
  async getNotifications(guardId?: string) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('deliver_at', { ascending: false })

    if (guardId) {
      query = query.eq('guard_id', guardId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async scheduleNotification(notification: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    
    return { data, error }
  },

  // Optimization
  async optimizeRoster(startDate: string, days: number) {
    const { data, error } = await supabase.functions.invoke('optimize', {
      body: { start_date: startDate, days }
    })
    
    return { data, error }
  },

  // Leave Requests
  async getLeaveRequests(guardId?: string) {
    let query = supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (guardId) {
      query = query.eq('guard_id', guardId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createLeaveRequest(leaveRequest: any) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveRequest)
      .select()
      .single()
    
    return { data, error }
  },

  async updateLeaveRequest(id: string, updates: any) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // User Roles
  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  async createUserRole(userRole: any) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert(userRole)
      .select()
      .single()
    
    return { data, error }
  },

  // Coverage stats
  async getCoverageStats(date: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('status')
      .eq('work_date', date)
    
    if (error) return { data: null, error }

    const stats = {
      total_posts: 0,
      filled_posts: 0,
      unfilled_posts: 0
    }

    data?.forEach(assignment => {
      stats.total_posts++
      
      if (assignment.status === 'scheduled') {
        stats.filled_posts++
      } else if (assignment.status === 'unfilled') {
        stats.unfilled_posts++
      }
    })

    return { 
      data: {
        ...stats,
        coverage_percentage: stats.total_posts > 0 ? 
          Math.round((stats.filled_posts / stats.total_posts) * 100) : 0
      }, 
      error: null 
    }
  }
}