import { useState, useMemo, useEffect, useCallback } from 'react';
import { employeeService, siteService, gearService } from '../services/supabaseService';
import { useAssignments } from '../contexts/AssignmentContext';

interface GuardTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Employee {
  id: string;
  name: string;
  employee_number: string;
  psira_number: string;
  status: string;
  appointment_date: string;
  experience_level: string;
}

interface Site {
  id: string;
  name: string;
}

interface RestPeriod {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface LeavePeriod {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
}

interface GuardAvailability {
  employee: Employee;
  status: 'available' | 'on-shift' | 'on-rest' | 'on-leave';
  site?: string;
  restPeriod?: RestPeriod;
  leavePeriod?: LeavePeriod;
}

export default function GuardTimetableModal({ isOpen, onClose }: GuardTimetableModalProps) {
  const { assignments, loading, updateAssignment, getAssignmentForEmployee } = useAssignments();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [leavePeriod, setLeavePeriod] = useState(30); // Days to look ahead for upcoming leave
  const [siteName, setSiteName] = useState('');
  const [activeTab, setActiveTab] = useState<'availability' | 'rest' | 'leave' | 'current-leave'>('availability');
  const [guardAssignments, setGuardAssignments] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [restPeriods, setRestPeriods] = useState<RestPeriod[]>([]);
  const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataConflicts, setDataConflicts] = useState<Array<{
    employeeName: string;
    employeeId: string;
    conflictType: 'overlapping_periods' | 'invalid_dates';
    restPeriod?: RestPeriod;
    leavePeriod?: LeavePeriod;
    conflictDates: string[];
    severity: 'warning' | 'error';
  }>>([]);

  // Function to detect data conflicts
  const detectDataConflicts = useCallback((employees: Employee[], restPeriods: RestPeriod[], leavePeriods: LeavePeriod[]) => {
    const conflicts: Array<{
      employeeName: string;
      employeeId: string;
      conflictType: 'overlapping_periods' | 'invalid_dates';
      restPeriod?: RestPeriod;
      leavePeriod?: LeavePeriod;
      conflictDates: string[];
      severity: 'warning' | 'error';
    }> = [];

    employees.forEach(employee => {
      // Find all rest and leave periods for this employee
      const employeeRestPeriods = restPeriods.filter(rp => rp.employee_id === employee.id);
      const employeeLeavePeriods = leavePeriods.filter(lp => lp.employee_id === employee.id);

      // Check for overlapping rest and leave periods
      employeeRestPeriods.forEach(restPeriod => {
        employeeLeavePeriods.forEach(leavePeriod => {
          const restStart = new Date(restPeriod.start_date);
          const restEnd = new Date(restPeriod.end_date);
          const leaveStart = new Date(leavePeriod.start_date);
          const leaveEnd = new Date(leavePeriod.end_date);

          // Check if periods overlap
          if (restStart <= leaveEnd && leaveStart <= restEnd) {
            // Calculate overlapping dates
            const overlapStart = new Date(Math.max(restStart.getTime(), leaveStart.getTime()));
            const overlapEnd = new Date(Math.min(restEnd.getTime(), leaveEnd.getTime()));
            const conflictDates: string[] = [];
            
            // Generate all overlapping dates
            for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
              conflictDates.push(d.toISOString().split('T')[0]);
            }

            conflicts.push({
              employeeName: employee.name,
              employeeId: employee.id,
              conflictType: 'overlapping_periods',
              restPeriod,
              leavePeriod,
              conflictDates,
              severity: 'error'
            });
          }
        });
      });

      // Check for invalid date ranges (end before start)
      [...employeeRestPeriods, ...employeeLeavePeriods].forEach(period => {
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
        
        if (endDate < startDate) {
          conflicts.push({
            employeeName: employee.name,
            employeeId: employee.id,
            conflictType: 'invalid_dates',
            restPeriod: 'start_date' in period ? period as RestPeriod : undefined,
            leavePeriod: 'leave_type' in period ? period as LeavePeriod : undefined,
            conflictDates: [period.start_date, period.end_date],
            severity: 'error'
          });
        }
      });
    });

    return conflicts;
  }, []);

  // Load all data from database
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        setDataLoading(true);
        console.log('🔄 Loading Guard Timetable data...');
        
        const [employeesData, sitesData, restData, leaveData] = await Promise.all([
          employeeService.getActiveEmployees().catch(err => {
            console.error('❌ Error loading employees:', err);
            console.error('❌ Employee error details:', err.message, err.code, err.details);
            return [];
          }),
          siteService.getAllSites().catch(err => {
            console.error('❌ Error loading sites:', err);
            console.error('❌ Site error details:', err.message, err.code, err.details);
            return [];
          }),
          gearService.getRestPeriods().catch(err => {
            console.error('❌ Error loading rest periods:', err);
            console.error('❌ Rest period error details:', err.message, err.code, err.details);
            return [];
          }),
          gearService.getLeavePeriods().catch(err => {
            console.error('❌ Error loading leave periods:', err);
            console.error('❌ Leave period error details:', err.message, err.code, err.details);
            return [];
          })
        ]);
        
        console.log('📊 Data loaded:', {
          employees: employeesData.length,
          sites: sitesData.length,
          restPeriods: restData.length,
          leavePeriods: leaveData.length
        });
        
        // Log first few employees to verify data
        console.log('👥 First 3 employees:', employeesData.slice(0, 3));
        console.log('📅 First 3 rest periods:', restData.slice(0, 3));
        console.log('✈️ First 3 leave periods:', leaveData.slice(0, 3));
        
        setEmployees(employeesData);
        setSites(sitesData);
        setRestPeriods(restData);
        setLeavePeriods(leaveData);
        
        // Initialize guard assignments from global context
        const assignmentMap: Record<string, string> = {};
        employeesData.forEach(employee => {
          const assignment = getAssignmentForEmployee(employee.id);
          if (assignment) {
            assignmentMap[employee.id] = assignment.site_name;
          }
        });
        setGuardAssignments(assignmentMap);
        
        // Detect data conflicts
        const conflicts = detectDataConflicts(employeesData, restData, leaveData);
        setDataConflicts(conflicts);
        
        if (conflicts.length > 0) {
          console.warn('⚠️ Data conflicts detected:', conflicts);
        }
        
        console.log('✅ Guard Timetable data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading Guard Timetable data:', error);
        alert(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [isOpen, assignments, getAssignmentForEmployee]);

  // Handle site assignment changes
  const handleSiteAssignment = (employeeId: string, newSite: string) => {
    setGuardAssignments(prev => ({
      ...prev,
      [employeeId]: newSite
    }));
  };

  // Save guard assignments to database using global context
  const handleSaveAssignments = async () => {
    try {
      // Create site name to ID mapping
      const siteNameToId: Record<string, string> = {};
      sites.forEach(site => {
        siteNameToId[site.name] = site.id;
      });
      
      // Update each assignment using global context
      for (const [employeeId, siteName] of Object.entries(guardAssignments)) {
        if (siteName && siteName !== '') {
          const siteId = siteNameToId[siteName];
          
          if (siteId) {
            console.log('💾 Saving assignment:', { employeeId, siteName, siteId });
            await updateAssignment(employeeId, siteId);
          }
        }
      }
      
      alert('Guard assignments saved and refreshed successfully!');
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save guard assignments. Please try again.');
    }
  };

  // Generate next 60 days for date picker (2 months)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Calculate guard availability for selected date using REAL database data
  const guardAvailability = useMemo(() => {
    const availability: GuardAvailability[] = [];
    const selectedDateObj = new Date(selectedDate);
    
     console.log('🔍 Calculating availability for:', selectedDate, {
       employees: employees.length,
       restPeriods: restPeriods.length,
       leavePeriods: leavePeriods.length
     });
     
     // Log the selected date as a Date object
     console.log('📅 Selected date object:', selectedDateObj);
     console.log('📅 Selected date ISO string:', selectedDateObj.toISOString().split('T')[0]);
    
    employees.forEach(employee => {
      // Check if employee is on rest
      const restPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        selectedDateObj >= new Date(rp.start_date) &&
        selectedDateObj <= new Date(rp.end_date)
      );
      
      // Check if employee is on leave
      const leavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        selectedDateObj >= new Date(lp.start_date) &&
        selectedDateObj <= new Date(lp.end_date)
      );
      
      // Debug logging for rest periods
      if (restPeriod) {
        console.log('🛌 Daily View - Found rest period for:', employee.name, {
          start: restPeriod.start_date,
          end: restPeriod.end_date
        });
      }
      
      let status: 'available' | 'on-shift' | 'on-rest' | 'on-leave';
      let assignedSite: string | undefined;

      if (leavePeriod) {
        status = 'on-leave';
        assignedSite = 'On Leave';
        console.log(`📅 ${employee.name} is ON LEAVE:`, leavePeriod.start_date, 'to', leavePeriod.end_date);
      } else if (restPeriod) {
        status = 'on-rest';
        assignedSite = 'On Rest';
        console.log(`📅 ${employee.name} is ON REST:`, restPeriod.start_date, 'to', restPeriod.end_date);
      } else {
        status = 'available';
        assignedSite = 'Available';
      }

      availability.push({
        employee,
        status,
        site: assignedSite,
        restPeriod,
        leavePeriod
      });
    });

    const availableCount = availability.filter(a => a.status === 'available').length;
    const restCount = availability.filter(a => a.status === 'on-rest').length;
    const leaveCount = availability.filter(a => a.status === 'on-leave').length;
    
    console.log('📊 Availability summary:', {
      available: availableCount,
      onRest: restCount,
      onLeave: leaveCount,
      total: availability.length
    });

    console.log('📊 Daily View - Final counts:', {
      total: availability.length,
      available: availability.filter(a => a.status === 'available').length,
      onRest: availability.filter(a => a.status === 'on-rest').length,
      onLeave: availability.filter(a => a.status === 'on-leave').length
    });

    return availability;
  }, [selectedDate, employees, restPeriods, leavePeriods]);

  // Calculate guards currently on rest days using REAL database data
  const guardsOnRest = useMemo(() => {
    const restGuards: GuardAvailability[] = [];
    const selectedDateObj = new Date(selectedDate);
    
    console.log('🔍 On Rest Tab - Calculating rest guards for:', selectedDate, {
      employees: employees.length,
      restPeriods: restPeriods.length
    });
    
    employees.forEach(employee => {
      // Check if employee is on rest
      const restPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        selectedDateObj >= new Date(rp.start_date) &&
        selectedDateObj <= new Date(rp.end_date)
      );
      
      // Check if employee is on leave
      const leavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        selectedDateObj >= new Date(lp.start_date) &&
        selectedDateObj <= new Date(lp.end_date)
      );
      
      // Only add to rest guards if they have a rest period AND are not on leave
      // (prioritize leave over rest, same as Daily view)
      if (restPeriod && !leavePeriod) {
        console.log('🛌 On Rest Tab - Found rest period for:', employee.name, {
          start: restPeriod.start_date,
          end: restPeriod.end_date
        });
        restGuards.push({
          employee,
          status: 'on-rest',
          site: 'On Rest',
          restPeriod
        });
      } else if (restPeriod && leavePeriod) {
        console.log('🚫 On Rest Tab - Skipping', employee.name, 'because they are on leave:', {
          restStart: restPeriod.start_date,
          restEnd: restPeriod.end_date,
          leaveStart: leavePeriod.start_date,
          leaveEnd: leavePeriod.end_date
        });
      }
    });

    console.log('🛌 On Rest Tab - Total rest guards found:', restGuards.length);
    return restGuards;
  }, [selectedDate, employees, restPeriods, leavePeriods]);

  // Calculate guards with upcoming leave AND currently on rest using REAL database data
  const guardsWithUpcomingLeave = useMemo(() => {
    const upcomingLeave: GuardAvailability[] = [];
    const selectedDateObj = new Date(selectedDate);
    const nextPeriodDays = new Date(selectedDateObj);
    nextPeriodDays.setDate(nextPeriodDays.getDate() + leavePeriod);
    
    employees.forEach(employee => {
      // Check for upcoming leave periods
      const leavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        new Date(lp.start_date) >= selectedDateObj &&
        new Date(lp.start_date) <= nextPeriodDays
      );
      
      // Check for current rest periods
      const restPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        selectedDateObj >= new Date(rp.start_date) &&
        selectedDateObj <= new Date(rp.end_date)
      );
      
      if (leavePeriod) {
        upcomingLeave.push({
          employee,
          status: 'on-leave',
          site: 'Upcoming Leave',
          leavePeriod
        });
      } else if (restPeriod) {
        upcomingLeave.push({
          employee,
          status: 'on-rest',
          site: 'On Rest Days',
          restPeriod
        });
      }
    });

    return upcomingLeave;
  }, [selectedDate, leavePeriod, employees, leavePeriods, restPeriods]);

  // Calculate guards currently on annual leave using REAL database data
  const guardsCurrentlyOnLeave = useMemo(() => {
    const currentLeave: GuardAvailability[] = [];
    const selectedDateObj = new Date(selectedDate);
    
    employees.forEach(employee => {
      const leavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        selectedDateObj >= new Date(lp.start_date) &&
        selectedDateObj <= new Date(lp.end_date)
      );
      
      if (leavePeriod) {
        currentLeave.push({
          employee,
          status: 'on-leave',
          site: 'On Leave',
          leavePeriod
        });
      }
    });

    return currentLeave;
  }, [selectedDate, employees, leavePeriods]);

  // Filter guards by site name if provided
  const getFilteredData = (data: GuardAvailability[]) => {
    if (!siteName.trim()) return data;
    
    return data.filter(item => 
      item.site?.toLowerCase().includes(siteName.toLowerCase()) ||
      item.employee.name.toLowerCase().includes(siteName.toLowerCase())
    );
  };

  const filteredAvailability = useMemo(() => {
    return getFilteredData(guardAvailability);
  }, [guardAvailability, siteName]);

  const filteredRestGuards = useMemo(() => {
    return getFilteredData(guardsOnRest);
  }, [guardsOnRest, siteName]);

  const filteredUpcomingLeave = useMemo(() => {
    return getFilteredData(guardsWithUpcomingLeave);
  }, [guardsWithUpcomingLeave, siteName]);

  const filteredCurrentLeave = useMemo(() => {
    return getFilteredData(guardsCurrentlyOnLeave);
  }, [guardsCurrentlyOnLeave, siteName]);

  // Group by status
  const groupedAvailability = useMemo(() => {
    const grouped = {
      available: filteredAvailability.filter(item => item.status === 'available'),
      onRest: filteredAvailability.filter(item => item.status === 'on-rest'),
      onLeave: filteredAvailability.filter(item => item.status === 'on-leave')
    };
    return grouped;
  }, [filteredAvailability]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Guard Timetable</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Data Conflicts Alert */}
            {dataConflicts.length > 0 && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Data Conflicts Detected ({dataConflicts.length})
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p className="mb-2">The following employees have conflicting rest and leave periods:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {dataConflicts.map((conflict, index) => (
                            <li key={index}>
                              <strong>{conflict.employeeName}</strong>: 
                              {conflict.conflictType === 'overlapping_periods' ? (
                                <>
                                  {' '}Overlapping rest ({conflict.restPeriod?.start_date} to {conflict.restPeriod?.end_date}) 
                                  and leave ({conflict.leavePeriod?.start_date} to {conflict.leavePeriod?.end_date}) periods.
                                  <br />
                                  <span className="text-xs text-red-600">
                                    Conflicting dates: {conflict.conflictDates.slice(0, 3).join(', ')}
                                    {conflict.conflictDates.length > 3 && ` and ${conflict.conflictDates.length - 3} more...`}
                                  </span>
                                </>
                              ) : (
                                ` Invalid date range: ${conflict.conflictDates[0]} to ${conflict.conflictDates[1]}`
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-red-600">
                          <strong>Action Required:</strong> Please update the Personal Information modal to fix these conflicts. 
                          Leave periods take priority over rest periods in calculations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {dataLoading && (
              <div className="text-center py-4">
                <div className="text-blue-600">Loading data from database...</div>
              </div>
            )}

            {/* Controls */}
            <div className="mb-6 space-y-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'availability'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Daily
                </button>
                <button
                  onClick={() => setActiveTab('rest')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'rest'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🏖️ On Rest
                </button>
                <button
                  onClick={() => setActiveTab('current-leave')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'current-leave'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🏖️ On Leave
                </button>
                <button
                  onClick={() => setActiveTab('leave')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'leave'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Leave/Rest
                </button>
              </div>

              {/* Date Selector - only show for availability tab */}
              {activeTab === 'availability' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Selector for Rest Tab */}
              {activeTab === 'rest' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date to Check Rest Status
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Selector for Leave Tab */}
              {activeTab === 'leave' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date to Check Leave/Rest Status
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Look Ahead Period
                    </label>
                    <select
                      value={leavePeriod}
                      onChange={(e) => setLeavePeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={7}>Next 7 Days</option>
                      <option value={14}>Next 14 Days</option>
                      <option value={30}>Next 30 Days</option>
                      <option value={60}>Next 60 Days</option>
                      <option value={90}>Next 90 Days</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Date Selector for Current Leave Tab */}
              {activeTab === 'current-leave' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date to Check Currently on Leave
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Site Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Site Name or Guard Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Enter site name or guard name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Summary Cards - different for each tab */}
            {activeTab === 'availability' && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {groupedAvailability.available.length}
                  </div>
                  <div className="text-sm text-green-800">Available</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {groupedAvailability.onRest.length}
                  </div>
                  <div className="text-sm text-yellow-800">On Rest</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {groupedAvailability.onLeave.length}
                  </div>
                  <div className="text-sm text-red-800">On Leave</div>
                </div>
              </div>
            )}

            {activeTab === 'rest' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredRestGuards.length}
                </div>
                <div className="text-sm text-yellow-800">
                  Guards on Rest Days on {new Date(selectedDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {activeTab === 'leave' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredUpcomingLeave.length}
                </div>
                <div className="text-sm text-orange-800">
                  Guards on Leave/Rest Starting in Next {leavePeriod} Days from {new Date(selectedDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {activeTab === 'current-leave' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredCurrentLeave.length}
                </div>
                <div className="text-sm text-red-800">
                  Guards Currently on Annual Leave on {new Date(selectedDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Guard List */}
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* Daily Availability Tab */}
                {activeTab === 'availability' && (
                  <>
                    {/* Available Guards */}
                    {groupedAvailability.available.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          Available Guards ({groupedAvailability.available.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {groupedAvailability.available.map((item) => (
                            <div key={item.employee.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-green-900">{item.employee.name}</div>
                                <select
                                  value={guardAssignments[item.employee.id] || ''}
                                  onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-green-300 rounded bg-white text-green-800 focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                  <option value="">Select Site</option>
                                  {sites.map((site) => (
                                    <option key={site.id} value={site.name}>{site.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="text-sm text-green-700">
                                Employee #: {item.employee.employee_number}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Guards on Rest */}
                    {groupedAvailability.onRest.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                          Guards on Rest ({groupedAvailability.onRest.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {groupedAvailability.onRest.map((item) => (
                            <div key={item.employee.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-yellow-900">{item.employee.name}</div>
                                <select
                                  value={guardAssignments[item.employee.id] || ''}
                                  onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-yellow-300 rounded bg-white text-yellow-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                >
                                  <option value="">Select Site</option>
                                  {sites.map((site) => (
                                    <option key={site.id} value={site.name}>{site.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="text-sm text-yellow-700">
                                Rest until: {item.restPeriod ? new Date(item.restPeriod.end_date).toLocaleDateString() : 'Unknown'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Guards on Leave */}
                    {groupedAvailability.onLeave.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          Guards on Leave ({groupedAvailability.onLeave.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {groupedAvailability.onLeave.map((item) => (
                            <div key={item.employee.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-red-900">{item.employee.name}</div>
                                <select
                                  value={guardAssignments[item.employee.id] || ''}
                                  onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-red-300 rounded bg-white text-red-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                  <option value="">Select Site</option>
                                  {sites.map((site) => (
                                    <option key={site.id} value={site.name}>{site.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="text-sm text-red-700">
                                On annual leave from: {item.leavePeriod ? new Date(item.leavePeriod.start_date).toLocaleDateString() : 'Unknown'} until: {item.leavePeriod ? new Date(item.leavePeriod.end_date).toLocaleDateString() : 'Unknown'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Currently on Rest Tab */}
                {activeTab === 'rest' && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      Guards Currently on Rest Days ({filteredRestGuards.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredRestGuards.map((item) => (
                        <div key={item.employee.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-yellow-900">{item.employee.name}</div>
                            <select
                              value={guardAssignments[item.employee.id] || ''}
                              onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-yellow-300 rounded bg-white text-yellow-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            >
                              <option value="">Select Site</option>
                              {sites.map((site) => (
                                <option key={site.id} value={site.name}>{site.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-sm text-yellow-700">
                            Site: {item.site}
                          </div>
                          <div className="text-sm text-yellow-700">
                            Rest Period: {item.restPeriod ? `${new Date(item.restPeriod.start_date).toLocaleDateString()} - ${new Date(item.restPeriod.end_date).toLocaleDateString()}` : 'Unknown'}
                          </div>
                          <div className="text-sm text-yellow-700">
                            Days Remaining: {item.restPeriod ? Math.ceil((new Date(item.restPeriod.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Leave Tab */}
                {activeTab === 'leave' && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      Guards on Leave/Rest ({filteredUpcomingLeave.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredUpcomingLeave.map((item) => (
                        <div key={item.employee.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-orange-900">{item.employee.name}</div>
                            <select
                              value={guardAssignments[item.employee.id] || ''}
                              onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-orange-300 rounded bg-white text-orange-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">Select Site</option>
                              {sites.map((site) => (
                                <option key={site.id} value={site.name}>{site.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-sm text-orange-700">
                            Status: {item.status === 'on-leave' ? '🛌 On Leave' : '🏖️ On Rest'}
                          </div>
                          <div className="text-sm text-orange-700">
                            {item.status === 'on-leave' ? (
                              <>
                                Leave Starts: {item.leavePeriod ? new Date(item.leavePeriod.start_date).toLocaleDateString() : 'Unknown'}
                                <br />
                                Leave Ends: {item.leavePeriod ? new Date(item.leavePeriod.end_date).toLocaleDateString() : 'Unknown'}
                              </>
                            ) : (
                              <>
                                Rest Starts: {item.restPeriod ? new Date(item.restPeriod.start_date).toLocaleDateString() : 'Unknown'}
                                <br />
                                Rest Ends: {item.restPeriod ? new Date(item.restPeriod.end_date).toLocaleDateString() : 'Unknown'}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-orange-700">
                            Duration: {
                              item.status === 'on-leave' 
                                ? (item.leavePeriod ? Math.ceil((new Date(item.leavePeriod.end_date).getTime() - new Date(item.leavePeriod.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0)
                                : (item.restPeriod ? Math.ceil((new Date(item.restPeriod.end_date).getTime() - new Date(item.restPeriod.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0)
                            } days
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Leave Tab */}
                {activeTab === 'current-leave' && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      Guards Currently on Annual Leave ({filteredCurrentLeave.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredCurrentLeave.map((item) => (
                        <div key={item.employee.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-red-900">{item.employee.name}</div>
                            <select
                              value={guardAssignments[item.employee.id] || ''}
                              onChange={(e) => handleSiteAssignment(item.employee.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-red-300 rounded bg-white text-red-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                            >
                              <option value="">Select Site</option>
                              {sites.map((site) => (
                                <option key={site.id} value={site.name}>{site.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-sm text-red-700">
                            Site: {item.site}
                          </div>
                          <div className="text-sm text-red-700">
                            Leave Started: {item.leavePeriod ? new Date(item.leavePeriod.start_date).toLocaleDateString() : 'Unknown'}
                          </div>
                          <div className="text-sm text-red-700">
                            Leave Ends: {item.leavePeriod ? new Date(item.leavePeriod.end_date).toLocaleDateString() : 'Unknown'}
                          </div>
                          <div className="text-sm text-red-700">
                            Days Remaining: {item.leavePeriod ? Math.ceil((new Date(item.leavePeriod.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {((activeTab === 'availability' && filteredAvailability.length === 0) ||
                  (activeTab === 'rest' && filteredRestGuards.length === 0) ||
                  (activeTab === 'current-leave' && filteredCurrentLeave.length === 0) ||
                  (activeTab === 'leave' && filteredUpcomingLeave.length === 0)) && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-lg text-gray-600">No guards found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <button
              onClick={handleSaveAssignments}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              disabled={loading || dataLoading}
            >
              {loading || dataLoading ? 'Saving & Refreshing...' : '💾 Save & Refresh'}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}