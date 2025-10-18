export interface Database {
  public: {
    Tables: {
      guards: {
        Row: {
          id: string
          badge: string
          full_name: string
          phone: string | null
          permanent_site_id: string | null
          in_rotation: boolean
          cycle_start: string // date
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          badge: string
          full_name: string
          phone?: string | null
          permanent_site_id?: string | null
          in_rotation?: boolean
          cycle_start: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          badge?: string
          full_name?: string
          phone?: string | null
          permanent_site_id?: string | null
          in_rotation?: boolean
          cycle_start?: string
          active?: boolean
          created_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          required_base: number
          required_relief: number
          permanent_only: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          required_base: number
          required_relief: number
          permanent_only?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          required_base?: number
          required_relief?: number
          permanent_only?: boolean
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          site_id: string
          guard_id: string | null
          work_date: string
          shift: string
          status: 'scheduled' | 'unfilled' | 'leave' | 'sick'
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          guard_id?: string | null
          work_date: string
          shift?: string
          status?: 'scheduled' | 'unfilled' | 'leave' | 'sick'
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          guard_id?: string | null
          work_date?: string
          shift?: string
          status?: 'scheduled' | 'unfilled' | 'leave' | 'sick'
          created_at?: string
        }
      }
      swaps: {
        Row: {
          id: string
          from_guard_id: string
          to_guard_id: string
          date_from: string
          date_to: string
          site_id: string
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          from_guard_id: string
          to_guard_id: string
          date_from: string
          date_to: string
          site_id: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          from_guard_id?: string
          to_guard_id?: string
          date_from?: string
          date_to?: string
          site_id?: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          guard_id: string | null
          title: string
          body: string
          deliver_at: string
          delivered: boolean
          created_at: string
        }
        Insert: {
          id?: string
          guard_id?: string | null
          title: string
          body: string
          deliver_at: string
          delivered?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          guard_id?: string | null
          title?: string
          body?: string
          deliver_at?: string
          delivered?: boolean
          created_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          guard_id: string
          leave_type: 'sick' | 'vacation' | 'personal' | 'training' | 'emergency'
          start_date: string
          end_date: string
          reason: string | null
          status: 'pending' | 'supervisor_approved' | 'manager_approved' | 'rejected'
          supervisor_notes: string | null
          manager_notes: string | null
          supervisor_approved_at: string | null
          manager_approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          guard_id: string
          leave_type: 'sick' | 'vacation' | 'personal' | 'training' | 'emergency'
          start_date: string
          end_date: string
          reason?: string | null
          status?: 'pending' | 'supervisor_approved' | 'manager_approved' | 'rejected'
          supervisor_notes?: string | null
          manager_notes?: string | null
          supervisor_approved_at?: string | null
          manager_approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          guard_id?: string
          leave_type?: 'sick' | 'vacation' | 'personal' | 'training' | 'emergency'
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: 'pending' | 'supervisor_approved' | 'manager_approved' | 'rejected'
          supervisor_notes?: string | null
          manager_notes?: string | null
          supervisor_approved_at?: string | null
          manager_approved_at?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          guard_id: string | null
          role: 'guard' | 'supervisor' | 'manager' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          guard_id?: string | null
          role: 'guard' | 'supervisor' | 'manager' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          guard_id?: string | null
          role?: 'guard' | 'supervisor' | 'manager' | 'admin'
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          employee_number: string
          name: string
          psira_number?: string
          id_number?: string
          cellphone_number?: string
          email?: string
          address?: string
          bank_details?: string
          medical_aid?: string
          next_of_kin?: string
          next_of_kin_number?: string
          emergency_contact?: string
          emergency_contact_number?: string
          appointment_date?: string
          experience_level?: string
          status: 'active' | 'inactive' | 'terminated'
          performance_rating?: number
          qualifications?: string[]
          languages?: string[]
          skills?: string[]
          notes?: string
          photo_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_number: string
          name: string
          psira_number?: string
          id_number?: string
          cellphone_number?: string
          email?: string
          address?: string
          bank_details?: string
          medical_aid?: string
          next_of_kin?: string
          next_of_kin_number?: string
          emergency_contact?: string
          emergency_contact_number?: string
          appointment_date?: string
          experience_level?: string
          status?: 'active' | 'inactive' | 'terminated'
          performance_rating?: number
          qualifications?: string[]
          languages?: string[]
          skills?: string[]
          notes?: string
          photo_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_number?: string
          name?: string
          psira_number?: string
          id_number?: string
          cellphone_number?: string
          email?: string
          address?: string
          bank_details?: string
          medical_aid?: string
          next_of_kin?: string
          next_of_kin_number?: string
          emergency_contact?: string
          emergency_contact_number?: string
          appointment_date?: string
          experience_level?: string
          status?: 'active' | 'inactive' | 'terminated'
          performance_rating?: number
          qualifications?: string[]
          languages?: string[]
          skills?: string[]
          notes?: string
          photo_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      leave_periods: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'rest_day' | 'annual_leave' | 'sick_leave' | 'emergency_leave'
          start_date: string
          end_date: string
          days_count: number
          reason?: string
          approved_by?: string
          approved_at?: string
          status: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: 'rest_day' | 'annual_leave' | 'sick_leave' | 'emergency_leave'
          start_date: string
          end_date: string
          days_count?: number
          reason?: string
          approved_by?: string
          approved_at?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'rest_day' | 'annual_leave' | 'sick_leave' | 'emergency_leave'
          start_date?: string
          end_date?: string
          days_count?: number
          reason?: string
          approved_by?: string
          approved_at?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Guard = Database['public']['Tables']['guards']['Row']
export type Site = Database['public']['Tables']['sites']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type Swap = Database['public']['Tables']['swaps']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type LeavePeriod = Database['public']['Tables']['leave_periods']['Row']
