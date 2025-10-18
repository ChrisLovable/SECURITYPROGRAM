import { useState } from 'react'
import GuardTimetableModal from '@/components/GuardTimetableModal'
import PersonalInformationModal from '@/components/PersonalInformationModal'
import DashboardModal from '@/components/DashboardModal'
import SiteInformationModal from '@/components/SiteInformationModal'
import GuardIntelligenceModal from '@/components/GuardIntelligenceModal'
import InventoryModal from '@/components/InventoryModal'
import FirearmInventoryModal from '@/components/FirearmInventoryModal'

export default function DashboardPage() {
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false)
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)
  const [isSiteInfoModalOpen, setIsSiteInfoModalOpen] = useState(false)
  const [isGuardIntelligenceModalOpen, setIsGuardIntelligenceModalOpen] = useState(false)
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false)
  const [isFirearmInventoryModalOpen, setIsFirearmInventoryModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Mobile-first interface with three buttons */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">GuardRoster</h1>
            <p className="text-gray-600">Security Management System</p>
          </div>
          
                 <div className="space-y-4">
                   <button
                     onClick={() => setIsTimetableModalOpen(true)}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     📅 Guard Timetable
                   </button>

                   <button
                     onClick={() => setIsPersonalInfoModalOpen(true)}
                     className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     👤 Personal Information
                   </button>

                   <button
                     onClick={() => setIsSiteInfoModalOpen(true)}
                     className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     🏢 Site Information
                   </button>

                   <button
                     onClick={() => setIsDashboardModalOpen(true)}
                     className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     📊 Dashboard
                   </button>

                   <button
                     onClick={() => setIsGuardIntelligenceModalOpen(true)}
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     🧠 Guard Intelligence
                   </button>

                   <button
                     onClick={() => setIsInventoryModalOpen(true)}
                     className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     📦 Inventory
                   </button>

                   <button
                     onClick={() => setIsFirearmInventoryModalOpen(true)}
                     className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 shadow-md"
                   >
                     🔫 Firearm Inventory
                   </button>
                 </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Manage guard schedules and personal details
          </p>
        </div>
      </div>

      {/* Guard Timetable Modal */}
      <GuardTimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
      />

      {/* Personal Information Modal */}
      <PersonalInformationModal
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
      />

             {/* Dashboard Modal */}
             <DashboardModal
               isOpen={isDashboardModalOpen}
               onClose={() => setIsDashboardModalOpen(false)}
             />

             {/* Site Information Modal */}
             <SiteInformationModal
               isOpen={isSiteInfoModalOpen}
               onClose={() => setIsSiteInfoModalOpen(false)}
             />

             {/* Guard Intelligence Modal */}
             <GuardIntelligenceModal
               isOpen={isGuardIntelligenceModalOpen}
               onClose={() => setIsGuardIntelligenceModalOpen(false)}
             />

             {/* Inventory Modal */}
             <InventoryModal
               isOpen={isInventoryModalOpen}
               onClose={() => setIsInventoryModalOpen(false)}
             />

             {/* Firearm Inventory Modal */}
             <FirearmInventoryModal
               isOpen={isFirearmInventoryModalOpen}
               onClose={() => setIsFirearmInventoryModalOpen(false)}
             />
           </div>
         )
       }