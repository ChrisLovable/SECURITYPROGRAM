import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { Button, Card, StatusBadge, PageHeader, StatsCard, EmptyState, Select, Textarea } from '@/components/ui/MobileComponents'
import { formatDateWithDay } from '@/utils/scheduling'

export default function LeaveManagementPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'supervisor_approved' | 'manager_approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const queryClient = useQueryClient()

  // Get all leave requests
  const { data: leaveRequests } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: () => db.getLeaveRequests()
  })

  // Update leave request mutation
  const updateLeaveRequestMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      db.updateLeaveRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      setSelectedRequest(null)
    }
  })

  const handleApprove = (request: any, level: 'supervisor' | 'manager') => {
    const updates = level === 'supervisor' 
      ? { 
          status: 'supervisor_approved' as const,
          supervisor_approved_at: new Date().toISOString()
        }
      : {
          status: 'manager_approved' as const,
          manager_approved_at: new Date().toISOString()
        }
    
    updateLeaveRequestMutation.mutate({ id: request.id, updates })
  }

  const handleReject = (request: any, level: 'supervisor' | 'manager', notes: string) => {
    const updates = {
      status: 'rejected' as const,
      ...(level === 'supervisor' 
        ? { supervisor_notes: notes }
        : { manager_notes: notes }
      )
    }
    
    updateLeaveRequestMutation.mutate({ id: request.id, updates })
  }

  const filteredRequests = leaveRequests?.data?.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  }) || []

  const pendingCount = leaveRequests?.data?.filter(r => r.status === 'pending').length || 0
  const supervisorApprovedCount = leaveRequests?.data?.filter(r => r.status === 'supervisor_approved').length || 0
  const managerApprovedCount = leaveRequests?.data?.filter(r => r.status === 'manager_approved').length || 0
  const rejectedCount = leaveRequests?.data?.filter(r => r.status === 'rejected').length || 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <PageHeader
        title="Leave Management"
        subtitle="Approve and manage guard leave requests"
        icon="🏖️"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon="⏳"
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={managerApprovedCount}
          icon="✅"
          color="green"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: leaveRequests?.data?.length || 0 },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'supervisor_approved', label: 'Supervisor OK', count: supervisorApprovedCount },
          { key: 'manager_approved', label: 'Manager OK', count: managerApprovedCount },
          { key: 'rejected', label: 'Rejected', count: rejectedCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-shrink-0 py-2 px-3 rounded-lg font-bold text-sm ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 bg-gray-200 text-gray-800 text-xs px-1 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <Card key={request.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.guard?.badge} - {request.guard?.full_name}
                    </h3>
                    <StatusBadge status={request.leave_type} />
                  </div>
                  <div className="text-gray-600 mb-2">
                    {formatDateWithDay(new Date(request.start_date))} - {formatDateWithDay(new Date(request.end_date))}
                  </div>
                  {request.reason && (
                    <div className="text-gray-700 text-sm mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </div>
                  )}
                </div>
                <StatusBadge status={request.status} />
              </div>

              {/* Approval Status */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Supervisor:</span>
                  <div className="flex items-center space-x-2">
                    {request.supervisor_approved_at ? (
                      <span className="text-green-600 text-sm">✅ Approved</span>
                    ) : request.status === 'rejected' && request.supervisor_notes ? (
                      <span className="text-red-600 text-sm">❌ Rejected</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">⏳ Pending</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Manager:</span>
                  <div className="flex items-center space-x-2">
                    {request.manager_approved_at ? (
                      <span className="text-green-600 text-sm">✅ Approved</span>
                    ) : request.status === 'rejected' && request.manager_notes ? (
                      <span className="text-red-600 text-sm">❌ Rejected</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">⏳ Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(request.supervisor_notes || request.manager_notes) && (
                <div className="space-y-2 mb-4">
                  {request.supervisor_notes && (
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">Supervisor Notes:</div>
                      <div className="text-sm text-blue-800">{request.supervisor_notes}</div>
                    </div>
                  )}
                  {request.manager_notes && (
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-900">Manager Notes:</div>
                      <div className="text-sm text-green-800">{request.manager_notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => setSelectedRequest(request)}
                  variant="secondary"
                  size="small"
                  fullWidth
                >
                  Review
                </Button>
                {request.status === 'pending' && (
                  <Button
                    onClick={() => handleApprove(request, 'supervisor')}
                    variant="success"
                    size="small"
                    fullWidth
                  >
                    Approve
                  </Button>
                )}
                {request.status === 'supervisor_approved' && (
                  <Button
                    onClick={() => handleApprove(request, 'manager')}
                    variant="success"
                    size="small"
                    fullWidth
                  >
                    Final Approve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏖️"
          title="No leave requests"
          description={`No ${filter === 'all' ? '' : filter + ' '}leave requests found.`}
        />
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <LeaveRequestReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(level) => handleApprove(selectedRequest, level)}
          onReject={(level, notes) => handleReject(selectedRequest, level, notes)}
        />
      )}
    </div>
  )
}

// Leave Request Review Modal Component
function LeaveRequestReviewModal({ 
  request, 
  onClose, 
  onApprove, 
  onReject 
}: { 
  request: any
  onClose: () => void
  onApprove: (level: 'supervisor' | 'manager') => void
  onReject: (level: 'supervisor' | 'manager', notes: string) => void
}) {
  const [notes, setNotes] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [level, setLevel] = useState<'supervisor' | 'manager'>('supervisor')

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(level)
    } else if (action === 'reject') {
      onReject(level, notes)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Review Leave Request</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-bold text-gray-900 mb-2">
              {request.guard?.badge} - {request.guard?.full_name}
            </div>
            <div className="text-gray-600 mb-2">
              {formatDateWithDay(new Date(request.start_date))} - {formatDateWithDay(new Date(request.end_date))}
            </div>
            <StatusBadge status={request.leave_type} />
          </div>

          {request.reason && (
            <div>
              <div className="font-medium text-gray-900 mb-1">Reason:</div>
              <div className="text-gray-700">{request.reason}</div>
            </div>
          )}

          <Select
            label="Your Role"
            value={level}
            onChange={(e) => setLevel(e.target.value as 'supervisor' | 'manager')}
            options={[
              { value: 'supervisor', label: 'Supervisor' },
              { value: 'manager', label: 'Manager' }
            ]}
          />

          <div className="space-y-2">
            <Button
              onClick={() => setAction('approve')}
              variant={action === 'approve' ? 'success' : 'secondary'}
              fullWidth
            >
              ✅ Approve Request
            </Button>
            <Button
              onClick={() => setAction('reject')}
              variant={action === 'reject' ? 'danger' : 'secondary'}
              fullWidth
            >
              ❌ Reject Request
            </Button>
          </div>

          {action === 'reject' && (
            <Textarea
              label="Rejection Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Explain why this request is being rejected..."
            />
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={action === 'reject' && !notes.trim()}
              fullWidth
            >
              Submit Decision
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}







