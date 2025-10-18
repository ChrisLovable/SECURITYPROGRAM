import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await signIn(email)
    
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            GuardRoster
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Security Guard Scheduling
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10"
              placeholder="Enter your email"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-lg ${
              message.includes('Error') 
                ? 'bg-danger-50 text-danger-700 border border-danger-200' 
                : 'bg-success-50 text-success-700 border border-success-200'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large w-full"
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              We'll send you a secure link to sign in
            </p>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Demo Access</h3>
          <p className="text-blue-700 text-sm">
            Use any email address to receive a login link. 
            The system will create a temporary session for demonstration.
          </p>
        </div>
      </div>
    </div>
  )
}







