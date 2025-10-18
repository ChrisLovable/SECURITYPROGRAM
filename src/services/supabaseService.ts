import { supabase } from '../lib/supabase'

// Types matching your database schema
export interface Site {
  id: string
  name: string
  address?: string
  contact_person?: string
  contact_number?: string
  special_instructions?: string
  owner_number?: string
  manager_number?: string
  other_name_1?: string
  other_number_1?: string
  other_name_2?: string
  other_number_2?: string
  monthly_invoice_amount?: number
  bushveld_vehicle?: boolean
  owner_vehicle?: boolean
  assigned_guards?: string[]
  dont_work_with_guards?: string[]
  created_at: string
  updated_at: string
}

export interface Employee {
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

export interface LeavePeriod {
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

export interface ShiftAssignment {
  id: string
  employee_id: string
  site_id: string
  assigned_date: string
  shift_type?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface EmployeeGear {
  id: string
  employee_id: string
  torch: boolean
  rifle_make?: string
  rifle_model?: string
  uniform_issue_date?: string
  boots_issue_date?: string
  parka_issue_date?: string
  jersey_issue_date?: string
  cap_issue_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Site operations
export const siteService = {
  async getAllSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getSite(id: string): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createSite(site: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Promise<Site> {
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
  }
}

// Employee operations
export const employeeService = {
  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getActiveEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getEmployee(id: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ status: 'terminated' })
      .eq('id', id)
    
    if (error) throw error
  }
}

// Leave period operations
export const leaveService = {
  async getLeavePeriods(employeeId?: string): Promise<LeavePeriod[]> {
    let query = supabase
      .from('leave_periods')
      .select('*')
      .order('start_date')
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async createLeavePeriod(leave: Omit<LeavePeriod, 'id' | 'created_at' | 'updated_at' | 'days_count'>): Promise<LeavePeriod> {
    const { data, error } = await supabase
      .from('leave_periods')
      .insert([leave])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLeavePeriod(id: string, updates: Partial<LeavePeriod>): Promise<LeavePeriod> {
    const { data, error } = await supabase
      .from('leave_periods')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteLeavePeriod(id: string): Promise<void> {
    const { error } = await supabase
      .from('leave_periods')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Shift assignment operations
export const shiftService = {
  async getShiftAssignments(date?: string): Promise<ShiftAssignment[]> {
    let query = supabase
      .from('shift_assignments')
      .select(`
        *,
        employees:employee_id(name, employee_number),
        sites:site_id(name)
      `)
      .order('assigned_date')
    
    if (date) {
      query = query.eq('assigned_date', date)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async createShiftAssignment(assignment: Omit<ShiftAssignment, 'id' | 'created_at' | 'updated_at'>): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .insert([assignment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateShiftAssignment(id: string, updates: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteShiftAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('shift_assignments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Dashboard analytics
export const analyticsService = {
  async getDailyEmployeeCounts(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_employee_counts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
    
    if (error) throw error
    return data || []
  },

  async getEmployeeCurrentStatus() {
    const { data, error } = await supabase
      .from('employee_current_status')
      .select('*')
    
    if (error) throw error
    return data || []
  }
}

// Employee gear operations
export const gearService = {
  async getEmployeeGear(employeeId: string): Promise<EmployeeGear | null> {
    const { data, error } = await supabase
      .from('employee_gear')
      .select('*')
      .eq('employee_id', employeeId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  async createEmployeeGear(gear: Omit<EmployeeGear, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeGear> {
    const { data, error } = await supabase
      .from('employee_gear')
      .insert([gear])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateEmployeeGear(employeeId: string, updates: Partial<EmployeeGear>): Promise<EmployeeGear> {
    const { data, error } = await supabase
      .from('employee_gear')
      .update(updates)
      .eq('employee_id', employeeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async upsertEmployeeGear(employeeId: string, gear: Omit<EmployeeGear, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeGear> {
    const gearWithEmployeeId = { ...gear, employee_id: employeeId };
    const { data, error } = await supabase
      .from('employee_gear')
      .upsert(gearWithEmployeeId, { onConflict: 'employee_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Rest period methods
  async createRestPeriod(employeeId: string, restPeriod: { start_date: string; end_date: string; reason: string }): Promise<void> {
    const { error } = await supabase
      .from('rest_periods')
      .insert({
        employee_id: employeeId,
        start_date: restPeriod.start_date,
        end_date: restPeriod.end_date,
        reason: restPeriod.reason,
        approved_by: null,
        approved_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  async updateRestPeriod(id: string, updates: { start_date: string; end_date: string; reason: string }): Promise<void> {
    const { error } = await supabase
      .from('rest_periods')
      .update({
        start_date: updates.start_date,
        end_date: updates.end_date,
        reason: updates.reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Leave period methods
  async createLeavePeriod(employeeId: string, leavePeriod: { start_date: string; end_date: string; leave_type: string }): Promise<void> {
    const { error } = await supabase
      .from('leave_periods')
      .insert({
        employee_id: employeeId,
        start_date: leavePeriod.start_date,
        end_date: leavePeriod.end_date,
        leave_type: leavePeriod.leave_type,
        approved_by: null,
        approved_at: new Date().toISOString()
      });
    
    if (error) throw error;
  },

  async updateLeavePeriod(id: string, updates: { start_date: string; end_date: string; leave_type: string }): Promise<void> {
    const { error } = await supabase
      .from('leave_periods')
      .update({
        start_date: updates.start_date,
        end_date: updates.end_date,
        leave_type: updates.leave_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async getLeavePeriods(): Promise<LeavePeriod[]> {
    const { data, error } = await supabase
      .from('leave_periods')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getRestPeriods(): Promise<RestPeriod[]> {
    const { data, error } = await supabase
      .from('rest_periods')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Leave Balance Methods
  async getLeaveBalance(employeeId: string): Promise<number> {
    const { data, error } = await supabase
      .from('employees')
      .select('annual_leave_balance')
      .eq('id', employeeId)
      .single();
    
    if (error) throw error;
    return data?.annual_leave_balance || 0;
  },

  async getLeaveBalanceHistory(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('leave_balance_history')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateLeaveBalance(employeeId: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_leave_balance', {
      p_employee_id: employeeId
    });
    
    if (error) throw error;
  },

  async resetAllLeaveBalances(): Promise<void> {
    const { error } = await supabase.rpc('reset_annual_leave_balances');
    
    if (error) throw error;
  }
};

// Inventory Management Service
export const inventoryService = {
  // Inventory Items
  async getInventoryItems(): Promise<any[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getInventoryItemsByCategory(category: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createInventoryItem(item: any): Promise<any> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInventoryItem(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Equipment Assignments
  async getEquipmentAssignments(): Promise<any[]> {
    const { data, error } = await supabase
      .from('equipment_assignments')
      .select(`
        *,
        inventory_items:inventory_item_id(name, category, brand, model, serial_number),
        employees:employee_id(name)
      `)
      .order('assigned_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getEmployeeEquipment(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_employee_equipment', {
      p_employee_id: employeeId
    });
    
    if (error) throw error;
    return data || [];
  },

  async assignEquipment(inventoryItemId: string, employeeId: string, assignedBy: string, notes?: string): Promise<any> {
    const { data, error } = await supabase
      .from('equipment_assignments')
      .insert({
        inventory_item_id: inventoryItemId,
        employee_id: employeeId,
        assigned_by: assignedBy,
        assignment_notes: notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async returnEquipment(assignmentId: string, returnReason: string): Promise<any> {
    const { data, error } = await supabase
      .from('equipment_assignments')
      .update({
        return_date: new Date().toISOString().split('T')[0],
        return_reason: returnReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Maintenance Records
  async getMaintenanceRecords(itemId?: string): Promise<any[]> {
    let query = supabase
      .from('maintenance_records')
      .select('*')
      .order('maintenance_date', { ascending: false });
    
    if (itemId) {
      query = query.eq('inventory_item_id', itemId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createMaintenanceRecord(record: any): Promise<any> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Inventory Transactions
  async getInventoryTransactions(itemId?: string): Promise<any[]> {
    let query = supabase
      .from('inventory_transactions')
      .select(`
        *,
        employees:employee_id(name),
        inventory_items:inventory_item_id(name, category)
      `)
      .order('transaction_date', { ascending: false });
    
    if (itemId) {
      query = query.eq('inventory_item_id', itemId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getEquipmentHistory(itemId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_equipment_history', {
      p_item_id: itemId
    });
    
    if (error) throw error;
    return data || [];
  },

  // Inventory Statistics
  async getInventoryStats(): Promise<any> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('category, status');
    
    if (error) throw error;
    
    const stats: any = {};
    data?.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = { total: 0, available: 0, assigned: 0, maintenance: 0, damaged: 0 };
      }
      stats[item.category].total++;
      stats[item.category][item.status]++;
    });
    
    return stats;
  }
};

// Performance Notes Service
export const performanceService = {
  // Get performance notes for an employee
  async getEmployeePerformanceNotes(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_employee_performance_notes', {
      p_employee_id: employeeId
    });
    
    if (error) throw error;
    return data || [];
  },

  // Get performance summary for an employee
  async getEmployeePerformanceSummary(employeeId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_employee_performance_summary', {
      p_employee_id: employeeId
    });
    
    if (error) throw error;
    return data?.[0] || {
      total_notes: 0,
      positive_notes: 0,
      negative_notes: 0,
      improvement_notes: 0,
      warning_notes: 0,
      general_notes: 0,
      latest_note_date: null,
      latest_note_type: null
    };
  },

  // Create a new performance note
  async createPerformanceNote(note: {
    employee_id: string;
    note_date: string;
    note_text: string;
    note_type: string;
    created_by: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('performance_notes')
      .insert(note)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a performance note
  async updatePerformanceNote(id: string, updates: {
    note_date?: string;
    note_text?: string;
    note_type?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('performance_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a performance note
  async deletePerformanceNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('performance_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get all performance notes (for admin view)
  async getAllPerformanceNotes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('performance_notes')
      .select(`
        *,
        employees:employee_id(name)
      `)
      .order('note_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Firearm Inventory Service
export const firearmService = {
  // Get inventory summary statistics
  async getInventorySummary(): Promise<any> {
    const { data, error } = await supabase.rpc('get_firearm_inventory_summary');
    
    if (error) throw error;
    return data[0] || {
      total_firearms: 0,
      handguns: 0,
      shotguns: 0,
      rifles: 0,
      available_firearms: 0,
      assigned_firearms: 0,
      expiring_soon: 0
    };
  },

  // Get detailed firearm information with assignments
  async getFirearmDetails(): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_firearm_details');
    
    if (error) throw error;
    return data || [];
  },

  // Get all firearm types
  async getFirearmTypes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearm_types')
      .select('*')
      .order('category', { ascending: true })
      .order('type_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get firearms by type
  async getFirearmsByType(typeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearms')
      .select(`
        *,
        firearm_types:firearm_type_id(type_name, category)
      `)
      .eq('firearm_type_id', typeId)
      .order('serial_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get firearms by status
  async getFirearmsByStatus(status: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearms')
      .select(`
        *,
        firearm_types:firearm_type_id(type_name, category)
      `)
      .eq('status', status)
      .order('serial_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Assign firearm to employee
  async assignFirearm(firearmId: string, employeeId: string, siteId: string, assignedBy: string = 'System Admin'): Promise<boolean> {
    const { data, error } = await supabase.rpc('assign_firearm', {
      firearm_id_param: firearmId,
      employee_id_param: employeeId,
      site_id_param: siteId,
      assigned_by_param: assignedBy
    });
    
    if (error) throw error;
    return data;
  },

  // Unassign firearm
  async unassignFirearm(firearmId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('unassign_firearm', {
      firearm_id_param: firearmId
    });
    
    if (error) throw error;
    return data;
  },

  // Get firearm assignment history
  async getFirearmAssignmentHistory(firearmId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearm_assignments')
      .select(`
        *,
        employees:employee_id(name),
        sites:site_id(name)
      `)
      .eq('firearm_id', firearmId)
      .order('assigned_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get firearms expiring soon (within 30 days)
  async getFirearmsExpiringSoon(): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearms')
      .select(`
        *,
        firearm_types:firearm_type_id(type_name, category)
      `)
      .lte('license_expire_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('license_expire_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Update firearm status
  async updateFirearmStatus(firearmId: string, status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'police' | 'stolen' | 'lost'): Promise<void> {
    const { error } = await supabase
      .from('firearms')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', firearmId);
    
    if (error) throw error;
  },

  // Add new firearm
  async addFirearm(firearmData: {
    firearm_type_id: string;
    serial_number: string;
    license_start_date: string;
    license_expire_date: string;
    notes?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('firearms')
      .insert(firearmData)
      .select(`
        *,
        firearm_types:firearm_type_id(type_name, category)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update firearm information
  async updateFirearm(firearmId: string, updates: {
    serial_number?: string;
    license_start_date?: string;
    license_expire_date?: string;
    notes?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('firearms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', firearmId);
    
    if (error) throw error;
  },

  // Delete firearm (soft delete by marking as retired)
  async deleteFirearm(firearmId: string): Promise<void> {
    const { error } = await supabase
      .from('firearms')
      .update({ status: 'retired', updated_at: new Date().toISOString() })
      .eq('id', firearmId);
    
    if (error) throw error;
  },

  // Get firearms assigned to specific employee
  async getFirearmsByEmployee(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearm_assignments')
      .select(`
        *,
        firearms:firearm_id(
          *,
          firearm_types:firearm_type_id(type_name, category)
        ),
        sites:site_id(name)
      `)
      .eq('employee_id', employeeId)
      .order('assigned_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get firearms assigned to specific site
  async getFirearmsBySite(siteId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('firearm_assignments')
      .select(`
        *,
        firearms:firearm_id(
          *,
          firearm_types:firearm_type_id(type_name, category)
        ),
        employees:employee_id(name)
      `)
      .eq('site_id', siteId)
      .order('assigned_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Bulk data operations for importing your existing data
export const bulkDataService = {
  async importEmployees(employees: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[]): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employees)
      .select()
    
    if (error) throw error
    return data || []
  },

  async importLeavePeriods(leavePeriods: Omit<LeavePeriod, 'id' | 'created_at' | 'updated_at' | 'days_count'>[]): Promise<LeavePeriod[]> {
    const { data, error } = await supabase
      .from('leave_periods')
      .insert(leavePeriods)
      .select()
    
    if (error) throw error
    return data || []
  }
}
