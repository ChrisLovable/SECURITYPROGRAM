import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { formatDateWithDay } from '@/utils/scheduling'

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all')
  const queryClient = useQueryClient()

  // Get all notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => db.getNotifications()
  })

  // Retry notification mutation (stub)
  const retryNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // In a real implementation, this would trigger the notification again
      console.log('Retrying notification:', notificationId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Dismiss notification mutation (stub)
  const dismissNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // In a real implementation, this would mark the notification as dismissed
      console.log('Dismissing notification:', notificationId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const handleRetry = (notificationId: string) => {
    if (confirm('Retry sending this notification?')) {
      retryNotificationMutation.mutate(notificationId)
    }
  }

  const handleDismiss = (notificationId: string) => {
    if (confirm('Dismiss this notification?')) {
      dismissNotificationMutation.mutate(notificationId)
    }
  }

  const filteredNotifications = notifications?.data?.filter(notification => {
    if (filter === 'pending') return !notification.delivered
    if (filter === 'delivered') return notification.delivered
    return true
  }) || []

  const pendingCount = notifications?.data?.filter(n => !n.delivered).length || 0
  const deliveredCount = notifications?.data?.filter(n => n.delivered).length || 0
  const totalCount = notifications?.data?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-2 text-lg text-gray-600">
            Monitor scheduled notifications and alerts
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {totalCount}
            </div>
            <div className="text-lg text-gray-600 mt-1">Total Notifications</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {pendingCount}
            </div>
            <div className="text-lg text-gray-600 mt-1">Pending</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {deliveredCount}
            </div>
            <div className="text-lg text-gray-600 mt-1">Delivered</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'delivered'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.delivered
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.delivered
                          ? 'bg-success-100 text-success-800'
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {notification.delivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {notification.body}
                    </p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        <strong>Guard:</strong> {notification.guard?.badge} - {notification.guard?.full_name}
                      </div>
                      <div>
                        <strong>Scheduled for:</strong> {formatDateWithDay(new Date(notification.deliver_at))}
                      </div>
                      <div>
                        <strong>Created:</strong> {formatDateWithDay(new Date(notification.created_at))}
                      </div>
                    </div>
                  </div>
                  
                  {!notification.delivered && (
                    <div className="mt-4 lg:mt-0 flex space-x-2">
                      <button
                        onClick={() => handleRetry(notification.id)}
                        disabled={retryNotificationMutation.isPending}
                        className="btn btn-secondary btn-sm"
                      >
                        🔄 Retry
                      </button>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        disabled={dismissNotificationMutation.isPending}
                        className="btn btn-danger btn-sm"
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-lg text-gray-600">
              No notifications found for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Automatic Notifications
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• <strong>7 days before:</strong> Going OFF duty reminder</li>
            <li>• <strong>1 day before:</strong> Going OFF duty reminder</li>
            <li>• <strong>7 days before:</strong> Coming ON duty reminder</li>
            <li>• <strong>1 day before:</strong> Coming ON duty reminder</li>
            <li>• <strong>Site changes:</strong> When guard is moved to different site</li>
            <li>• <strong>Swap updates:</strong> When swap requests are approved/rejected</li>
          </ul>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Supervisor Alerts
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• <strong>Daily:</strong> Unfilled gaps in next 7 days</li>
            <li>• <strong>Immediate:</strong> New swap requests pending approval</li>
            <li>• <strong>Weekly:</strong> Resourcing analysis and recommendations</li>
            <li>• <strong>Critical:</strong> Coverage below 90% for any day</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Notification Management</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• <strong>Pending:</strong> Notifications scheduled but not yet sent</li>
          <li>• <strong>Delivered:</strong> Notifications that have been sent to guards</li>
          <li>• <strong>Retry:</strong> Resend a failed notification</li>
          <li>• <strong>Dismiss:</strong> Cancel a pending notification</li>
          <li>• Notifications are sent via web push, SMS, and in-app alerts</li>
        </ul>
      </div>
    </div>
  )
}








