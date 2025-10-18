import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { employeeService, gearService } from '../services/supabaseService';

interface GuardIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyIntelligenceReport {
  report_date: string;
  starting_rest: number;
  ending_rest: number;
  starting_leave: number;
  ending_leave: number;
  sites_impacted: number;
  rest_starters: string[];
  rest_enders: string[];
  leave_starters: string[];
  leave_enders: string[];
  impacted_sites: string[];
}

interface CoverageConflict {
  assignment_id: string;
  site_id: string;
  site_name: string;
  employee_id: string;
  employee_name: string;
  assigned_date: string;
  shift_type: string;
  conflict_reason: string;
  conflict_start: string;
  conflict_end: string;
}

interface ReplacementCandidate {
  employee_id: string;
  employee_name: string;
  suitability_score: number;
  reasoning: {
    firearm_ok: boolean;
    driver_ok: boolean;
    site_familiarity: number;
    seniority_level: number;
    fatigue_score: number;
    performance_rating: number;
  };
}

interface IntelligenceAlert {
  id: string;
  type: 'coverage_conflict' | 'rest_prediction' | 'replacement_suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  site_name: string;
  employee_name: string;
  date: string;
  reason: string;
  suggestions: ReplacementCandidate[];
  created_at: string;
}

export default function GuardIntelligenceModal({ isOpen, onClose }: GuardIntelligenceModalProps) {
  const [dailyReports, setDailyReports] = useState<DailyIntelligenceReport[]>([]);
  const [coverageConflicts, setCoverageConflicts] = useState<CoverageConflict[]>([]);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'conflicts' | 'alerts'>('daily');
  const [selectedConflict, setSelectedConflict] = useState<CoverageConflict | null>(null);
  const [replacementCandidates, setReplacementCandidates] = useState<ReplacementCandidate[]>([]);
  
  // Guard availability data
  const [employees, setEmployees] = useState<any[]>([]);
  const [restPeriods, setRestPeriods] = useState<any[]>([]);
  const [leavePeriods, setLeavePeriods] = useState<any[]>([]);

  // Load intelligence data
  useEffect(() => {
    const loadIntelligenceData = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        
        // Load guard availability data
        const [employeesData, restData, leaveData] = await Promise.all([
          employeeService.getActiveEmployees().catch(err => {
            console.error('❌ Error loading employees:', err);
            return [];
          }),
          gearService.getRestPeriods().catch(err => {
            console.error('❌ Error loading rest periods:', err);
            return [];
          }),
          gearService.getLeavePeriods().catch(err => {
            console.error('❌ Error loading leave periods:', err);
            return [];
          })
        ]);

        setEmployees(employeesData);
        setRestPeriods(restData);
        setLeavePeriods(leaveData);
        
        // Load daily intelligence reports directly from Supabase
        const { data: reports, error: reportsError } = await supabase
          .from('v_daily_intelligence')
          .select('*')
          .gte('report_date', new Date().toISOString().split('T')[0])
          .lte('report_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('report_date');

        if (reportsError) {
          console.error('Error loading daily reports:', reportsError);
        } else {
          console.log('Daily reports loaded:', reports);
          setDailyReports(reports || []);
        }

        // Load coverage conflicts directly from Supabase
        const { data: conflicts, error: conflictsError } = await supabase
          .from('v_coverage_conflicts')
          .select('*')
          .gte('assigned_date', new Date().toISOString().split('T')[0])
          .order('assigned_date');

        if (conflictsError) {
          console.error('Error loading coverage conflicts:', conflictsError);
        } else {
          console.log('Coverage conflicts loaded:', conflicts);
          setCoverageConflicts(conflicts || []);
        }

        // Generate alerts from conflicts
        const generatedAlerts: IntelligenceAlert[] = (conflicts || []).map(conflict => ({
          id: conflict.assignment_id,
          type: 'coverage_conflict',
          severity: 'high',
          site_name: conflict.site_name,
          employee_name: conflict.employee_name,
          date: conflict.assigned_date,
          reason: conflict.conflict_reason,
          suggestions: [],
          created_at: new Date().toISOString()
        }));

        setAlerts(generatedAlerts);

      } catch (error) {
        console.error('Error loading intelligence data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntelligenceData();
  }, [isOpen]);

  // Calculate guard availability for selected date
  // Note: Guard availability calculation removed as it was unused

  // Helper function to calculate guard availability for a specific date
  const calculateGuardAvailabilityForDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    
    let availableCount = 0;
    let restCount = 0;
    let leaveCount = 0;
    
    // Lists for guards starting/ending periods on this date
    const guardsStartingRest: string[] = [];
    const guardsEndingRest: string[] = [];
    const guardsStartingLeave: string[] = [];
    const guardsEndingLeave: string[] = [];
    
    employees.forEach(employee => {
      // Check if employee is on rest
      const restPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        dateObj >= new Date(rp.start_date) &&
        dateObj <= new Date(rp.end_date)
      );
      
      // Check if employee is on leave
      const leavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        dateObj >= new Date(lp.start_date) &&
        dateObj <= new Date(lp.end_date)
      );
      
      // Check if employee is starting rest on this date
      const startingRestPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        new Date(rp.start_date).toDateString() === dateObj.toDateString()
      );
      
      // Check if employee is ending rest on this date
      const endingRestPeriod = restPeriods.find(rp => 
        rp.employee_id === employee.id &&
        new Date(rp.end_date).toDateString() === dateObj.toDateString()
      );
      
      // Check if employee is starting leave on this date
      const startingLeavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        new Date(lp.start_date).toDateString() === dateObj.toDateString()
      );
      
      // Check if employee is ending leave on this date
      const endingLeavePeriod = leavePeriods.find(lp => 
        lp.employee_id === employee.id &&
        new Date(lp.end_date).toDateString() === dateObj.toDateString()
      );
      
      // Add to appropriate lists
      if (startingRestPeriod) {
        guardsStartingRest.push(employee.name);
      }
      if (endingRestPeriod) {
        guardsEndingRest.push(employee.name);
      }
      if (startingLeavePeriod) {
        guardsStartingLeave.push(employee.name);
      }
      if (endingLeavePeriod) {
        guardsEndingLeave.push(employee.name);
      }
      
      // Count current status
      if (leavePeriod) {
        leaveCount++;
      } else if (restPeriod) {
        restCount++;
      } else {
        availableCount++;
      }
    });
    
    return {
      available: availableCount,
      onRest: restCount,
      onLeave: leaveCount,
      total: availableCount + restCount + leaveCount,
      guardsStartingRest,
      guardsEndingRest,
      guardsStartingLeave,
      guardsEndingLeave
    };
  };

  // Load replacement candidates for selected conflict
  const loadReplacementCandidates = async (conflict: CoverageConflict) => {
    try {
      const { data: candidates } = await supabase
        .rpc('find_replacement_candidates', {
          p_site_id: conflict.site_id,
          p_assigned_date: conflict.assigned_date,
          p_shift_type: conflict.shift_type
        });

      setReplacementCandidates(candidates || []);
    } catch (error) {
      console.error('Error loading replacement candidates:', error);
    }
  };

  // Handle conflict selection
  const handleConflictSelect = (conflict: CoverageConflict) => {
    setSelectedConflict(conflict);
    loadReplacementCandidates(conflict);
  };

  // Handle suggestion acceptance
  const handleAcceptSuggestion = async (conflict: CoverageConflict, candidate: ReplacementCandidate) => {
    try {
      // Update the assignment
      const { error } = await supabase
        .from('shift_assignments')
        .update({ employee_id: candidate.employee_id })
        .eq('id', conflict.assignment_id);

      if (error) throw error;

      // Create intelligence event
      await supabase
        .from('intelligence_events')
        .insert({
          event_type: 'replacement_suggestion',
          severity: 'medium',
          payload: {
            original_employee: conflict.employee_name,
            replacement_employee: candidate.employee_name,
            site_name: conflict.site_name,
            date: conflict.assigned_date,
            suitability_score: candidate.suitability_score
          },
          site_id: conflict.site_id,
          employee_id: candidate.employee_id
        });

      // Remove from conflicts list
      setCoverageConflicts(prev => prev.filter(c => c.assignment_id !== conflict.assignment_id));
      setSelectedConflict(null);
      setReplacementCandidates([]);

      alert(`✅ Successfully assigned ${candidate.employee_name} to ${conflict.site_name} on ${conflict.assigned_date}`);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      alert('❌ Failed to accept suggestion. Please try again.');
    }
  };

  // Generate narrative report for a specific date
  const generateNarrativeReport = (report: DailyIntelligenceReport) => {
    const date = new Date(report.report_date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let narrative = `📅 **${dayName}, ${dateStr}**\n\n`;

    // Rest periods
    if (report.starting_rest > 0 && report.rest_starters) {
      narrative += `🛌 **${report.starting_rest} guard(s) starting rest period:**\n`;
      report.rest_starters.forEach(name => {
        narrative += `   • ${name} - Beginning 12-day rest cycle\n`;
      });
      narrative += '\n';
    }

    if (report.ending_rest > 0 && report.rest_enders) {
      narrative += `🔄 **${report.ending_rest} guard(s) returning from rest:**\n`;
      report.rest_enders.forEach(name => {
        narrative += `   • ${name} - Ready for duty after rest period\n`;
      });
      narrative += '\n';
    }

    // Leave periods
    if (report.starting_leave > 0 && report.leave_starters) {
      narrative += `✈️ **${report.starting_leave} guard(s) starting leave:**\n`;
      report.leave_starters.forEach(name => {
        narrative += `   • ${name} - On approved leave\n`;
      });
      narrative += '\n';
    }

    if (report.ending_leave > 0 && report.leave_enders) {
      narrative += `🏠 **${report.ending_leave} guard(s) returning from leave:**\n`;
      report.leave_enders.forEach(name => {
        narrative += `   • ${name} - Back from leave, available for duty\n`;
      });
      narrative += '\n';
    }

    // Site impacts
    if (report.sites_impacted > 0 && report.impacted_sites) {
      narrative += `⚠️ **${report.sites_impacted} site(s) affected by absences:**\n`;
      report.impacted_sites.forEach(site => {
        narrative += `   • ${site} - Coverage may be impacted\n`;
      });
      narrative += '\n';
    }

    // Summary
    const totalAbsent = report.starting_rest + report.starting_leave;
    const totalReturning = report.ending_rest + report.ending_leave;
    
    if (totalAbsent > 0 || totalReturning > 0) {
      narrative += `📊 **Daily Summary:**\n`;
      narrative += `   • ${totalAbsent} guard(s) going off duty\n`;
      narrative += `   • ${totalReturning} guard(s) returning to duty\n`;
      narrative += `   • Net change: ${totalReturning - totalAbsent} guards\n`;
    }

    return narrative;
  };

  // Get conflicts for selected date
  // Note: Conflicts calculation removed as it was unused

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🧠 Guard Intelligence Center</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
            </div>

            {/* Navigation Tabs - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-lg ${
                  viewMode === 'daily' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📅 Daily Reports
              </button>
              <button
                onClick={() => setViewMode('conflicts')}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-lg ${
                  viewMode === 'conflicts' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⚠️ Conflicts ({coverageConflicts.length})
              </button>
              <button
                onClick={() => setViewMode('alerts')}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-lg ${
                  viewMode === 'alerts' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🚨 Alerts ({alerts.length})
              </button>
            </div>

            {/* Daily Reports View */}
            {viewMode === 'daily' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                  <label className="text-sm sm:text-lg font-semibold">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-lg w-full sm:w-auto"
                  />
                </div>


                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Analyzing guard intelligence...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyReports.map((report) => {
                      const isSelectedDate = report.report_date === selectedDate;
                      const hasActivity = report.starting_rest > 0 || report.ending_rest > 0 || 
                                        report.starting_leave > 0 || report.ending_leave > 0 || 
                                        report.sites_impacted > 0;
                      
                      // Calculate guard availability for this specific date
                      const guardCounts = calculateGuardAvailabilityForDate(report.report_date);

                      return (
                        <div 
                          key={report.report_date}
                          className={`border rounded-lg p-4 transition-all duration-200 ${
                            isSelectedDate 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : hasActivity 
                                ? 'border-yellow-300 bg-yellow-50' 
                                : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {new Date(report.report_date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </h3>
                            {hasActivity && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                Activity Detected
                              </span>
                            )}
                          </div>

                          {/* Guard Availability Counts for this date */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                              <div className="text-lg font-bold text-green-700">
                                {guardCounts.available}
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                Available
                              </div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-center">
                              <div className="text-lg font-bold text-yellow-700">
                                {guardCounts.onRest}
                              </div>
                              <div className="text-xs text-yellow-600 font-medium">
                                On Rest
                              </div>
                            </div>
                            <div className="bg-red-100 border border-red-300 rounded-lg p-2 text-center">
                              <div className="text-lg font-bold text-red-700">
                                {guardCounts.onLeave}
                              </div>
                              <div className="text-xs text-red-600 font-medium">
                                On Leave
                              </div>
                            </div>
                          </div>

                          {/* Guard Names for this date */}
                          {(guardCounts.guardsStartingRest.length > 0 || 
                            guardCounts.guardsEndingRest.length > 0 || 
                            guardCounts.guardsStartingLeave.length > 0 || 
                            guardCounts.guardsEndingLeave.length > 0) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Guard Movements:</h4>
                              
                              {/* Guards Starting Rest */}
                              {guardCounts.guardsStartingRest.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-medium text-yellow-700 mb-1">
                                    🛌 Starting Rest ({guardCounts.guardsStartingRest.length}):
                                  </div>
                                  <div className="text-xs text-gray-600 pl-2">
                                    {guardCounts.guardsStartingRest.join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              {/* Guards Ending Rest */}
                              {guardCounts.guardsEndingRest.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-medium text-green-700 mb-1">
                                    🔄 Returning from Rest ({guardCounts.guardsEndingRest.length}):
                                  </div>
                                  <div className="text-xs text-gray-600 pl-2">
                                    {guardCounts.guardsEndingRest.join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              {/* Guards Starting Leave */}
                              {guardCounts.guardsStartingLeave.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-medium text-red-700 mb-1">
                                    ✈️ Starting Leave ({guardCounts.guardsStartingLeave.length}):
                                  </div>
                                  <div className="text-xs text-gray-600 pl-2">
                                    {guardCounts.guardsStartingLeave.join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              {/* Guards Ending Leave */}
                              {guardCounts.guardsEndingLeave.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-medium text-blue-700 mb-1">
                                    🏠 Returning from Leave ({guardCounts.guardsEndingLeave.length}):
                                  </div>
                                  <div className="text-xs text-gray-600 pl-2">
                                    {guardCounts.guardsEndingLeave.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                            {generateNarrativeReport(report)}
                          </div>

                          {/* Quick stats - Mobile Responsive */}
                          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-red-600">{report.starting_rest + report.starting_leave}</div>
                              <div className="text-xs sm:text-sm text-gray-600">Going Off Duty</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-green-600">{report.ending_rest + report.ending_leave}</div>
                              <div className="text-xs sm:text-sm text-gray-600">Returning to Duty</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-blue-600">{report.sites_impacted}</div>
                              <div className="text-xs sm:text-sm text-gray-600">Sites Affected</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-purple-600">
                                {(report.ending_rest + report.ending_leave) - (report.starting_rest + report.starting_leave)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Net Change</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Coverage Conflicts View */}
            {viewMode === 'conflicts' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Coverage Conflicts Detected</h3>
                  <p className="text-red-700">
                    The following assignments have conflicts with scheduled rest periods or leave. 
                    Click on any conflict to see replacement suggestions.
                  </p>
                </div>

                {coverageConflicts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Coverage Conflicts</h3>
                    <p className="text-gray-600">All scheduled assignments are properly covered!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {coverageConflicts.map((conflict) => (
                      <div 
                        key={conflict.assignment_id}
                        className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleConflictSelect(conflict)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-red-800 text-lg">{conflict.site_name}</h4>
                            <p className="text-red-700">
                              <strong>{conflict.employee_name}</strong> - {new Date(conflict.assigned_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-red-600">
                              Conflict: {conflict.conflict_reason.replace('_', ' ')} 
                              ({new Date(conflict.conflict_start).toLocaleDateString()} - {new Date(conflict.conflict_end).toLocaleDateString()})
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
                              {conflict.shift_type}
                            </span>
                            <div className="mt-2">
                              <span className="text-sm text-red-600">Click for suggestions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Replacement Candidates Panel */}
                {selectedConflict && (
                  <div className="mt-6 border border-blue-200 rounded-lg p-6 bg-blue-50">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">
                      💡 Replacement Suggestions for {selectedConflict.site_name}
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Replacing <strong>{selectedConflict.employee_name}</strong> on {new Date(selectedConflict.assigned_date).toLocaleDateString()}
                    </p>

                    {replacementCandidates.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No suitable replacements found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {replacementCandidates.map((candidate, index) => (
                          <div key={candidate.employee_id} className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-semibold text-blue-800">#{index + 1}</span>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{candidate.employee_name}</h4>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                      ✅ Available
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAcceptSuggestion(selectedConflict, candidate)}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                              >
                                ✅ Accept & Assign
                              </button>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                              <strong>Reasoning:</strong> All guards are equally qualified for assignments
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedConflict(null);
                          setReplacementCandidates([]);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alerts View */}
            {viewMode === 'alerts' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">🚨 Intelligence Alerts</h3>
                  <p className="text-yellow-700">
                    Automated alerts generated by the Guard Intelligence System
                  </p>
                </div>

                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Alerts</h3>
                    <p className="text-gray-600">All systems are running smoothly!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-yellow-800 text-lg">{alert.site_name}</h4>
                            <p className="text-yellow-700">
                              <strong>{alert.employee_name}</strong> - {new Date(alert.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-yellow-600">Issue: {alert.reason.replace('_', ' ')}</p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-yellow-600">
                          Generated: {new Date(alert.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : '🔄 Refresh Intelligence'}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
