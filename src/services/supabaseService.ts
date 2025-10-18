import { supabase } from '../lib/supabase'
import { Guard, Site, Assignment, Swap, Notification, LeaveRequest, UserRole } from '../types'

// Simplified service that only includes working database operations
export const siteService = {
  async getAllSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async createSite(site: Omit<Site, 'id' | 'created_at'>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .insert([site])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSite(id: string, updates: Partial<Site>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const guardService = {
  async getAllGuards(): Promise<Guard[]> {
    const { data, error } = await supabase
      .from('guards')
      .select('*')
      .order('badge')
    
    if (error) throw error
    return data || []
  },

  async createGuard(guard: Omit<Guard, 'id' | 'created_at'>): Promise<Guard> {
    const { data, error } = await supabase
      .from('guards')
      .insert([guard])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGuard(id: string, updates: Partial<Guard>): Promise<Guard> {
    const { data, error } = await supabase
      .from('guards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGuard(id: string): Promise<void> {
    const { error } = await supabase
      .from('guards')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const assignmentService = {
  async getAssignments(date?: string): Promise<Assignment[]> {
    let query = supabase
      .from('assignments')
      .select('*')
      .order('work_date')
    
    if (date) {
      query = query.eq('work_date', date)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const swapService = {
  async getSwaps(): Promise<Swap[]> {
    const { data, error } = await supabase
      .from('swaps')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createSwap(swap: Omit<Swap, 'id' | 'created_at'>): Promise<Swap> {
    const { data, error } = await supabase
      .from('swaps')
      .insert([swap])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSwap(id: string, updates: Partial<Swap>): Promise<Swap> {
    const { data, error } = await supabase
      .from('swaps')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSwap(id: string): Promise<void> {
    const { error } = await supabase
      .from('swaps')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Placeholder services for features not yet implemented
export const employeeService = {
  async getAllEmployees(): Promise<any[]> {
    return []
  },
  async createEmployee(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async updateEmployee(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async deleteEmployee(): Promise<void> {
    throw new Error('Not implemented yet')
  }
}

export const leaveService = {
  async getLeavePeriods(): Promise<any[]> {
    return []
  },
  async createLeavePeriod(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async updateLeavePeriod(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async deleteLeavePeriod(): Promise<void> {
    throw new Error('Not implemented yet')
  }
}

export const inventoryService = {
  async getAllItems(): Promise<any[]> {
    return []
  },
  async createItem(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async updateItem(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async deleteItem(): Promise<void> {
    throw new Error('Not implemented yet')
  }
}

export const firearmService = {
  async getAllFirearms(): Promise<any[]> {
    return []
  },
  async createFirearm(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async updateFirearm(): Promise<any> {
    throw new Error('Not implemented yet')
  },
  async deleteFirearm(): Promise<void> {
    throw new Error('Not implemented yet')
  }
}