/**
 * Main App Component
 * This is the root component of the Mailguard Frontend
 */

import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          🛡️ Mailguard
        </h1>
        <p className="text-gray-600 text-center mb-6">
          AI-Powered Phishing Detection System
        </p>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-2xl font-semibold text-blue-800 text-center mb-2">
            Count: {count}
          </p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            Click to Test Tailwind
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800 font-medium">✅ React</span>
            <span className="text-green-600">Loaded</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-800 font-medium">🎨 Tailwind CSS</span>
            <span className="text-purple-600">Working</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <span className="text-orange-800 font-medium">⚡ Vite</span>
            <span className="text-orange-600">Ready</span>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Phase 5 - Frontend Dashboard
        </p>
      </div>
    </div>
  )
}

export default App
