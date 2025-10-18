import { Button } from './ui/MobileComponents'

export default function DemoModeBanner() {
  const isDemoMode = import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co' || 
                     !import.meta.env.VITE_SUPABASE_URL

  if (!isDemoMode) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-yellow-400 text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Demo Mode:</strong> You're using demo data. 
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              Set up Supabase
            </a> 
            for full functionality.
          </p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <Button
            variant="warning"
            size="small"
            onClick={() => {
              // Hide banner for this session
              localStorage.setItem('hide-demo-banner', 'true')
              window.location.reload()
            }}
          >
            Hide
          </Button>
        </div>
      </div>
    </div>
  )
}







