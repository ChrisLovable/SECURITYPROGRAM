import { useState, useEffect } from 'react';
import { employeeService, gearService, siteService, performanceService, firearmService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { useAssignments } from '../contexts/AssignmentContext';

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Site {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  employee_number: string;
  psira_number?: string;
  id_number?: string;
  cellphone_number?: string;
  appointment_date?: string;
  experience_level?: string;
  performance_rating?: number;
  qualifications?: string[];
  languages?: string[];
  skills?: string[];
  emergency_contact?: string;
  emergency_contact_number?: string;
  address?: string;
  bank_details?: string;
  medical_aid?: string;
  next_of_kin?: string;
  notes?: string;
  status?: 'active' | 'terminated' | 'inactive';
  annual_leave_balance?: number;
  leave_year?: number;
}

interface EmployeeGear {
  id?: string;
  employee_id: string;
  torch: boolean;
  rifle_make?: string;
  rifle_model?: string;
  rifle_serial_number?: string;
  uniform_issue_date?: string;
  boots_issue_date?: string;
  parka_issue_date?: string;
  jersey_issue_date?: string;
  cap_issue_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function PersonalInformationModal({ isOpen, onClose }: PersonalInformationModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateAssignment, refreshAssignments, getAssignmentForEmployee } = useAssignments();

  // Experience level mapping for each employee
  const employeeExperienceLevels: Record<string, string> = {
    'FRANS DANIEL': 'Veteran',
    'DANIEL KARUEMBI NDARA': 'Veteran',
    'MBWALE Tauma': 'Veteran',
    'THOMAS WALLACE': 'Experience',
    'LEONARD JONAS': 'Veteran',
    'SHALONGOJONAS (Danke)': 'Veteran',
    'MIKE NDISHISI (Mike Mike)': 'Veteran',
    'KAMAAI TJIVINDA': 'Veteran',
    'ANGULA MALAKIA': 'Veteran',
    'Macedo Munyachi Segunda': 'Experience',
    'BONIFASIUS LAZARUS': 'Veteran',
    'FICIMON NDOVALA': 'Veteran',
    'DAVID JOHANNES': 'Veteran',
    'JONAS NGIYONANYE (Fish)': 'Veteran',
    'VETOPOUUAMUTAMBO (Lucky)': 'Veteran',
    'IMMANUEL TVATLIFA': 'Veteran',
    'REN KAFIDI': 'Veteran',
    'Daniel SHILONGO': 'Veteran',
    'HTJIUHARO': 'Veteran',
    'PETRUS PAULUS MBAMBI': 'Veteran',
    'FERNANANDU BUSH': 'Veteran',
    'KANTANF N': 'Veteran',
    'JOHANNES HEKANDJO': 'Experience',
    'ALI LUS HAUFIKU': 'Experience',
    'Mayurdu A': 'Experience',
    'KAV Kakuva': 'Experience',
    'Nohannes S Ndala': 'Experience',
    'Homanus Karubora': 'Experience',
    'Linda Hadmbwasha (leo)': 'Experience',
    'Polrus Iyokulumc': 'Experience',
    'Novalo 1 ounc': 'Experience',
    'Perlus Gidoon': 'Experience',
    'John Josoph': 'Experience',
    'M Masutu': 'Experience',
    'Мокшакоще Касори FOMOS': 'Experience',
    'Thomes I wish': 'Experience',
    'Mascka Joseph Nomouram': 'Experience',
    'David Jons Katembo': 'Intermediate',
    'David Jont Katembo': 'Unknown',
    'Frans John Hennie': 'Experience',
    'Blasius Hidengwe': 'Experience',
    'Shahafifange Hpanduius (luke)': 'Experience',
    'Lukas Makua': 'Experience',
    'CMUkuw': 'Experience',
    'Daniel Kiino': 'Experience',
    'BP Moya (prince)': 'Experience',
    'Gabriel Antonius': 'Intermediate',
    'Oscar Visnjamba': 'Intermediate',
    'Leon Zasiman': 'Intermediate',
    'Thomas Nghishko': 'Intermediate',
    'Ndumba Mingandja': 'Intermediate',
    'Chambals Segunda': 'Intermediate',
    'Jonas Shefashke': 'Intermediate',
    'Jordan Frans': 'Intermediate',
    'Taleni Mangongo': 'Intermediate',
    'Al Magau': 'Intermediate',
    'Ndyolomimu M': 'Intermediate',
    'Jospephat Kitopha': 'Intermediate',
    'Augusto maguel Jamba': 'Intermediate',
    'PV Kalura': 'Intermediate',
    'Faustina Kawe': 'Intermediate',
    'Simson Shafodino': 'Intermediate',
    'Luis Shkolepo': 'Intermediate',
    'Aser Magongo': 'Intermediate',
    'EE Tobias': 'Intermediate',
    'Michael David Motshego': 'Intermediate',
    'Petrus Mwale': 'Intermediate',
    'Profilius Mwetupaka': 'Intermediate',
    'Bafana Tjjshurs': 'New Recruit'
  };

  // Load employees from database
  useEffect(() => {
    const loadEmployees = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const employeesData = await employeeService.getAllEmployees();
        
        // If no employees in database, create them from the provided names
        if (employeesData.length === 0) {
          const employeeNames = [
            'FRANS DANIEL', 'DANIEL KARUEMBI NDARA', 'MBWALE Tauma', 'THOMAS WALLACE', 'LEONARD JONAS',
            'SHALONGOJONAS (Danke)', 'MIKE NDISHISI (Mike Mike)', 'KAMAAI TJIVINDA', 'ANGULA MALAKIA', 'Macedo Munyachi Segunda',
            'BONIFASIUS LAZARUS', 'FICIMON NDOVALA', 'DAVID JOHANNES', 'JONAS NGIYONANYE (Fish)', 'VETOPOUUAMUTAMBO (Lucky)',
            'IMMANUEL TVATLIFA', 'REN KAFIDI', 'Daniel SHILONGO', 'HTJIUHARO', 'PETRUS PAULUS MBAMBI',
            'FERNANANDU BUSH', 'KANTANF N', 'JOHANNES HEKANDJO', 'ALI LUS HAUFIKU',
            'Mayurdu A', 'KAV Kakuva', 'Nohannes S Ndala', 'Homanus Karubora', 'Linda Hadmbwasha (leo)',
            'Polrus Iyokulumc', 'Novalo 1 ounc', 'Perlus Gidoon', 'John Josoph', 'M Masutu',
            'Мокшакоще Касори FOMOS', 'Thomes I wish', 'Mascka Joseph Nomouram', 'David Jons Katembo', 'David Jont Katembo',
            'Frans John Hennie', 'Blasius Hidengwe', 'Shahafifange Hpanduius (luke)', 'Lukas Makua', 'CMUkuw',
            'Daniel Kiino', 'BP Moya (prince)', 'Gabriel Antonius', 'Oscar Visnjamba', 'Leon Zasiman',
            'Thomas Nghishko', 'Ndumba Mingandja', 'Chambals Segunda', 'Jonas Shefashke', 'Jordan Frans',
            'Taleni Mangongo', 'Al Magau', 'Ndyolomimu M', 'Jospephat Kitopha', 'Augusto maguel Jamba',
            'PV Kalura', 'Faustina Kawe', 'Simson Shafodino', 'Luis Shkolepo',
            'Aser Magongo', 'EE Tobias', 'Michael David Motshego', 'Petrus Mwale', 'Profilius Mwetupaka',
            'Bafana Tjjshurs'
          ];

          // Create employees in database
          for (let i = 0; i < employeeNames.length; i++) {
            const name = employeeNames[i];
            try {
              await employeeService.createEmployee();
              console.log('Employee created:', name);
            } catch (error) {
              console.error('Error creating employee:', error);
            }
          }
          
          // Reload employees after creation
          const updatedEmployees = await employeeService.getAllEmployees();
          setEmployees(updatedEmployees);
        } else {
          setEmployees(employeesData);
        }
        
        // Load sites
        const sitesData = await siteService.getAllSites();
        setSites(sitesData);
        
        // Load firearms
        const firearmsData = await firearmService.getFirearmDetails();
        setFirearms(firearmsData);
        
      } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [isOpen]);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [leaveBalanceHistory, setLeaveBalanceHistory] = useState<any[]>([]);
  const [allLeavePeriods, setAllLeavePeriods] = useState<any[]>([]);
  const [allRestPeriods, setAllRestPeriods] = useState<any[]>([]);
  const [performanceNotes, setPerformanceNotes] = useState<any[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<any>({});
  const [newPerformanceNote, setNewPerformanceNote] = useState({
    note_date: new Date().toISOString().split('T')[0],
    note_text: '',
    note_type: 'general'
  });
  const [gearInfo, setGearInfo] = useState<EmployeeGear>({
    employee_id: '',
    torch: false,
    rifle_make: '',
    rifle_model: '',
    rifle_serial_number: '',
    uniform_issue_date: '',
    boots_issue_date: '',
    parka_issue_date: '',
    jersey_issue_date: '',
    cap_issue_date: '',
    notes: ''
  });

  const [firearms, setFirearms] = useState<any[]>([]);
  const [selectedFirearm, setSelectedFirearm] = useState<string>('');

  // Rest period and leave period state
  const [restPeriod, setRestPeriod] = useState({
    start_date: '',
    end_date: '',
    reason: 'scheduled_rest'
  });

  const [leavePeriod, setLeavePeriod] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'annual_leave'
  });

  const handleEmployeeSelect = async (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEmployeeInfo(employee);
      
      // Load gear information for this employee
      try {
        const gear = await gearService.getEmployeeGear(employeeId);
        if (gear) {
          setGearInfo(gear);
        } else {
          // Initialize with default gear values
          setGearInfo({
            employee_id: employeeId,
            torch: false,
            rifle_make: '',
            rifle_model: '',
            rifle_serial_number: '',
            uniform_issue_date: '',
            boots_issue_date: '',
            parka_issue_date: '',
            jersey_issue_date: '',
            cap_issue_date: '',
            notes: ''
          });
        }
      } catch (error) {
        console.error('Error loading gear:', error);
        setGearInfo({
          employee_id: employeeId,
          torch: false,
          rifle_make: '',
          rifle_model: '',
          rifle_serial_number: '',
          uniform_issue_date: '',
          boots_issue_date: '',
          parka_issue_date: '',
          jersey_issue_date: '',
          cap_issue_date: '',
          notes: ''
        });
      }

      // Load currently assigned firearm for this employee
      try {
        console.log('🔫 Loading assigned firearm for employee:', employeeId);
        const assignedFirearms = await firearmService.getFirearmsByEmployee();
        if (assignedFirearms && assignedFirearms.length > 0) {
          // Get the most recent assignment
          const currentFirearm = assignedFirearms[0];
          setSelectedFirearm(currentFirearm.firearm_id);
          console.log('✅ Found assigned firearm:', currentFirearm.type_name, currentFirearm.serial_number);
        } else {
          setSelectedFirearm('');
          console.log('ℹ️ No firearm currently assigned to this employee');
        }
      } catch (error) {
        console.error('Error loading assigned firearm:', error);
        setSelectedFirearm('');
      }

      // Load rest periods for this employee
      try {
        console.log('🔄 Loading rest periods for employee:', employeeId);
        const restPeriods = await gearService.getRestPeriods();
        console.log('📅 All rest periods loaded:', restPeriods.length);
        
        const employeeRestPeriods = restPeriods.filter((rp: any) => rp.employee_id === employeeId);
        console.log('👤 Rest periods for this employee:', employeeRestPeriods);
        
        // Set all rest periods for history display
        setAllRestPeriods(employeeRestPeriods);
        
        if (employeeRestPeriods.length > 0) {
          const latestRest = employeeRestPeriods[employeeRestPeriods.length - 1]; // Get the most recent
          console.log('📅 Setting rest period:', latestRest);
          setRestPeriod({
            start_date: latestRest.start_date,
            end_date: latestRest.end_date,
            reason: latestRest.reason || 'Scheduled Rest Period'
          });
        } else {
          console.log('⚠️ No rest periods found for employee');
          setRestPeriod({
            start_date: '',
            end_date: '',
            reason: 'Scheduled Rest Period'
          });
        }
      } catch (error) {
        console.error('❌ Error loading rest periods:', error);
        setRestPeriod({
          start_date: '',
          end_date: '',
          reason: 'Scheduled Rest Period'
        });
        setAllRestPeriods([]);
      }

      // Load leave periods for this employee
      try {
        const leavePeriods = await gearService.getLeavePeriods();
        const employeeLeavePeriods = leavePeriods.filter((lp: any) => lp.employee_id === employeeId);
        
        // Set all leave periods for history display
        setAllLeavePeriods(employeeLeavePeriods);
        
        if (employeeLeavePeriods.length > 0) {
          const latestLeave = employeeLeavePeriods[employeeLeavePeriods.length - 1]; // Get the most recent
          setLeavePeriod({
            start_date: latestLeave.start_date,
            end_date: latestLeave.end_date,
            leave_type: latestLeave.leave_type || 'annual_leave'
          });
        } else {
          setLeavePeriod({
            start_date: '',
            end_date: '',
            leave_type: 'annual_leave'
          });
        }
      } catch (error) {
        console.error('Error loading leave periods:', error);
        setLeavePeriod({
          start_date: '',
          end_date: '',
          leave_type: 'annual_leave'
        });
        setAllLeavePeriods([]);
      }

      // Load leave balance for this employee
      try {
        console.log('🔄 Loading leave balance for employee:', employeeId);
        const balance = await gearService.getLeaveBalance(employeeId);
        console.log('📊 Leave balance loaded:', balance);
        setLeaveBalance(balance);
        
        // Load leave balance history
        const history = await gearService.getLeaveBalanceHistory(employeeId);
        console.log('📈 Leave balance history loaded:', history);
        setLeaveBalanceHistory(history);
      } catch (error) {
        console.error('Error loading leave balance:', error);
        setLeaveBalance(0);
        setLeaveBalanceHistory([]);
      }

      // Refresh assignments to show current site assignment
      try {
        console.log('🔄 Refreshing assignments for site assignment display');
        await refreshAssignments();
        console.log('✅ Assignments refreshed');
      } catch (error) {
        console.error('Error refreshing assignments:', error);
      }

      // Load performance notes for this employee
      try {
        console.log('🔄 Loading performance notes for employee:', employeeId);
        const notes = await performanceService.getEmployeePerformanceNotes(employeeId);
        console.log('📝 Performance notes loaded:', notes);
        setPerformanceNotes(notes);
        
        // Load performance summary
        const summary = await performanceService.getEmployeePerformanceSummary(employeeId);
        console.log('📊 Performance summary loaded:', summary);
        setPerformanceSummary(summary);
      } catch (error) {
        console.error('Error loading performance notes:', error);
        setPerformanceNotes([]);
        setPerformanceSummary({});
      }
    }
  };

  const handleSiteAssignment = async (siteName: string) => {
    if (!employeeInfo) return;
    
    console.log('🔄 Updating site assignment:', {
      employeeId: employeeInfo.id,
      employeeName: employeeInfo.name,
      siteName: siteName
    });
    
    try {
      // Find the site ID
      const site = sites.find(s => s.name === siteName);
      if (!site) {
        console.error('❌ Site not found:', siteName);
        alert(`Site "${siteName}" not found. Please try again.`);
        return;
      }
      
      console.log('✅ Found site:', site);
      
      // Update the assignment using the context
      await updateAssignment(employeeInfo.id, site.id);
      
      console.log('✅ Site assignment updated successfully:', employeeInfo.name, '->', siteName);
      
      // Show success message
      alert(`✅ ${employeeInfo.name} has been assigned to ${siteName}`);
      
    } catch (error) {
      console.error('❌ Error updating site assignment:', error);
      alert('Failed to update site assignment. Please try again.');
    }
  };

  const handleAddPerformanceNote = async () => {
    if (!employeeInfo || !newPerformanceNote.note_text.trim()) {
      alert('Please enter a performance note');
      return;
    }

    try {
      setLoading(true);
      await performanceService.createPerformanceNote({
        employee_id: employeeInfo.id,
        note_date: newPerformanceNote.note_date,
        note_text: newPerformanceNote.note_text,
        note_type: newPerformanceNote.note_type,
        created_by: 'System Admin'
      });

      // Reset form
      setNewPerformanceNote({
        note_date: new Date().toISOString().split('T')[0],
        note_text: '',
        note_type: 'general'
      });

      // Reload performance notes
      const notes = await performanceService.getEmployeePerformanceNotes(employeeInfo.id);
      setPerformanceNotes(notes);
      
      const summary = await performanceService.getEmployeePerformanceSummary(employeeInfo.id);
      setPerformanceSummary(summary);

      alert('✅ Performance note added successfully!');
    } catch (error) {
      console.error('Error adding performance note:', error);
      alert('Failed to add performance note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerformanceNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this performance note?')) {
      return;
    }

    try {
      setLoading(true);
      await performanceService.deletePerformanceNote(noteId);
      
      // Reload performance notes
      if (employeeInfo) {
        const notes = await performanceService.getEmployeePerformanceNotes(employeeInfo.id);
        setPerformanceNotes(notes);
        
        const summary = await performanceService.getEmployeePerformanceSummary(employeeInfo.id);
        setPerformanceSummary(summary);
      }

      alert('✅ Performance note deleted successfully!');
    } catch (error) {
      console.error('Error deleting performance note:', error);
      alert('Failed to delete performance note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!employeeInfo) return;
    
    try {
      setLoading(true);
      
      // Save employee information
      await employeeService.updateEmployee(employeeInfo.id, employeeInfo);
      
      // Save gear information
      await gearService.upsertEmployeeGear(employeeInfo.id, gearInfo);
      
      // Handle firearm assignment if selected
      if (selectedFirearm) {
        console.log('🔫 Assigning firearm:', selectedFirearm, 'to employee:', employeeInfo.id);
        
        // Get the selected firearm details
        const firearm = firearms.find(f => f.firearm_id === selectedFirearm);
        if (firearm) {
          // Get the employee's current site assignment
          const employeeAssignments: any[] = []; // Placeholder - getAssignmentsForEmployee not implemented
          const currentAssignment = employeeAssignments.find((a: any) => a.assigned_date === new Date().toISOString().split('T')[0]);
          
          if (currentAssignment) {
            // Assign firearm to employee at their current site
            await firearmService.assignFirearm();
            console.log('✅ Firearm assigned successfully');
          } else {
            console.log('⚠️ Employee not assigned to any site, cannot assign firearm');
            alert('Employee must be assigned to a site before firearm can be assigned');
          }
        }
      }
      
      // Save rest period if dates are provided
      if (restPeriod.start_date && restPeriod.end_date) {
        console.log('🔄 Saving rest period:', restPeriod);
        
        // Check if employee already has rest periods
        const existingRestPeriods = await gearService.getRestPeriods();
        const employeeRestPeriods = existingRestPeriods.filter((rp: any) => rp.employee_id === employeeInfo.id);
        
        console.log('📅 Existing rest periods for employee:', employeeRestPeriods);
        
        if (employeeRestPeriods.length > 0) {
          // Update the most recent rest period
          const latestRest = employeeRestPeriods[employeeRestPeriods.length - 1];
          console.log('🔄 Updating existing rest period:', latestRest.id);
          
          await gearService.updateRestPeriod(latestRest.id, {
            start_date: restPeriod.start_date,
            end_date: restPeriod.end_date,
            reason: restPeriod.reason
          });
          console.log('✅ Rest period updated successfully');
        } else {
          // Create new rest period
          console.log('🆕 Creating new rest period');
          await gearService.createRestPeriod(employeeInfo.id, restPeriod);
          console.log('✅ Rest period created successfully');
        }
      } else {
        console.log('⚠️ No rest period dates provided, skipping save');
      }
      
      // Save leave period if dates are provided
      if (leavePeriod.start_date && leavePeriod.end_date) {
        console.log('🔄 Saving leave period:', leavePeriod);
        
        // Check if employee already has leave periods
        const existingLeavePeriods = await gearService.getLeavePeriods();
        const employeeLeavePeriods = existingLeavePeriods.filter((lp: any) => lp.employee_id === employeeInfo.id);
        
        console.log('📅 Existing leave periods for employee:', employeeLeavePeriods);
        
        if (employeeLeavePeriods.length > 0) {
          // Update the most recent leave period
          const latestLeave = employeeLeavePeriods[employeeLeavePeriods.length - 1];
          console.log('🔄 Updating existing leave period:', latestLeave.id);
          
          await gearService.updateLeavePeriod(latestLeave.id, {
            start_date: leavePeriod.start_date,
            end_date: leavePeriod.end_date,
            leave_type: leavePeriod.leave_type
          });
          console.log('✅ Leave period updated successfully');
        } else {
          // Create new leave period
          console.log('🆕 Creating new leave period');
          await gearService.createLeavePeriod(employeeInfo.id, leavePeriod);
          console.log('✅ Leave period created successfully');
        }
      } else {
        console.log('⚠️ No leave period dates provided, skipping save');
      }
      
      alert('Employee information saved successfully!');
      
      // Refresh assignments to show updated site assignments
      await refreshAssignments();
      
      // Refresh the employee data to show updated rest/leave periods
      await handleEmployeeSelect(employeeInfo.id);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateEmployee = async () => {
    if (!employeeInfo) return;
    
    const confirmTerminate = window.confirm(
      `Are you sure you want to TERMINATE ${employeeInfo.name}?\n\n` +
      `This will:\n` +
      `• Remove them from all calculations (rest, leave, availability)\n` +
      `• Keep their data for historical reference\n` +
      `• Prevent them from being assigned to sites\n\n` +
      `This action can be reversed later.`
    );
    
    if (!confirmTerminate) return;
    
    try {
      setLoading(true);
      
      // Call the terminate function in the database
      const { error } = await supabase.rpc('terminate_employee', {
        employee_id_param: employeeInfo.id
      } as any);
      
      if (error) throw error;
      
      alert(`${employeeInfo.name} has been TERMINATED.\n\nThey will no longer appear in calculations but their data is preserved for reference.`);
      
      // Reload employees to refresh the list
      const updatedEmployees = await employeeService.getAllEmployees();
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error('Error terminating employee:', error);
      alert('Failed to terminate employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateEmployee = async () => {
    if (!employeeInfo) return;
    
    const confirmReactivate = window.confirm(
      `Are you sure you want to REACTIVATE ${employeeInfo.name}?\n\n` +
      `This will:\n` +
      `• Add them back to all calculations\n` +
      `• Allow them to be assigned to sites again\n` +
      `• Restore their availability status`
    );
    
    if (!confirmReactivate) return;
    
    try {
      setLoading(true);
      
      // Call the reactivate function in the database
      const { error } = await supabase.rpc('reactivate_employee', {
        employee_id_param: employeeInfo.id
      } as any);
      
      if (error) throw error;
      
      alert(`${employeeInfo.name} has been REACTIVATED.\n\nThey are now included in all calculations and can be assigned to sites.`);
      
      // Reload employees to refresh the list
      const updatedEmployees = await employeeService.getAllEmployees();
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error('Error reactivating employee:', error);
      alert('Failed to reactivate employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose an employee... ({employees.length} available)</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.status === 'terminated' ? '(🚫 TERMINATED)' : '(✅ ACTIVE)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Information Form */}
            {employeeInfo && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={employeeInfo.name}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PSIRA Number</label>
                    <input
                      type="text"
                      value={employeeInfo.psira_number || ''}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, psira_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                    <input
                      type="text"
                      value={employeeInfo.id_number || ''}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, id_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cellphone Number</label>
                    <input
                      type="tel"
                      value={employeeInfo.cellphone_number || ''}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, cellphone_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <input
                      type="text"
                      value={employeeInfo.employee_number}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, employee_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Site Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Assignment</label>
                    <select
                      value={getAssignmentForEmployee(employeeInfo.id)?.site_name || ''}
                      onChange={(e) => handleSiteAssignment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Site</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.name}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                    {getAssignmentForEmployee(employeeInfo.id)?.site_name && (
                      <p className="text-sm text-green-600 mt-1">
                        ✅ Currently assigned to: {getAssignmentForEmployee(employeeInfo.id)?.site_name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={employeeInfo.appointment_date || ''}
                      onChange={(e) => setEmployeeInfo({...employeeInfo, appointment_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {employeeInfo.experience_level && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employeeInfo.experience_level === 'Veteran' ? 'bg-purple-100 text-purple-800' :
                          employeeInfo.experience_level === 'Experience' ? 'bg-blue-100 text-blue-800' :
                          employeeInfo.experience_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          employeeInfo.experience_level === 'New Recruit' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employeeInfo.experience_level}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Rest Period Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Rest Period</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rest Start Date</label>
                        <input
                          type="date"
                          value={restPeriod.start_date}
                          onChange={(e) => setRestPeriod({...restPeriod, start_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rest End Date</label>
                        <input
                          type="date"
                          value={restPeriod.end_date}
                          onChange={(e) => setRestPeriod({...restPeriod, end_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leave Balance Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Annual Leave Balance</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Available Leave Days</p>
                          <p className="text-2xl font-bold text-blue-600">{leaveBalance} days</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Leave Year</p>
                          <p className="text-lg font-semibold text-gray-800">{employeeInfo?.leave_year || new Date().getFullYear()}</p>
                        </div>
                      </div>
                      
                      {/* Leave Balance History */}
                      {leaveBalanceHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Leave History</p>
                          <div className="space-y-2">
                            {leaveBalanceHistory.slice(0, 3).map((record, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{record.year}:</span>
                                <span className="font-medium">
                                  {record.initial_balance} - {record.used_leave} = {record.current_balance} days
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Leave Period Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Leave Period</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Start Date</label>
                        <input
                          type="date"
                          value={leavePeriod.start_date}
                          onChange={(e) => setLeavePeriod({...leavePeriod, start_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave End Date</label>
                        <input
                          type="date"
                          value={leavePeriod.end_date}
                          onChange={(e) => setLeavePeriod({...leavePeriod, end_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Gear Assignment */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Gear Assignment</h3>
                  
                  <div className="space-y-4">
                    {/* Torch */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Torch</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="torch"
                            checked={gearInfo.torch === true}
                            onChange={() => setGearInfo({...gearInfo, torch: true})}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="torch"
                            checked={gearInfo.torch === false}
                            onChange={() => setGearInfo({...gearInfo, torch: false})}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {/* Firearm Assignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">🔫 Assigned Firearm</label>
                      <select
                        value={selectedFirearm}
                        onChange={(e) => setSelectedFirearm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a firearm...</option>
                        {firearms
                          .filter(firearm => firearm.status === 'available')
                          .map((firearm) => (
                            <option key={firearm.firearm_id} value={firearm.firearm_id}>
                              {firearm.type_name} - {firearm.serial_number} ({firearm.category})
                            </option>
                          ))}
                      </select>
                      {selectedFirearm && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <div className="text-sm text-blue-800">
                            <strong>Selected:</strong> {firearms.find(f => f.firearm_id === selectedFirearm)?.type_name} - {firearms.find(f => f.firearm_id === selectedFirearm)?.serial_number}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            This firearm will be assigned to the employee when you save.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Uniform Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Uniform Issue Date</label>
                      <input
                        type="date"
                        value={gearInfo.uniform_issue_date || ''}
                        onChange={(e) => setGearInfo({...gearInfo, uniform_issue_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Boots Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Boots Issue Date</label>
                      <input
                        type="date"
                        value={gearInfo.boots_issue_date || ''}
                        onChange={(e) => setGearInfo({...gearInfo, boots_issue_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Parka Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parka Issue Date</label>
                      <input
                        type="date"
                        value={gearInfo.parka_issue_date || ''}
                        onChange={(e) => setGearInfo({...gearInfo, parka_issue_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Jersey Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Issue Date</label>
                      <input
                        type="date"
                        value={gearInfo.jersey_issue_date || ''}
                        onChange={(e) => setGearInfo({...gearInfo, jersey_issue_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Cap Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cap Issue Date</label>
                      <input
                        type="date"
                        value={gearInfo.cap_issue_date || ''}
                        onChange={(e) => setGearInfo({...gearInfo, cap_issue_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Gear Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gear Notes</label>
                    <textarea
                      value={gearInfo.notes || ''}
                      onChange={(e) => setGearInfo({...gearInfo, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes about gear assignment..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comprehensive History Sections */}
          {employeeInfo && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Complete Leave & Off Duty History</h2>
              
              {/* All Leave Periods History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  ✈️ All Leave Periods ({allLeavePeriods.length})
                </h3>
                {allLeavePeriods.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Start Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">End Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Duration</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allLeavePeriods
                            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                            .map((period, index) => {
                              const startDate = new Date(period.start_date);
                              const endDate = new Date(period.end_date);
                              const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              const year = startDate.getFullYear();
                              
                              return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-2">{startDate.toLocaleDateString()}</td>
                                  <td className="px-3 py-2">{endDate.toLocaleDateString()}</td>
                                  <td className="px-3 py-2 font-medium text-blue-600">{duration} days</td>
                                  <td className="px-3 py-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {period.leave_type?.replace('_', ' ').toUpperCase() || 'ANNUAL LEAVE'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">{year}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    No leave periods recorded
                  </div>
                )}
              </div>

              {/* All Rest Periods History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  🛌 All Off Duty Periods ({allRestPeriods.length})
                </h3>
                {allRestPeriods.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Start Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">End Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Duration</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Reason</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allRestPeriods
                            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                            .map((period, index) => {
                              const startDate = new Date(period.start_date);
                              const endDate = new Date(period.end_date);
                              const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              const year = startDate.getFullYear();
                              
                              return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-2">{startDate.toLocaleDateString()}</td>
                                  <td className="px-3 py-2">{endDate.toLocaleDateString()}</td>
                                  <td className="px-3 py-2 font-medium text-green-600">{duration} days</td>
                                  <td className="px-3 py-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      {period.reason || 'SCHEDULED REST'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">{year}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    No off duty periods recorded
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Leave Days Taken:</p>
                    <p className="text-xl font-bold text-blue-600">
                      {allLeavePeriods.reduce((total, period) => {
                        const startDate = new Date(period.start_date);
                        const endDate = new Date(period.end_date);
                        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return total + duration;
                      }, 0)} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Off Duty Days:</p>
                    <p className="text-xl font-bold text-green-600">
                      {allRestPeriods.reduce((total, period) => {
                        const startDate = new Date(period.start_date);
                        const endDate = new Date(period.end_date);
                        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return total + duration;
                      }, 0)} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Notes Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Performance Notes</h3>
                
                {/* Performance Summary */}
                {performanceSummary.total_notes > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Performance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Total Notes</p>
                        <p className="text-lg font-bold text-gray-800">{performanceSummary.total_notes}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Positive</p>
                        <p className="text-lg font-bold text-green-600">{performanceSummary.positive_notes}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Improvement</p>
                        <p className="text-lg font-bold text-yellow-600">{performanceSummary.improvement_notes}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Warnings</p>
                        <p className="text-lg font-bold text-red-600">{performanceSummary.warning_notes}</p>
                      </div>
                    </div>
                    {performanceSummary.latest_note_date && (
                      <div className="mt-2 text-sm text-gray-600">
                        Latest note: {new Date(performanceSummary.latest_note_date).toLocaleDateString()} 
                        ({performanceSummary.latest_note_type})
                      </div>
                    )}
                  </div>
                )}

                {/* Add New Performance Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Add Performance Note</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={newPerformanceNote.note_date}
                          onChange={(e) => setNewPerformanceNote({...newPerformanceNote, note_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                        <select
                          value={newPerformanceNote.note_type}
                          onChange={(e) => setNewPerformanceNote({...newPerformanceNote, note_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="general">📝 General</option>
                          <option value="positive">✅ Positive</option>
                          <option value="improvement">📈 Improvement</option>
                          <option value="negative">❌ Negative</option>
                          <option value="warning">⚠️ Warning</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <textarea
                        value={newPerformanceNote.note_text}
                        onChange={(e) => setNewPerformanceNote({...newPerformanceNote, note_text: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter performance note..."
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleAddPerformanceNote}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : '+ Add Performance Note'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Notes List */}
                {performanceNotes.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Note</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Created By</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceNotes.map((note, index) => {
                            const getTypeColor = (type: string) => {
                              switch (type) {
                                case 'positive': return 'bg-green-100 text-green-800';
                                case 'negative': return 'bg-red-100 text-red-800';
                                case 'improvement': return 'bg-yellow-100 text-yellow-800';
                                case 'warning': return 'bg-orange-100 text-orange-800';
                                default: return 'bg-gray-100 text-gray-800';
                              }
                            };

                            const getTypeIcon = (type: string) => {
                              switch (type) {
                                case 'positive': return '✅';
                                case 'negative': return '❌';
                                case 'improvement': return '📈';
                                case 'warning': return '⚠️';
                                default: return '📝';
                              }
                            };

                            return (
                              <tr key={note.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-2">{new Date(note.note_date).toLocaleDateString()}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(note.note_type)}`}>
                                    {getTypeIcon(note.note_type)} {note.note_type}
                                  </span>
                                </td>
                                <td className="px-3 py-2 max-w-xs">
                                  <div className="truncate" title={note.note_text}>
                                    {note.note_text}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{note.created_by}</td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => handleDeletePerformanceNote(note.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    No performance notes recorded
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                disabled={!employeeInfo || loading}
              >
                {loading ? 'Saving & Refreshing...' : '💾 Save & Refresh'}
              </button>
              
              {employeeInfo && (
                <>
                  {employeeInfo.status === 'active' ? (
                    <button
                      onClick={handleTerminateEmployee}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      🚫 Terminate Employee
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivateEmployee}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      ✅ Reactivate Employee
                    </button>
                  )}
                </>
              )}
            </div>
            
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