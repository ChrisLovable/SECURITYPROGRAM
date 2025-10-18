import React, { useState, useEffect } from 'react';
import { inventoryService, employeeService } from '../services/supabaseService';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  asset_tag?: string;
  status: string;
  location?: string;
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'assignments' | 'maintenance'>('overview');
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any>({});
  const [equipmentAssignments, setEquipmentAssignments] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'firearm',
    brand: '',
    model: '',
    serial_number: '',
    asset_tag: '',
    location: '',
    notes: ''
  });

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const categories = [
    { value: 'firearm', label: '🔫 Firearms', color: 'bg-red-100 text-red-800' },
    { value: 'torch', label: '🔦 Torches', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'night_vision', label: '🌙 Night Vision', color: 'bg-purple-100 text-purple-800' },
    { value: 'vehicle', label: '🚗 Vehicles', color: 'bg-blue-100 text-blue-800' },
    { value: 'uniform', label: '👕 Uniforms', color: 'bg-green-100 text-green-800' },
    { value: 'protective_gear', label: '🛡️ Protective Gear', color: 'bg-orange-100 text-orange-800' },
    { value: 'communication', label: '📻 Communication', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'other', label: '🔧 Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    damaged: 'bg-red-100 text-red-800',
    lost: 'bg-gray-100 text-gray-800',
    retired: 'bg-gray-100 text-gray-600',
    returned: 'bg-purple-100 text-purple-800'
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, stats, assignments, maintenance, empData] = await Promise.all([
        inventoryService.getInventoryItems(),
        inventoryService.getInventoryStats(),
        inventoryService.getEquipmentAssignments(),
        inventoryService.getMaintenanceRecords(),
        employeeService.getAllEmployees()
      ]);

      setInventoryItems(items);
      setInventoryStats(stats);
      setEquipmentAssignments(assignments);
      setMaintenanceRecords(maintenance);
      setEmployees(empData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      alert('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    try {
      setLoading(true);
      await inventoryService.createInventoryItem(newItem);
      setNewItem({
        name: '',
        category: 'firearm',
        brand: '',
        model: '',
        serial_number: '',
        asset_tag: '',
        location: '',
        notes: ''
      });
      await loadData();
      alert('✅ Inventory item added successfully!');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Failed to add inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEquipment = async () => {
    if (!selectedEmployee || !selectedItem) {
      alert('Please select both employee and equipment');
      return;
    }

    try {
      setLoading(true);
      await inventoryService.assignEquipment(selectedItem, selectedEmployee, new Date().toISOString(), assignmentNotes);
      setSelectedEmployee('');
      setSelectedItem('');
      setAssignmentNotes('');
      await loadData();
      alert('✅ Equipment assigned successfully!');
    } catch (error) {
      console.error('Error assigning equipment:', error);
      alert('Failed to assign equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnEquipment = async (assignmentId: string, itemName: string) => {
    const reason = prompt(`Enter return reason for ${itemName}:`);
    if (!reason) return;

    try {
      setLoading(true);
      await inventoryService.returnEquipment(assignmentId, new Date().toISOString());
      await loadData();
      alert('✅ Equipment returned successfully!');
    } catch (error) {
      console.error('Error returning equipment:', error);
      alert('Failed to return equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📦 Inventory Management</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: '📊 Overview', icon: '📊' },
                  { id: 'items', label: '📦 Items', icon: '📦' },
                  { id: 'assignments', label: '👤 Assignments', icon: '👤' },
                  { id: 'maintenance', label: '🔧 Maintenance', icon: '🔧' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Inventory Overview</h3>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => {
                    const stats = inventoryStats[category.value] || { total: 0, available: 0, assigned: 0 };
                    return (
                      <div key={category.value} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{category.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-green-600">✓ {stats.available}</p>
                            <p className="text-blue-600">👤 {stats.assigned}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Assignments */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Recent Equipment Assignments</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Employee</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Equipment</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Assigned Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equipmentAssignments.slice(0, 5).map((assignment, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2">{assignment.employees?.name || 'Unknown'}</td>
                              <td className="px-3 py-2">{assignment.inventory_items?.name || 'Unknown'}</td>
                              <td className="px-3 py-2">{new Date(assignment.assigned_date).toLocaleDateString()}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[assignment.return_date ? 'returned' : 'assigned']}`}>
                                  {assignment.return_date ? 'Returned' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Inventory Items</h3>
                  <button
                    onClick={() => setActiveTab('items')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Add New Item Form */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Add New Inventory Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Rifle - AK47"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        type="text"
                        value={newItem.brand}
                        onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Kalashnikov"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={newItem.model}
                        onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., AK-47"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={newItem.serial_number}
                        onChange={(e) => setNewItem({...newItem, serial_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., AK001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                      <input
                        type="text"
                        value={newItem.asset_tag}
                        onChange={(e) => setNewItem({...newItem, asset_tag: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., F001"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Armory"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={newItem.notes}
                        onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleAddItem}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : '+ Add Item'}
                    </button>
                  </div>
                </div>

                {/* Inventory Items Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Category</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Brand/Model</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Serial</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-medium">{item.name}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${categories.find(c => c.value === item.category)?.color}`}>
                                {categories.find(c => c.value === item.category)?.label}
                              </span>
                            </td>
                            <td className="px-3 py-2">{item.brand} {item.model}</td>
                            <td className="px-3 py-2">{item.serial_number}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[item.status as keyof typeof statusColors]}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">{item.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Equipment Assignments</h3>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Assign Equipment
                  </button>
                </div>

                {/* Assign Equipment Form */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Assign Equipment to Employee</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                      <select
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Equipment</option>
                        {inventoryItems.filter(item => item.status === 'available').map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <input
                        type="text"
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Assignment notes..."
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleAssignEquipment}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {loading ? 'Assigning...' : '+ Assign Equipment'}
                    </button>
                  </div>
                </div>

                {/* Assignments Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Employee</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Equipment</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Assigned Date</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipmentAssignments.map((assignment, index) => (
                          <tr key={assignment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2">{assignment.employees?.name || 'Unknown'}</td>
                            <td className="px-3 py-2">{assignment.inventory_items?.name || 'Unknown'}</td>
                            <td className="px-3 py-2">{new Date(assignment.assigned_date).toLocaleDateString()}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[assignment.return_date ? 'returned' : 'assigned']}`}>
                                {assignment.return_date ? 'Returned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {!assignment.return_date && (
                                <button
                                  onClick={() => handleReturnEquipment(assignment.id, assignment.inventory_items?.name)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Return
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Maintenance Records</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Equipment</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Maintenance Date</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Cost</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Performed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRecords.map((record, index) => (
                          <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2">{record.inventory_item_id}</td>
                            <td className="px-3 py-2">{new Date(record.maintenance_date).toLocaleDateString()}</td>
                            <td className="px-3 py-2">{record.maintenance_type}</td>
                            <td className="px-3 py-2">{record.description}</td>
                            <td className="px-3 py-2">R{record.cost || 0}</td>
                            <td className="px-3 py-2">{record.performed_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

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





