import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns'

export default function RosterPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showOnOffOverlay, setShowOnOffOverlay] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get assignments for the current month
  const { data: assignments } = useQuery({
    queryKey: ['assignments', monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]],
    queryFn: () => db.getAssignments(
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    ),
    enabled: !!monthStart && !!monthEnd
  })

  // Get all guards for ON/OFF overlay
  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => db.getGuards()
  })

  // Get all sites for the grid
  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: () => db.getSites()
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1))
  }

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return assignments?.data?.filter(a => a.work_date === dateStr) || []
  }

  const getGuardStatus = (guardId: string, date: Date) => {
    if (!guards?.data || !showOnOffOverlay) return null
    
    const guard = guards.data.find(g => g.id === guardId)
    if (!guard) return null
    
    // Simple ON/OFF calculation based on cycle
    const cycleStart = new Date(guard.cycle_start)
    const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))
    const cyclePosition = ((daysSinceStart % 72) + 72) % 72
    
    return cyclePosition < 60 ? 'ON' : 'OFF'
  }

  const getUnfilledCount = (date: Date) => {
    const dateAssignments = getAssignmentsForDate(date)
    return dateAssignments.filter(a => a.status === 'unfilled').length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roster</h1>
          <p className="mt-2 text-lg text-gray-600">
            Monthly guard assignments and coverage
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOnOffOverlay}
              onChange={(e) => setShowOnOffOverlay(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show ON/OFF status</span>
          </label>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="btn btn-secondary"
          >
            ← Previous
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="btn btn-secondary"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="card overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-18 gap-1 mb-2 sticky top-0 bg-white z-10">
            <div className="p-2 font-semibold text-gray-700 text-sm border-r border-gray-200">
              Site
            </div>
            {monthDays.map((day) => (
              <div key={day.toISOString()} className="p-2 text-center">
                <div className="text-xs font-medium text-gray-700">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Site Rows */}
          {sites?.data?.map((site) => (
            <div key={site.id} className="grid grid-cols-18 gap-1 border-b border-gray-100">
              <div className="p-3 font-medium text-gray-900 border-r border-gray-200">
                <div className="text-sm">{site.name}</div>
                <div className="text-xs text-gray-500">
                  {site.required_base + site.required_relief} posts
                </div>
              </div>
              
              {monthDays.map((day) => {
                const dayAssignments = getAssignmentsForDate(day).filter(a => a.site_id === site.id)
                const unfilledCount = dayAssignments.filter(a => a.status === 'unfilled').length
                
                return (
                  <div key={day.toISOString()} className="p-1 min-h-[60px] border-r border-gray-100">
                    <div className="space-y-1">
                      {dayAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`text-xs p-1 rounded ${
                            assignment.status === 'unfilled'
                              ? 'bg-danger-100 text-danger-800'
                              : showOnOffOverlay && assignment.guard_id
                              ? getGuardStatus(assignment.guard_id, day) === 'ON'
                                ? 'bg-success-100 text-success-800'
                                : 'bg-gray-100 text-gray-600'
                              : 'bg-primary-100 text-primary-800'
                          }`}
                        >
                          {assignment.status === 'unfilled' ? (
                            <button className="w-full text-xs font-medium">
                              Fill
                            </button>
                          ) : (
                            <div>
                              <div className="font-medium">
                                {assignment.guard?.badge || 'Unknown'}
                              </div>
                              {showOnOffOverlay && (
                                <div className="text-xs opacity-75">
                                  {getGuardStatus(assignment.guard_id, day)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {unfilledCount > 0 && (
                        <div className="text-xs text-danger-600 font-medium">
                          {unfilledCount} unfilled
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-primary-100 rounded mr-2"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-danger-100 rounded mr-2"></div>
            <span>Unfilled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-success-100 rounded mr-2"></div>
            <span>ON Duty</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span>OFF Duty</span>
          </div>
        </div>
      </div>
    </div>
  )
}







