/**
 * DashboardLayout Component
 * Main layout wrapper with sidebar and header
 */

import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
