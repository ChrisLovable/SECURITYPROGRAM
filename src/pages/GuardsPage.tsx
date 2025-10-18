import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { getGuardStatus, getNextOnDate, getNextOffDate, formatDateWithDay } from '@/utils/scheduling'

export default function GuardsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const queryClient = useQueryClient()

  // Get all guards with their site assignments
  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => db.getGuards()
  })

  // Update guard mutation
  const updateGuardMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      db.updateGuard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] })
    }
  })

  const togglePermanentAssignment = (guard: any, siteId: string | null) => {
    updateGuardMutation.mutate({
      id: guard.id,
      updates: {
        permanent_site_id: siteId,
        in_rotation: !siteId
      }
    })
  }

  const toggleRotationStatus = (guard: any) => {
    updateGuardMutation.mutate({
      id: guard.id,
      updates: {
        in_rotation: !guard.in_rotation
      }
    })
  }

  const toggleActiveStatus = (guard: any) => {
    updateGuardMutation.mutate({
      id: guard.id,
      updates: {
        active: !guard.active
      }
    })
  }

  const getStatusToday = (guard: any) => {
    const today = new Date()
    return getGuardStatus(guard, today)
  }

  const getCurrentSite = (guard: any) => {
    if (guard.permanent_site_id) {
      return guard.site?.name || 'Unknown Site'
    }
    return 'Rotation'
  }

  const getNextChangeDate = (guard: any) => {
    const today = new Date()
    const statusToday = getStatusToday(guard)
    
    try {
      if (statusToday === 'ON') {
        return getNextOffDate(guard, today)
      } else {
        return getNextOnDate(guard, today)
      }
    } catch {
      return null
    }
  }

  const activeGuards = guards?.data?.filter(g => g.active) || []
  const permanentGuards = activeGuards.filter(g => g.permanent_site_id)
  const rotationGuards = activeGuards.filter(g => g.in_rotation)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guards</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage guard assignments and schedules
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {activeGuards.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">Active Guards</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {permanentGuards.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">Permanent</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {rotationGuards.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">In Rotation</div>
          </div>
        </div>
      </div>

      {/* Guards Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGuards.map((guard) => {
            const statusToday = getStatusToday(guard)
            const nextChangeDate = getNextChangeDate(guard)
            
            return (
              <div key={guard.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {guard.full_name}
                    </h3>
                    <p className="text-lg text-gray-600">Badge: {guard.badge}</p>
                  </div>
                  <span className={`status-${statusToday.toLowerCase()}`}>
                    {statusToday} Duty
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Site
                    </label>
                    <p className="text-lg text-gray-900">
                      {getCurrentSite(guard)}
                    </p>
                  </div>

                  {nextChangeDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Change
                      </label>
                      <p className="text-lg text-gray-900">
                        {formatDateWithDay(nextChangeDate)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => togglePermanentAssignment(guard, guard.permanent_site_id)}
                        className={`btn btn-sm ${
                          guard.permanent_site_id 
                            ? 'btn-primary' 
                            : 'btn-secondary'
                        }`}
                      >
                        {guard.permanent_site_id ? 'Permanent' : 'Set Permanent'}
                      </button>
                      <button
                        onClick={() => toggleRotationStatus(guard)}
                        className={`btn btn-sm ${
                          guard.in_rotation 
                            ? 'btn-success' 
                            : 'btn-secondary'
                        }`}
                      >
                        {guard.in_rotation ? 'In Rotation' : 'Add to Rotation'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => toggleActiveStatus(guard)}
                      className="btn btn-danger btn-sm w-full"
                    >
                      Deactivate Guard
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Today
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeGuards.map((guard) => {
                  const statusToday = getStatusToday(guard)
                  const nextChangeDate = getNextChangeDate(guard)
                  
                  return (
                    <tr key={guard.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-lg font-medium text-gray-900">
                            {guard.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {guard.badge}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-${statusToday.toLowerCase()}`}>
                          {statusToday} Duty
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg text-gray-900">
                          {getCurrentSite(guard)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg text-gray-900">
                          {nextChangeDate ? formatDateWithDay(nextChangeDate) : 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guard.permanent_site_id 
                              ? 'bg-primary-100 text-primary-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {guard.permanent_site_id ? 'Permanent' : 'Rotation'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => togglePermanentAssignment(guard, guard.permanent_site_id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {guard.permanent_site_id ? 'Remove Permanent' : 'Set Permanent'}
                        </button>
                        <button
                          onClick={() => toggleActiveStatus(guard)}
                          className="text-danger-600 hover:text-danger-900"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Guard Management</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• <strong>Permanent:</strong> Guard is assigned to a specific site</li>
          <li>• <strong>Rotation:</strong> Guard can be assigned to any site as needed</li>
          <li>• <strong>Status:</strong> Shows if guard is ON or OFF duty today</li>
          <li>• <strong>Next Change:</strong> When guard switches from ON to OFF or vice versa</li>
          <li>• Guards work 60 days ON, then 12 days OFF in a 72-day cycle</li>
        </ul>
      </div>
    </div>
  )
}








