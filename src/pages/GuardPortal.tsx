import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, StatusBadge, PageHeader, StatsCard, EmptyState } from '@/components/ui/MobileComponents'
import { getGuardStatus, getNextOnDate, getNextOffDate, formatDateWithDay } from '@/utils/scheduling'

export default function GuardPortal() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'leave' | 'swaps'>('schedule')

  // Get current guard's information
  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => db.getGuards()
  })

  const currentGuard = guards?.data?.find(g => g.id === user?.id) // Simplified - in real app would link user to guard

  // Get guard's assignments for next 7 days
  const { data: assignments } = useQuery({
    queryKey: ['guard-assignments', currentGuard?.id],
    queryFn: () => {
      if (!currentGuard) return { data: [] }
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return db.getAssignmentsForGuard(
        currentGuard.id,
        today.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      )
    },
    enabled: !!currentGuard
  })

  // Get guard's leave requests
  const { data: leaveRequests } = useQuery({
    queryKey: ['leave-requests', currentGuard?.id],
    queryFn: () => db.getLeaveRequests(currentGuard?.id || ''),
    enabled: !!currentGuard
  })

  // Get guard's swaps
  const { data: swaps } = useQuery({
    queryKey: ['swaps'],
    queryFn: () => db.getSwaps()
  })

  const guardSwaps = swaps?.data?.filter(s => 
    s.from_guard_id === currentGuard?.id || s.to_guard_id === currentGuard?.id
  ) || []

  if (!currentGuard) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <EmptyState
          icon="👮"
          title="Guard Not Found"
          description="Please contact your supervisor to set up your account."
        />
      </div>
    )
  }

  const statusToday = getGuardStatus(currentGuard, new Date())
  const nextChangeDate = statusToday === 'ON' ? 
    getNextOffDate(currentGuard, new Date()) : 
    getNextOnDate(currentGuard, new Date())

  const upcomingAssignments = assignments?.data?.slice(0, 3) || []
  const pendingLeaveRequests = leaveRequests?.data?.filter(l => l.status === 'pending').length || 0
  const pendingSwaps = guardSwaps.filter(s => s.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GuardRoster</h1>
            <p className="text-gray-600">Welcome, {currentGuard.full_name}</p>
          </div>
          <StatusBadge status={statusToday} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsCard
            title="Next Change"
            value={formatDateWithDay(nextChangeDate).split(',')[0]}
            icon={statusToday === 'ON' ? '😴' : '👮'}
            color={statusToday === 'ON' ? 'yellow' : 'green'}
          />
          <StatsCard
            title="Current Site"
            value={currentGuard.site?.name || 'Rotation'}
            icon="🏢"
            color="blue"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
          <button
            onClick={() => setSelectedTab('schedule')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg ${
              selectedTab === 'schedule'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            📅 Schedule
          </button>
          <button
            onClick={() => setSelectedTab('leave')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg ${
              selectedTab === 'leave'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            🏖️ Leave
            {pendingLeaveRequests > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingLeaveRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('swaps')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg ${
              selectedTab === 'swaps'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            🔄 Swaps
            {pendingSwaps > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingSwaps}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === 'schedule' && (
          <ScheduleTab 
            assignments={upcomingAssignments}
            guard={currentGuard}
          />
        )}

        {selectedTab === 'leave' && (
          <LeaveTab 
            leaveRequests={leaveRequests?.data || []}
            guard={currentGuard}
          />
        )}

        {selectedTab === 'swaps' && (
          <SwapsTab 
            swaps={guardSwaps}
            guard={currentGuard}
          />
        )}
      </div>
    </div>
  )
}

// Schedule Tab Component
function ScheduleTab({ assignments, guard }: { assignments: any[], guard: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Your Next Shifts</h3>
        {assignments.length > 0 ? (
          <div className="space-y-3">
            {assignments.map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-bold text-gray-900">{assignment.site?.name}</div>
                  <div className="text-gray-600">{formatDateWithDay(new Date(assignment.work_date))}</div>
                </div>
                <StatusBadge status={assignment.status === 'scheduled' ? 'ON' : assignment.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📅"
            title="No upcoming shifts"
            description="Your schedule will appear here when assignments are made."
          />
        )}
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Important Info</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start space-x-3">
            <span className="text-xl">⏰</span>
            <div>
              <div className="font-bold">Shift Times</div>
              <div className="text-sm">Day shift: 6:00 AM - 6:00 PM</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-xl">📱</span>
            <div>
              <div className="font-bold">Contact</div>
              <div className="text-sm">Call supervisor if you can't work</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-xl">🔄</span>
            <div>
              <div className="font-bold">Swaps</div>
              <div className="text-sm">Ask another guard to swap shifts</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Leave Tab Component
function LeaveTab({ leaveRequests, guard }: { leaveRequests: any[], guard: any }) {
  const [showLeaveForm, setShowLeaveForm] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">🏖️ My Leave Requests</h3>
        <Button
          onClick={() => setShowLeaveForm(true)}
          icon="➕"
          size="medium"
        >
          Request Leave
        </Button>
      </div>

      {leaveRequests.length > 0 ? (
        <div className="space-y-3">
          {leaveRequests.map(request => (
            <Card key={request.id}>
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={request.leave_type} />
                <StatusBadge status={request.status} />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-gray-900">
                  {formatDateWithDay(new Date(request.start_date))} - {formatDateWithDay(new Date(request.end_date))}
                </div>
                {request.reason && (
                  <div className="text-gray-600 text-sm">{request.reason}</div>
                )}
                {request.supervisor_notes && (
                  <div className="text-blue-600 text-sm">
                    <strong>Supervisor:</strong> {request.supervisor_notes}
                  </div>
                )}
                {request.manager_notes && (
                  <div className="text-green-600 text-sm">
                    <strong>Manager:</strong> {request.manager_notes}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏖️"
          title="No leave requests"
          description="Tap the button above to request time off."
        />
      )}

      {showLeaveForm && (
        <LeaveRequestForm 
          guard={guard}
          onClose={() => setShowLeaveForm(false)}
        />
      )}
    </div>
  )
}

// Swaps Tab Component
function SwapsTab({ swaps, guard }: { swaps: any[], guard: any }) {
  const [showSwapForm, setShowSwapForm] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">🔄 My Swap Requests</h3>
        <Button
          onClick={() => setShowSwapForm(true)}
          icon="➕"
          size="medium"
        >
          Request Swap
        </Button>
      </div>

      {swaps.length > 0 ? (
        <div className="space-y-3">
          {swaps.map(swap => (
            <Card key={swap.id}>
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={swap.status} />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-gray-900">
                  {swap.from_guard.badge} ↔ {swap.to_guard.badge}
                </div>
                <div className="text-gray-600">
                  {swap.site.name} • {formatDateWithDay(new Date(swap.date_from))} - {formatDateWithDay(new Date(swap.date_to))}
                </div>
                {swap.reason && (
                  <div className="text-gray-600 text-sm">{swap.reason}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔄"
          title="No swap requests"
          description="Tap the button above to request a shift swap."
        />
      )}

      {showSwapForm && (
        <SwapRequestForm 
          guard={guard}
          onClose={() => setShowSwapForm(false)}
        />
      )}
    </div>
  )
}

// Leave Request Form Component
function LeaveRequestForm({ guard, onClose }: { guard: any, onClose: () => void }) {
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const leaveTypes = [
    { value: 'sick', label: '🤒 Sick Leave' },
    { value: 'vacation', label: '🏖️ Vacation' },
    { value: 'personal', label: '👤 Personal' },
    { value: 'training', label: '📚 Training' },
    { value: 'emergency', label: '🚨 Emergency' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit leave request logic here
    console.log('Submitting leave request:', { leaveType, startDate, endDate, reason })
    onClose()
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Request Leave</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Type of Leave"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          options={leaveTypes}
        />
        
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        
        <Textarea
          label="Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Tell us why you need time off..."
        />
        
        <div className="flex space-x-3">
          <Button type="submit" fullWidth>
            Submit Request
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

// Swap Request Form Component
function SwapRequestForm({ guard, onClose }: { guard: any, onClose: () => void }) {
  const [toGuard, setToGuard] = useState('')
  const [site, setSite] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit swap request logic here
    console.log('Submitting swap request:', { toGuard, site, startDate, endDate, reason })
    onClose()
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Request Swap</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Swap With Guard"
          value={toGuard}
          onChange={(e) => setToGuard(e.target.value)}
          options={[{ value: 'G001', label: 'G001 - John Smith' }]} // Simplified
        />
        
        <Select
          label="Site"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          options={[{ value: 'site1', label: 'Site 1' }]} // Simplified
        />
        
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        
        <Textarea
          label="Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Why do you need to swap shifts?"
        />
        
        <div className="flex space-x-3">
          <Button type="submit" fullWidth>
            Submit Request
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}







