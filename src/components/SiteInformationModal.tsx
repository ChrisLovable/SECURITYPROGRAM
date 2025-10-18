import { useState, useEffect } from 'react';
import { siteService } from '../services/supabaseService';
import { useAssignments } from '../contexts/AssignmentContext';

interface SiteInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteInfo {
  id: string;
  name: string;
  address?: string;
  guards_assigned?: string[];
  dont_work_with_guards?: string[];
  monthly_invoice_amount?: number;
  bushveld_vehicle?: boolean;
  owner_vehicle?: boolean;
  owner_number?: string;
  manager_number?: string;
  other_name_1?: string;
  other_number_1?: string;
  other_name_2?: string;
  other_number_2?: string;
  special_instructions?: string;
}

export default function SiteInformationModal({ isOpen, onClose }: SiteInformationModalProps) {
  const { assignments, loading: contextLoading, getAssignmentsForSite } = useAssignments();
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [showSiteDetails, setShowSiteDetails] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    address: '',
    owner_number: '',
    manager_number: '',
    other_name_1: '',
    other_number_1: '',
    other_name_2: '',
    other_number_2: '',
    monthly_invoice_amount: 0,
    bushveld_vehicle: false,
    owner_vehicle: false,
    special_instructions: '',
    guards_assigned: [] as string[],
    dont_work_with_guards: [] as string[]
  });

  // Load sites from database
  useEffect(() => {
    const loadSites = async () => {
      if (!isOpen) return;
      
      try {
        const sitesData = await siteService.getAllSites();
        
        // If no sites in database, create them from the provided names
        if (sitesData.length === 0) {
          // Create sites in database using the real site names
          const realSiteNames = [
            'Aliwal Noord', 'BA Treasury', 'Buanodonna', 'Down Touch', 'Harmony Piggeries', 
            'Hartzview', 'EP Hills', 'MJ Honiball', 'CF Haasbroek', 'UTG Boerdery', 
            'Khamab', 'Mulda Boerdery', 'Arthur Nel', 'SAC Trucks', 'AF van Wyk', 
            'Perridon', 'WF van der Rust'
          ];
          
          for (let i = 0; i < realSiteNames.length; i++) {
            const name = realSiteNames[i];
            await siteService.createSite({
              name: name,
              address: '',
              special_instructions: ''
            });
          }
          
          // Reload sites after creation
          const updatedSites = await siteService.getAllSites();
          setSites(updatedSites);
        } else {
          setSites(sitesData);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
        alert('Failed to load sites. Please try again.');
      }
    };

    loadSites();
  }, [isOpen]);

  // Update site info when assignments change globally
  useEffect(() => {
    if (selectedSite && siteInfo) {
      const siteAssignments = getAssignmentsForSite(selectedSite);
      const assignedGuards = siteAssignments.map(assignment => assignment.employee_name);
      
      setSiteInfo(prev => prev ? {
        ...prev,
        guards_assigned: assignedGuards
      } : null);
    }
  }, [assignments, selectedSite, getAssignmentsForSite]);

  // Handle site selection
  const handleSiteSelect = async (siteId: string) => {
    console.log('🔧 Opening edit modal for site:', siteId);
    setSelectedSite(siteId);
    setShowSiteDetails(true);
    
    try {
      const site = await siteService.getSite(siteId);
      console.log('📋 Loaded site data:', site);
      
      // Get guard assignments for this site from global context
      const siteAssignments = getAssignmentsForSite(siteId);
      const assignedGuards = siteAssignments.map(assignment => assignment.employee_name);
      
      const siteData = {
        ...site,
        guards_assigned: assignedGuards,
        monthly_invoice_amount: site.monthly_invoice_amount || 0,
        bushveld_vehicle: site.bushveld_vehicle || false,
        owner_vehicle: site.owner_vehicle || false,
        owner_number: site.owner_number || '',
        manager_number: site.manager_number || '',
        other_name_1: site.other_name_1 || '',
        other_number_1: site.other_number_1 || '',
        other_name_2: site.other_name_2 || '',
        other_number_2: site.other_number_2 || '',
        assigned_guards: site.assigned_guards || [],
        dont_work_with_guards: site.dont_work_with_guards || []
      };
      
      console.log('📝 Setting site info:', siteData);
      setSiteInfo(siteData);
    } catch (error) {
      console.error('❌ Error loading site:', error);
      const errorObj = error as any;
      console.error('Error details:', errorObj.message, errorObj.code, errorObj.details);
      alert(`Failed to load site information: ${errorObj.message || 'Unknown error'}. Please run the database migration script first.`);
    }
  };

  // Handle saving site information
  const handleSave = async () => {
    if (!siteInfo) {
      console.log('❌ No site info to save');
      return;
    }
    
    console.log('💾 Saving site info:', siteInfo);
    
    try {
      setLoading(true);
      const result = await siteService.updateSite(siteInfo.id, siteInfo);
      console.log('✅ Save result:', result);
      
      alert('Site information saved successfully!');
      
      // Reload sites to show updated information
      const updatedSites = await siteService.getAllSites();
      setSites(updatedSites);
      console.log('🔄 Sites reloaded:', updatedSites.length);
    } catch (error) {
      console.error('❌ Error saving site:', error);
      alert(`Failed to save site information: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.name.trim()) {
      alert('Please enter a site name');
      return;
    }

    try {
      setLoading(true);
      await siteService.createSite(newSite);
      alert('Site added successfully!');
      setShowAddSiteModal(false);
      setNewSite({
        name: '',
        address: '',
        owner_number: '',
        manager_number: '',
        other_name_1: '',
        other_number_1: '',
        other_name_2: '',
        other_number_2: '',
        monthly_invoice_amount: 0,
        bushveld_vehicle: false,
        owner_vehicle: false,
        special_instructions: '',
        guards_assigned: [],
        dont_work_with_guards: []
      });
      
      // Reload sites
      const updatedSites = await siteService.getAllSites();
      setSites(updatedSites);
    } catch (error) {
      console.error('Error adding site:', error);
      alert('Failed to add site. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h2 className="text-2xl font-bold text-gray-900">Site Information</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Site Cards Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🏢 All Sites ({sites.length})</h3>
                <button
                  onClick={() => setShowAddSiteModal(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  ➕ Add New Site
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sites.map((site) => {
                  const siteAssignments = getAssignmentsForSite(site.id);
                  const assignedGuardsCount = siteAssignments.length;
                  
                  return (
                    <div 
                      key={site.id} 
                      className={`bg-gradient-to-br from-orange-50 to-orange-100 border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                        selectedSite === site.id ? 'border-orange-400 ring-2 ring-orange-200' : 'border-orange-200'
                      }`}
                      onClick={() => handleSiteSelect(site.id)}
                    >
                      {/* Site Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🏢</span>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{site.name}</div>
                            <div className="text-xs text-gray-600">Site</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">{assignedGuardsCount}</div>
                          <div className="text-xs text-gray-600">Guards</div>
                        </div>
                      </div>

                      {/* Site Details */}
                      <div className="space-y-2">
                        {/* Contact Persons */}
                        <div className="bg-white/70 rounded-lg p-2">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Contact Persons</div>
                          <div className="text-sm text-gray-900 mt-1 space-y-1">
                            {site.owner_number && (
                              <div className="flex justify-between">
                                <span>Owner:</span>
                                <span className="font-mono">{site.owner_number}</span>
                              </div>
                            )}
                            {site.manager_number && (
                              <div className="flex justify-between">
                                <span>Manager:</span>
                                <span className="font-mono">{site.manager_number}</span>
                              </div>
                            )}
                            {site.other_number_1 && (
                              <div className="flex justify-between">
                                <span>{site.other_name_1 || 'Contact 1'}:</span>
                                <span className="font-mono">{site.other_number_1}</span>
                              </div>
                            )}
                            {!site.owner_number && !site.manager_number && !site.other_number_1 && (
                              <div className="text-gray-500 italic">No contacts provided</div>
                            )}
                          </div>
                        </div>

                        {/* Guard Information */}
                        <div className="bg-white/70 rounded-lg p-2">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Guard Information</div>
                          <div className="text-sm text-gray-900 mt-1 grid grid-cols-2 gap-2">
                            <div className="flex justify-between">
                              <span>Guards:</span>
                              <span className="font-bold text-orange-600">{assignedGuardsCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Relief:</span>
                              <span className="font-bold text-blue-600">0</span>
                            </div>
                          </div>
                          {/* Assigned Guards List */}
                          {assignedGuardsCount > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Assigned Guards</div>
                              <div className="text-xs text-gray-700">
                                {siteAssignments.slice(0, 2).map(assignment => assignment.employee_name).join(', ')}
                                {assignedGuardsCount > 2 && ` +${assignedGuardsCount - 2} more`}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Don't Work With Guards */}
                        {(site.dont_work_with_guards && site.dont_work_with_guards.length > 0) && (
                          <div className="bg-white/70 rounded-lg p-2">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">🚫 Restricted Guards</div>
                            <div className="text-sm text-gray-900 mt-1">
                              <div className="text-red-600 font-medium">
                                {site.dont_work_with_guards.slice(0, 2).join(', ')}
                                {site.dont_work_with_guards.length > 2 && ` +${site.dont_work_with_guards.length - 2} more`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {site.dont_work_with_guards.length} guard{site.dont_work_with_guards.length !== 1 ? 's' : ''} restricted
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Financial & Vehicle Info */}
                        <div className="bg-white/70 rounded-lg p-2">
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Financial & Vehicles</div>
                          <div className="text-sm text-gray-900 mt-1 space-y-1">
                            <div className="flex justify-between">
                              <span>Monthly Invoice:</span>
                              <span className="font-bold text-green-600">
                                R{site.monthly_invoice_amount || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bushveld Vehicle:</span>
                              <span className={`font-bold ${site.bushveld_vehicle ? 'text-green-600' : 'text-red-600'}`}>
                                {site.bushveld_vehicle ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Own Vehicle:</span>
                              <span className={`font-bold ${site.owner_vehicle ? 'text-green-600' : 'text-red-600'}`}>
                                {site.owner_vehicle ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSiteSelect(site.id);
                          }}
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          ✏️ Edit Site
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Site Information Form */}
            {showSiteDetails && siteInfo && (
              <div className="space-y-6">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowSiteDetails(false);
                      setSelectedSite('');
                      setSiteInfo(null);
                    }}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <span>←</span>
                    <span>Back to Sites</span>
                  </button>
                  <h3 className="text-xl font-bold text-gray-900">📝 Edit Site Details</h3>
                </div>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={siteInfo.name}
                      onChange={(e) => setSiteInfo({...siteInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={siteInfo.address || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Guards Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guards Assigned */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Guards Assigned</label>
                    <button
                      onClick={() => {
                        if (!selectedSite) return;
                        const siteAssignments = getAssignmentsForSite(selectedSite);
                        const assignedGuards = siteAssignments.map(assignment => assignment.employee_name);
                        
                        setSiteInfo(prev => prev ? {
                          ...prev,
                          guards_assigned: assignedGuards
                        } : null);
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors duration-200"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                      <div className="grid grid-cols-1 gap-2">
                      {(siteInfo.guards_assigned || []).map((guard, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm font-medium">{guard}</span>
                          <span className="text-xs text-gray-500">Guard {index + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Total Guards: {siteInfo.guards_assigned?.length || 0}
                    </p>
                    </div>
                  </div>

                  {/* Don't Work With Guards */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🚫 Don't Work With These Guards</label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                      <div className="space-y-2">
                        {(siteInfo.dont_work_with_guards || []).map((guard, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                            <span className="text-sm font-medium text-red-700">{guard}</span>
                            <button
                              onClick={() => {
                                const updatedGuards = (siteInfo.dont_work_with_guards || []).filter((_, i) => i !== index);
                                setSiteInfo({...siteInfo, dont_work_with_guards: updatedGuards});
                              }}
                              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add guard name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const guardName = input.value.trim();
                                if (guardName && !(siteInfo.dont_work_with_guards || []).includes(guardName)) {
                                  setSiteInfo({
                                    ...siteInfo,
                                    dont_work_with_guards: [...(siteInfo.dont_work_with_guards || []), guardName]
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add guard name..."]') as HTMLInputElement;
                              const guardName = input?.value.trim();
                              if (guardName && !(siteInfo.dont_work_with_guards || []).includes(guardName)) {
                                setSiteInfo({
                                  ...siteInfo,
                                  dont_work_with_guards: [...(siteInfo.dont_work_with_guards || []), guardName]
                                });
                                input.value = '';
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                          >
                            ➕ Add
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Total Restricted Guards: {siteInfo.dont_work_with_guards?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Invoice Amount (NAD)</label>
                  <input
                    type="number"
                    value={siteInfo.monthly_invoice_amount || ''}
                    onChange={(e) => setSiteInfo({...siteInfo, monthly_invoice_amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter monthly invoice amount"
                  />
                </div>

                {/* Vehicle Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bushveld Vehicle</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="bushveld_vehicle"
                          checked={siteInfo.bushveld_vehicle === true}
                          onChange={() => setSiteInfo({...siteInfo, bushveld_vehicle: true})}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="bushveld_vehicle"
                          checked={siteInfo.bushveld_vehicle === false}
                          onChange={() => setSiteInfo({...siteInfo, bushveld_vehicle: false})}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Vehicle</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="owner_vehicle"
                          checked={siteInfo.owner_vehicle === true}
                          onChange={() => setSiteInfo({...siteInfo, owner_vehicle: true})}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="owner_vehicle"
                          checked={siteInfo.owner_vehicle === false}
                          onChange={() => setSiteInfo({...siteInfo, owner_vehicle: false})}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Number</label>
                    <input
                      type="tel"
                      value={siteInfo.owner_number || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, owner_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+264 81 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Number</label>
                    <input
                      type="tel"
                      value={siteInfo.manager_number || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, manager_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+264 81 123 4567"
                    />
                  </div>
                </div>

                {/* Other Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Name 1</label>
                    <input
                      type="text"
                      value={siteInfo.other_name_1 || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, other_name_1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Number 1</label>
                    <input
                      type="tel"
                      value={siteInfo.other_number_1 || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, other_number_1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+264 81 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Name 2</label>
                    <input
                      type="text"
                      value={siteInfo.other_name_2 || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, other_name_2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Number 2</label>
                    <input
                      type="tel"
                      value={siteInfo.other_number_2 || ''}
                      onChange={(e) => setSiteInfo({...siteInfo, other_number_2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+264 81 123 4567"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={siteInfo.special_instructions || ''}
                    onChange={(e) => setSiteInfo({...siteInfo, special_instructions: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special instructions or notes for this site..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              disabled={!siteInfo || loading}
            >
              {loading ? 'Saving & Refreshing...' : '💾 Save & Refresh'}
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

      {/* Add New Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddSiteModal(false)}></div>
            
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">➕ Add New Site</h3>
                  <button onClick={() => setShowAddSiteModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
              </div>

              <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
                      <input
                        type="text"
                        value={newSite.name}
                        onChange={(e) => setNewSite({...newSite, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter site name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={newSite.address}
                        onChange={(e) => setNewSite({...newSite, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter site address"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Number</label>
                      <input
                        type="tel"
                        value={newSite.owner_number}
                        onChange={(e) => setNewSite({...newSite, owner_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="+264 81 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager Number</label>
                      <input
                        type="tel"
                        value={newSite.manager_number}
                        onChange={(e) => setNewSite({...newSite, manager_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="+264 81 123 4567"
                      />
                    </div>
                  </div>

                  {/* Other Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Contact Name</label>
                      <input
                        type="text"
                        value={newSite.other_name_1}
                        onChange={(e) => setNewSite({...newSite, other_name_1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Contact Number</label>
                      <input
                        type="tel"
                        value={newSite.other_number_1}
                        onChange={(e) => setNewSite({...newSite, other_number_1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="+264 81 123 4567"
                      />
                    </div>
                  </div>

                  {/* Financial & Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Invoice (R)</label>
                      <input
                        type="number"
                        value={newSite.monthly_invoice_amount}
                        onChange={(e) => setNewSite({...newSite, monthly_invoice_amount: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bushveld Vehicle</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bushveld_vehicle_new"
                            checked={newSite.bushveld_vehicle === true}
                            onChange={() => setNewSite({...newSite, bushveld_vehicle: true})}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bushveld_vehicle_new"
                            checked={newSite.bushveld_vehicle === false}
                            onChange={() => setNewSite({...newSite, bushveld_vehicle: false})}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Vehicle</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="owner_vehicle_new"
                            checked={newSite.owner_vehicle === true}
                            onChange={() => setNewSite({...newSite, owner_vehicle: true})}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="owner_vehicle_new"
                            checked={newSite.owner_vehicle === false}
                            onChange={() => setNewSite({...newSite, owner_vehicle: false})}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                    <textarea
                      value={newSite.special_instructions}
                      onChange={(e) => setNewSite({...newSite, special_instructions: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Any special instructions or notes..."
                    />
                  </div>

                  {/* Don't Work With Guards */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🚫 Don't Work With These Guards</label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                      <div className="space-y-2">
                        {(newSite.dont_work_with_guards || []).map((guard, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                            <span className="text-sm font-medium text-red-700">{guard}</span>
                            <button
                              onClick={() => {
                                const updatedGuards = (newSite.dont_work_with_guards || []).filter((_, i) => i !== index);
                                setNewSite({...newSite, dont_work_with_guards: updatedGuards});
                              }}
                              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add guard name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const guardName = input.value.trim();
                                if (guardName && !(newSite.dont_work_with_guards || []).includes(guardName)) {
                                  setNewSite({
                                    ...newSite,
                                    dont_work_with_guards: [...(newSite.dont_work_with_guards || []), guardName]
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add guard name..."]') as HTMLInputElement;
                              const guardName = input?.value.trim();
                              if (guardName && !(newSite.dont_work_with_guards || []).includes(guardName)) {
                                setNewSite({
                                  ...newSite,
                                  dont_work_with_guards: [...(newSite.dont_work_with_guards || []), guardName]
                                });
                                input.value = '';
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                          >
                            ➕ Add
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Total Restricted Guards: {newSite.dont_work_with_guards?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddSiteModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSite}
                  disabled={loading || !newSite.name.trim()}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Adding...' : '➕ Add Site'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
