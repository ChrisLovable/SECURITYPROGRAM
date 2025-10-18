import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key-for-testing'

// Show warning in development if using demo values
if (import.meta.env.DEV && (supabaseUrl === 'https://demo.supabase.co' || supabaseAnonKey === 'demo-key-for-testing')) {
  console.warn('🚨 Using demo Supabase credentials. Set up real Supabase for full functionality.')
  console.warn('📝 Create .env.local with your Supabase URL and anon key')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
      .select(`
        *,
        site:sites(*)
      `)
      .eq('active', true)
      .order('badge')
    
    return { data, error }
  },

  async getGuard(id: string) {
    const { data, error } = await supabase
      .from('guards')
      .select(`
        *,
        site:sites(*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async updateGuard(id: string, updates: Partial<Database['public']['Tables']['guards']['Update']>) {
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

  async updateSite(id: string, updates: Partial<Database['public']['Tables']['sites']['Update']>) {
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
      .select(`
        *,
        guard:guards(*),
        site:sites(*)
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date')
    
    return { data, error }
  },

  async getAssignmentsForGuard(guardId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        site:sites(*)
      `)
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
      .select(`
        *,
        from_guard:guards!swaps_from_guard_id_fkey(*),
        to_guard:guards!swaps_to_guard_id_fkey(*),
        site:sites(*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createSwap(swap: Database['public']['Tables']['swaps']['Insert']) {
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
      .select(`
        *,
        guard:guards(*)
      `)
      .order('deliver_at', { ascending: false })

    if (guardId) {
      query = query.eq('guard_id', guardId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async scheduleNotification(notification: Database['public']['Tables']['notifications']['Insert']) {
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
      .select(`
        *,
        guard:guards(*)
      `)
      .order('created_at', { ascending: false })

    if (guardId) {
      query = query.eq('guard_id', guardId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createLeaveRequest(leaveRequest: Database['public']['Tables']['leave_requests']['Insert']) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(leaveRequest)
      .select()
      .single()
    
    return { data, error }
  },

  async updateLeaveRequest(id: string, updates: Partial<Database['public']['Tables']['leave_requests']['Update']>) {
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
      .select(`
        *,
        guard:guards(*)
      `)
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  async createUserRole(userRole: Database['public']['Tables']['user_roles']['Insert']) {
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
      .select(`
        status,
        site:sites(required_base, required_relief)
      `)
      .eq('work_date', date)
    
    if (error) return { data: null, error }

    const stats = {
      total_posts: 0,
      filled_posts: 0,
      unfilled_posts: 0
    }

    data?.forEach(assignment => {
      const site = assignment.site as any
      const totalRequired = site.required_base + site.required_relief
      stats.total_posts += totalRequired
      
      if (assignment.status === 'scheduled') {
        stats.filled_posts++
      } else if (assignment.status === 'unfilled') {
        stats.unfilled_posts++
      }
    })

    stats.filled_posts = Math.min(stats.filled_posts, stats.total_posts)
    stats.unfilled_posts = Math.max(0, stats.total_posts - stats.filled_posts)

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
