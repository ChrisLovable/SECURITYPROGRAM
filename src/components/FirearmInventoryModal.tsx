import { useState, useEffect } from 'react';
import { firearmService } from '../services/supabaseService';
import { employeeService, siteService } from '../services/supabaseService';

interface FirearmInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FirearmType {
  id: string;
  type_name: string;
  category: string;
}

interface Firearm {
  firearm_id: string;
  serial_number: string;
  type_name: string;
  category: string;
  license_start_date: string;
  license_expire_date: string;
  status: string;
  assigned_employee_name?: string;
  assigned_site_name?: string;
  assigned_date?: string;
  days_until_expiry: number;
}

interface InventorySummary {
  total_firearms: number;
  handguns: number;
  shotguns: number;
  rifles: number;
  available_firearms: number;
  assigned_firearms: number;
  expiring_soon: number;
}

export default function FirearmInventoryModal({ isOpen, onClose }: FirearmInventoryModalProps) {
  const [firearms, setFirearms] = useState<Firearm[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    total_firearms: 0,
    handguns: 0,
    shotguns: 0,
    rifles: 0,
    available_firearms: 0,
    assigned_firearms: 0,
    expiring_soon: 0
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedFirearm, setSelectedFirearm] = useState<Firearm | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: '',
    site_id: '',
    notes: ''
  });
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  });

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load firearm inventory summary
      const summaryData = await firearmService.getInventorySummary();
      setSummary(summaryData);
      
      // Load firearm details
      const firearmsData = await firearmService.getFirearmDetails();
      setFirearms(firearmsData);
      
      // Load employees and sites for assignment
      const [employeesData, sitesData] = await Promise.all([
        employeeService.getAllEmployees(),
        siteService.getAllSites()
      ]);
      setEmployees(employeesData);
      setSites(sitesData);
      
    } catch (error) {
      console.error('Error loading firearm inventory:', error);
      alert('Failed to load firearm inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFirearm = async () => {
    console.log('🔒 Assign button clicked');
    console.log('Selected firearm:', selectedFirearm);
    console.log('Assignment form:', assignmentForm);
    
    if (!selectedFirearm || !assignmentForm.employee_id || !assignmentForm.site_id) {
      alert('Please select an employee and site for assignment');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting to assign firearm...');
      
      const result = await firearmService.assignFirearm(
        selectedFirearm.firearm_id,
        assignmentForm.employee_id,
        assignmentForm.site_id,
        'System Admin'
      );
      
      console.log('✅ Assignment result:', result);
      alert('Firearm assigned successfully!');
      setShowAssignmentModal(false);
      setSelectedFirearm(null);
      setAssignmentForm({ employee_id: '', site_id: '', notes: '' });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('❌ Error assigning firearm:', error);
      console.error('Error details:', (error as any).message, (error as any).code, (error as any).details);
      alert(`Failed to assign firearm: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignFirearm = async (firearmId: string) => {
    if (!confirm('Are you sure you want to unassign this firearm?')) {
      return;
    }

    try {
      setLoading(true);
      await firearmService.unassignFirearm(firearmId);
      
      alert('Firearm unassigned successfully!');
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error unassigning firearm:', error);
      alert('Failed to unassign firearm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignmentModal = (firearm: Firearm) => {
    console.log('🔒 Opening assignment modal for firearm:', firearm);
    setSelectedFirearm(firearm);
    setShowAssignmentModal(true);
  };

  const openStatusModal = (firearm: Firearm) => {
    console.log('📝 Opening status modal for firearm:', firearm);
    setSelectedFirearm(firearm);
    setStatusForm({ status: firearm.status, notes: '' });
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedFirearm || !statusForm.status) {
      alert('Please select a status');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Changing firearm status...');
      
      await firearmService.updateFirearmStatus(selectedFirearm.firearm_id, statusForm.status as any);
      
      console.log('✅ Status changed successfully');
      alert(`Firearm status changed to ${statusForm.status} successfully!`);
      setShowStatusModal(false);
      setSelectedFirearm(null);
      setStatusForm({ status: '', notes: '' });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('❌ Error changing status:', error);
      console.error('Error details:', (error as any).message, (error as any).code, (error as any).details);
      alert(`Failed to change status: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'police': return 'bg-indigo-100 text-indigo-800';
      case 'stolen': return 'bg-red-100 text-red-800';
      case 'lost': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'assigned': return '🔒';
      case 'maintenance': return '🔧';
      case 'retired': return '🚫';
      case 'police': return '👮';
      case 'stolen': return '🚨';
      case 'lost': return '🔍';
      default: return '❓';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handgun': return '🔫';
      case 'shotgun': return '💥';
      case 'rifle': return '🎯';
      default: return '🔫';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'handgun': return 'from-red-50 to-red-100 border-red-200';
      case 'shotgun': return 'from-purple-50 to-purple-100 border-purple-200';
      case 'rifle': return 'from-orange-50 to-orange-100 border-orange-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getCategoryAccent = (category: string) => {
    switch (category) {
      case 'handgun': return 'text-red-600';
      case 'shotgun': return 'text-purple-600';
      case 'rifle': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'text-red-600 font-bold';
    if (days <= 30) return 'text-orange-600 font-semibold';
    if (days <= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredFirearms = firearms.filter(firearm => {
    const categoryMatch = selectedCategory === 'all' || firearm.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || firearm.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔫 Firearm Inventory Management</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.total_firearms}</div>
                <div className="text-sm text-blue-800">Total Firearms</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{summary.handguns}</div>
                <div className="text-sm text-green-800">🔫 Handguns</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.shotguns}</div>
                <div className="text-sm text-purple-800">💥 Shotguns</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.rifles}</div>
                <div className="text-sm text-orange-800">🎯 Rifles</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{summary.available_firearms}</div>
                <div className="text-sm text-emerald-800">✅ Available</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{summary.assigned_firearms}</div>
                <div className="text-sm text-indigo-800">🔒 Assigned</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{summary.expiring_soon}</div>
                <div className="text-sm text-red-800">⚠️ Expiring Soon</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="handgun">🔫 Handguns</option>
                  <option value="shotgun">💥 Shotguns</option>
                  <option value="rifle">🎯 Rifles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">✅ Available</option>
                  <option value="assigned">🔒 Assigned</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="retired">🚫 Retired</option>
                  <option value="police">👮 Police</option>
                  <option value="stolen">🚨 Stolen</option>
                  <option value="lost">🔍 Lost</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
              </div>
            </div>

            {/* Firearms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFirearms.map((firearm) => (
                <div key={firearm.firearm_id} className={`bg-gradient-to-br ${getCategoryColor(firearm.category)} border-2 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`text-2xl ${getCategoryAccent(firearm.category)}`}>{getCategoryIcon(firearm.category)}</div>
                      <div>
                        <div className={`text-sm font-bold ${getCategoryAccent(firearm.category)}`}>{firearm.category.toUpperCase()}</div>
                        <div className="text-xs text-gray-600">Category</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(firearm.status)}`}>
                      {getStatusIcon(firearm.status)} {firearm.status}
                    </span>
                  </div>

                  {/* Firearm Details */}
                  <div className="space-y-3">
                    <div className="bg-white/70 rounded-lg p-3">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Type</div>
                      <div className="font-bold text-gray-900 text-sm mt-1">{firearm.type_name}</div>
                    </div>
                    
                    <div className="bg-white/70 rounded-lg p-3">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Serial Number</div>
                      <div className="font-mono text-sm font-bold text-gray-900 mt-1">{firearm.serial_number}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">License Start</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{new Date(firearm.license_start_date).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">License Expires</div>
                        <div className={`text-sm font-bold mt-1 ${getExpiryColor(firearm.days_until_expiry)}`}>
                          {new Date(firearm.license_expire_date).toLocaleDateString()}
                        </div>
                        {firearm.days_until_expiry <= 30 && (
                          <div className="text-xs text-red-600 font-medium">
                            {firearm.days_until_expiry < 0 ? 'EXPIRED' : `${firearm.days_until_expiry} days left`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assignment Info */}
                    {firearm.status === 'assigned' && firearm.assigned_employee_name && (
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
                        <div className="text-sm text-blue-900">
                          <div className="font-bold flex items-center">
                            <span className="mr-2">👤</span>
                            {firearm.assigned_employee_name}
                          </div>
                          <div className="text-xs mt-1 flex items-center">
                            <span className="mr-2">📍</span>
                            {firearm.assigned_site_name}
                          </div>
                          <div className="text-xs mt-1 flex items-center">
                            <span className="mr-2">📅</span>
                            Assigned: {firearm.assigned_date ? new Date(firearm.assigned_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 space-y-2">
                      {firearm.status === 'available' ? (
                        <button
                          onClick={() => openAssignmentModal(firearm)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          🔒 Assign to Guard
                        </button>
                      ) : firearm.status === 'assigned' ? (
                        <button
                          onClick={() => handleUnassignFirearm(firearm.firearm_id)}
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          🔓 Unassign Firearm
                        </button>
                      ) : (
                        <div className="w-full bg-gray-400 text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg text-center">
                          {firearm.status === 'maintenance' ? '🔧 Under Maintenance' : 
                           firearm.status === 'police' ? '👮 With Police' :
                           firearm.status === 'stolen' ? '🚨 Stolen' :
                           firearm.status === 'lost' ? '🔍 Lost' :
                           '🚫 Retired'}
                        </div>
                      )}
                      
                      {/* Status Change Button */}
                      <button
                        onClick={() => openStatusModal(firearm)}
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        📝 Change Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFirearms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No firearms found matching the selected filters.
              </div>
            )}
          </div>

          {/* Assignment Modal */}
          {showAssignmentModal && selectedFirearm && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAssignmentModal(false)}></div>
                
                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">🔒 Assign Firearm</h3>
                      <button onClick={() => setShowAssignmentModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 font-medium mb-2">Firearm Details</div>
                      <div className="font-bold text-gray-900">{selectedFirearm.type_name}</div>
                      <div className="text-sm text-gray-700 font-mono">Serial: {selectedFirearm.serial_number}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        License expires: {new Date(selectedFirearm.license_expire_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">👤 Select Guard</label>
                        <select
                          value={assignmentForm.employee_id}
                          onChange={(e) => setAssignmentForm({...assignmentForm, employee_id: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Choose a guard...</option>
                          {employees.filter(emp => emp.status === 'active').map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} ({employee.employee_number})
                            </option>
                          ))}
                        </select>
                        {employees.filter(emp => emp.status === 'active').length === 0 && (
                          <p className="text-xs text-red-600 mt-1">No active guards available</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📍 Select Site</label>
                        <select
                          value={assignmentForm.site_id}
                          onChange={(e) => setAssignmentForm({...assignmentForm, site_id: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Choose a site...</option>
                          {sites.map(site => (
                            <option key={site.id} value={site.id}>
                              {site.name}
                            </option>
                          ))}
                        </select>
                        {sites.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">No sites available</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📝 Assignment Notes (Optional)</label>
                        <textarea
                          value={assignmentForm.notes}
                          onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Add any notes about this assignment..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAssignmentModal(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignFirearm}
                      disabled={loading || !assignmentForm.employee_id || !assignmentForm.site_id}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? 'Assigning...' : '🔒 Assign Firearm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Change Modal */}
          {showStatusModal && selectedFirearm && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)}></div>
                
                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-md w-full mx-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">📝 Change Status</h3>
                      <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 font-medium mb-2">Firearm Details</div>
                      <div className="font-bold text-gray-900">{selectedFirearm.type_name}</div>
                      <div className="text-sm text-gray-700 font-mono">Serial: {selectedFirearm.serial_number}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Current Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedFirearm.status)}`}>
                          {getStatusIcon(selectedFirearm.status)} {selectedFirearm.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🔄 New Status</label>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        >
                          <option value="available">✅ Available</option>
                          <option value="assigned">🔒 Assigned</option>
                          <option value="maintenance">🔧 Maintenance</option>
                          <option value="retired">🚫 Retired</option>
                          <option value="police">👮 Police</option>
                          <option value="stolen">🚨 Stolen</option>
                          <option value="lost">🔍 Lost</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">📝 Status Notes (Optional)</label>
                        <textarea
                          value={statusForm.notes}
                          onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          placeholder="Add notes about this status change..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusChange}
                      disabled={loading || !statusForm.status}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? 'Changing...' : '📝 Change Status'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
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
