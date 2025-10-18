import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { formatDateWithDay } from '@/utils/scheduling'

export default function SwapsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFromGuard, setSelectedFromGuard] = useState('')
  const [selectedToGuard, setSelectedToGuard] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  // Get all swaps
  const { data: swaps } = useQuery({
    queryKey: ['swaps'],
    queryFn: () => db.getSwaps()
  })

  // Get guards and sites for the form
  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => db.getGuards()
  })

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: () => db.getSites()
  })

  // Create swap mutation
  const createSwapMutation = useMutation({
    mutationFn: (swap: any) => db.createSwap(swap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] })
      resetForm()
    }
  })

  // Approve/reject swap mutation
  const approveSwapMutation = useMutation({
    mutationFn: ({ swapId, approve }: { swapId: string, approve: boolean }) => 
      db.approveSwap(swapId, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] })
    }
  })

  const resetForm = () => {
    setShowCreateForm(false)
    setSelectedFromGuard('')
    setSelectedToGuard('')
    setSelectedSite('')
    setDateFrom('')
    setDateTo('')
    setReason('')
  }

  const handleCreateSwap = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFromGuard || !selectedToGuard || !selectedSite || !dateFrom || !dateTo) {
      alert('Please fill in all required fields')
      return
    }

    createSwapMutation.mutate({
      from_guard_id: selectedFromGuard,
      to_guard_id: selectedToGuard,
      site_id: selectedSite,
      date_from: dateFrom,
      date_to: dateTo,
      reason: reason || null,
      status: 'pending'
    })
  }

  const handleApproveSwap = (swapId: string, approve: boolean) => {
    if (confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this swap?`)) {
      approveSwapMutation.mutate({ swapId, approve })
    }
  }

  const activeGuards = guards?.data?.filter(g => g.active) || []
  const pendingSwaps = swaps?.data?.filter(s => s.status === 'pending') || []
  const approvedSwaps = swaps?.data?.filter(s => s.status === 'approved') || []
  const rejectedSwaps = swaps?.data?.filter(s => s.status === 'rejected') || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swaps</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage guard swap requests and approvals
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary btn-large"
        >
          {showCreateForm ? 'Cancel' : '➕ Request Swap'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {pendingSwaps.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">Pending</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {approvedSwaps.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">Approved</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-danger-600">
              {rejectedSwaps.length}
            </div>
            <div className="text-lg text-gray-600 mt-1">Rejected</div>
          </div>
        </div>
      </div>

      {/* Create Swap Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Request New Swap
          </h3>
          
          <form onSubmit={handleCreateSwap} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Guard *
                </label>
                <select
                  value={selectedFromGuard}
                  onChange={(e) => setSelectedFromGuard(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select guard...</option>
                  {activeGuards.map(guard => (
                    <option key={guard.id} value={guard.id}>
                      {guard.badge} - {guard.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Guard *
                </label>
                <select
                  value={selectedToGuard}
                  onChange={(e) => setSelectedToGuard(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select guard...</option>
                  {activeGuards
                    .filter(guard => guard.id !== selectedFromGuard)
                    .map(guard => (
                    <option key={guard.id} value={guard.id}>
                      {guard.badge} - {guard.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site *
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select site...</option>
                {sites?.data?.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From *
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To *
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Explain why this swap is needed..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createSwapMutation.isPending}
                className="btn btn-primary"
              >
                {createSwapMutation.isPending ? 'Creating...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Swaps List */}
      <div className="space-y-6">
        {/* Pending Swaps */}
        {pendingSwaps.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Approvals
            </h3>
            
            <div className="space-y-4">
              {pendingSwaps.map(swap => (
                <div key={swap.id} className="p-4 border border-warning-200 rounded-lg bg-warning-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-medium text-gray-900">
                        {swap.from_guard.badge} ↔ {swap.to_guard.badge}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {swap.site.name} • {formatDateWithDay(new Date(swap.date_from))} - {formatDateWithDay(new Date(swap.date_to))}
                      </div>
                      {swap.reason && (
                        <div className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {swap.reason}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex space-x-2">
                      <button
                        onClick={() => handleApproveSwap(swap.id, true)}
                        disabled={approveSwapMutation.isPending}
                        className="btn btn-success"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleApproveSwap(swap.id, false)}
                        disabled={approveSwapMutation.isPending}
                        className="btn btn-danger"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Swaps History */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All Swap Requests
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {swaps?.data?.map(swap => (
                  <tr key={swap.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {swap.from_guard.badge} ↔ {swap.to_guard.badge}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {swap.site.name}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateWithDay(new Date(swap.date_from))} - {formatDateWithDay(new Date(swap.date_to))}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-${swap.status}`}>
                        {swap.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {swap.reason || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How Swaps Work</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Guards can request to swap shifts with another guard</li>
          <li>• All swaps require supervisor approval</li>
          <li>• Approved swaps automatically update the roster</li>
          <li>• Both guards receive notifications when swap is approved/rejected</li>
          <li>• Swaps can be requested for single days or date ranges</li>
        </ul>
      </div>
    </div>
  )
}








