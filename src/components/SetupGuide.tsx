import { Card, Button } from './ui/MobileComponents'

export default function SetupGuide() {
  const isDemoMode = (import.meta as any).env?.VITE_SUPABASE_URL === 'https://demo.supabase.co' || 
                     !(import.meta as any).env?.VITE_SUPABASE_URL

  if (!isDemoMode) return null

  return (
    <Card className="bg-blue-50 border-blue-200">
      <div className="text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-xl font-bold text-blue-900 mb-2">
          Set Up GuardRoster
        </h3>
        <p className="text-blue-800 mb-4">
          To unlock all features, you need to set up your Supabase database.
        </p>
        
        <div className="text-left space-y-3 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">1.</span>
            <div>
              <div className="font-medium text-blue-900">Create Supabase Project</div>
              <div className="text-sm text-blue-700">
                Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and create a free project
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">2.</span>
            <div>
              <div className="font-medium text-blue-900">Run Database Migrations</div>
              <div className="text-sm text-blue-700">
                Copy the SQL files from <code className="bg-blue-100 px-1 rounded">supabase/migrations/</code> to your Supabase SQL editor
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">3.</span>
            <div>
              <div className="font-medium text-blue-900">Add Environment Variables</div>
              <div className="text-sm text-blue-700">
                Create <code className="bg-blue-100 px-1 rounded">.env.local</code> with your Supabase URL and anon key
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={() => window.open('https://supabase.com', '_blank')}
            variant="primary"
            fullWidth
          >
            Open Supabase
          </Button>
          <Button
            onClick={() => {
              // Copy setup instructions to clipboard
              const instructions = `# GuardRoster Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Run these SQL migrations in order:
   - 001_initial_schema.sql
   - 002_seed_data.sql  
   - 003_leave_management.sql
3. Create .env.local with:
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key`
              
              navigator.clipboard.writeText(instructions)
              alert('Setup instructions copied to clipboard!')
            }}
            variant="secondary"
            fullWidth
          >
            📋 Copy Setup Instructions
          </Button>
        </div>
      </div>
    </Card>
  )
}








