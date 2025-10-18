import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'

export default function SitesPage() {
  const [editingSite, setEditingSite] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Get all sites
  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: () => db.getSites()
  })

  // Update site mutation
  const updateSiteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      db.updateSite(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      setEditingSite(null)
    }
  })

  const handleUpdateSite = (id: string, updates: any) => {
    updateSiteMutation.mutate({ id, updates })
  }

  const handleIncrement = (site: any, field: 'required_base' | 'required_relief') => {
    handleUpdateSite(site.id, {
      [field]: site[field] + 1
    })
  }

  const handleDecrement = (site: any, field: 'required_base' | 'required_relief') => {
    const newValue = Math.max(0, site[field] - 1)
    handleUpdateSite(site.id, {
      [field]: newValue
    })
  }

  const togglePermanentOnly = (site: any) => {
    handleUpdateSite(site.id, {
      permanent_only: !site.permanent_only
    })
  }

  const totalBase = sites?.data?.reduce((sum, site) => sum + site.required_base, 0) || 0
  const totalRelief = sites?.data?.reduce((sum, site) => sum + site.required_relief, 0) || 0
  const totalPosts = totalBase + totalRelief

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage security sites and staffing requirements
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {sites?.data?.length || 0}
            </div>
            <div className="text-lg text-gray-600 mt-1">Total Sites</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {totalBase}
            </div>
            <div className="text-lg text-gray-600 mt-1">Base Posts</div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {totalRelief}
            </div>
            <div className="text-lg text-gray-600 mt-1">Relief Posts</div>
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relief Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permanent Only
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites?.data?.map((site) => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-medium text-gray-900">
                      {site.name}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecrement(site, 'required_base')}
                        disabled={updateSiteMutation.isPending}
                        className="btn btn-secondary px-3 py-1 text-sm"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium min-w-[2rem] text-center">
                        {site.required_base}
                      </span>
                      <button
                        onClick={() => handleIncrement(site, 'required_base')}
                        disabled={updateSiteMutation.isPending}
                        className="btn btn-secondary px-3 py-1 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecrement(site, 'required_relief')}
                        disabled={updateSiteMutation.isPending}
                        className="btn btn-secondary px-3 py-1 text-sm"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium min-w-[2rem] text-center">
                        {site.required_relief}
                      </span>
                      <button
                        onClick={() => handleIncrement(site, 'required_relief')}
                        disabled={updateSiteMutation.isPending}
                        className="btn btn-secondary px-3 py-1 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-medium text-gray-900">
                      {site.required_base + site.required_relief}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePermanentOnly(site)}
                      disabled={updateSiteMutation.isPending}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        site.permanent_only
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {site.permanent_only ? 'Yes' : 'No'}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingSite(editingSite === site.id ? null : site.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {editingSite === site.id ? 'Done' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Use + and - buttons to adjust post requirements</li>
          <li>• Base posts are filled by permanent guards first, then rotation</li>
          <li>• Relief posts are filled only by rotation guards</li>
          <li>• "Permanent Only" sites require permanent guard assignments</li>
          <li>• Total posts across all sites: <strong>{totalPosts}</strong></li>
        </ul>
      </div>
    </div>
  )
}







