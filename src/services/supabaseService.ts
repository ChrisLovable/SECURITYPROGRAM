import { supabase } from '../lib/supabase'

// Simplified service that only includes working database operations
export const siteService = {
  async getAllSites(): Promise<any[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getSite(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createSite(site: any): Promise<any> {
    const { data, error } = await supabase
      .from('sites')
      .insert([site])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSite(id: string, updates: any): Promise<any> {
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
  async getAllGuards(): Promise<any[]> {
    const { data, error } = await supabase
      .from('guards')
      .select('*')
      .order('badge')
    
    if (error) throw error
    return data || []
  },

  async createGuard(guard: any): Promise<any> {
    const { data, error } = await supabase
      .from('guards')
      .insert([guard])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGuard(id: string, updates: any): Promise<any> {
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
  async getAssignments(date?: string): Promise<any[]> {
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

  async createAssignment(assignment: any): Promise<any> {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAssignment(id: string, updates: any): Promise<any> {
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
  async getSwaps(): Promise<any[]> {
    const { data, error } = await supabase
      .from('swaps')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createSwap(swap: any): Promise<any> {
    const { data, error } = await supabase
      .from('swaps')
      .insert([swap])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSwap(id: string, updates: any): Promise<any> {
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
  async getActiveEmployees(): Promise<any[]> {
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
  },
  async getFirearmDetails(id: string): Promise<any> {
    return null
  },
  async getFirearmsByEmployee(employeeId: string): Promise<any[]> {
    return []
  },
  async assignFirearm(firearmId: string, employeeId: string): Promise<any> {
    return null
  }
}

export const gearService = {
  async getRestPeriods(): Promise<any[]> {
    return []
  },
  async getLeavePeriods(): Promise<any[]> {
    return []
  },
  async createRestPeriod(restPeriod: any): Promise<any> {
    return restPeriod
  },
  async createLeavePeriod(leavePeriod: any): Promise<any> {
    return leavePeriod
  },
  async updateRestPeriod(id: string, updates: any): Promise<any> {
    return updates
  },
  async updateLeavePeriod(id: string, updates: any): Promise<any> {
    return updates
  }
}