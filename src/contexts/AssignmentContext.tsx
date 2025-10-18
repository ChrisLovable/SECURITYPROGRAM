import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { shiftService, employeeService, siteService, ShiftAssignment } from '../services/supabaseService';

interface GuardAssignment {
  employee_id: string;
  site_id: string;
  employee_name: string;
  site_name: string;
}

interface AssignmentContextType {
  assignments: GuardAssignment[];
  loading: boolean;
  refreshAssignments: () => Promise<void>;
  updateAssignment: (employeeId: string, siteId: string) => Promise<void>;
  getAssignmentsForSite: (siteId: string) => GuardAssignment[];
  getAssignmentForEmployee: (employeeId: string) => GuardAssignment | undefined;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentProvider');
  }
  return context;
};

interface AssignmentProviderProps {
  children: ReactNode;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
  const [assignments, setAssignments] = useState<GuardAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshAssignments = async () => {
    try {
      setLoading(true);
      const [assignmentsData, employees, sites] = await Promise.all([
        shiftService.getShiftAssignments(),
        employeeService.getAllEmployees(),
        siteService.getAllSites()
      ]);

      // Create employee and site name mappings
      const employeeMap = new Map(employees.map(emp => [emp.id, emp.name]));
      const siteMap = new Map(sites.map(site => [site.id, site.name]));

      // Transform assignments to include names
      const assignmentsWithNames: GuardAssignment[] = assignmentsData.map(assignment => ({
        employee_id: assignment.employee_id,
        site_id: assignment.site_id,
        employee_name: employeeMap.get(assignment.employee_id) || 'Unknown Employee',
        site_name: siteMap.get(assignment.site_id) || 'Unknown Site'
      }));

      setAssignments(assignmentsWithNames);
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (employeeId: string, siteId: string) => {
    try {
      setLoading(true);
      
      // Check if assignment already exists
      const existingAssignments = await shiftService.getShiftAssignments();
      const existingAssignment = existingAssignments.find(
        assignment => assignment.employee_id === employeeId
      );
      
      if (existingAssignment) {
        // Update existing assignment
        await shiftService.updateShiftAssignment(existingAssignment.id, {
          employee_id: employeeId,
          site_id: siteId,
          assigned_date: existingAssignment.assigned_date,
          shift_type: existingAssignment.shift_type,
          notes: existingAssignment.notes
        });
      } else {
        // Create new assignment
        await shiftService.createShiftAssignment({
          employee_id: employeeId,
          site_id: siteId,
          assigned_date: new Date().toISOString().split('T')[0],
          shift_type: 'day',
          notes: 'Auto-assigned by Guard Intelligence System'
        });
      }
      
      // Refresh assignments after update
      await refreshAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentsForSite = (siteId: string) => {
    return assignments.filter(assignment => assignment.site_id === siteId);
  };

  const getAssignmentForEmployee = (employeeId: string) => {
    return assignments.find(assignment => assignment.employee_id === employeeId);
  };

  // Initial load
  useEffect(() => {
    refreshAssignments();
  }, []);

  const value: AssignmentContextType = {
    assignments,
    loading,
    refreshAssignments,
    updateAssignment,
    getAssignmentsForSite,
    getAssignmentForEmployee
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};
