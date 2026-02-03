/**
 * Main Entry Point
 * This file initializes the React application with Clerk authentication
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

// Get Clerk publishable key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to .env')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#1e293b',
          colorInputBackground: '#334155',
          colorInputText: '#f1f5f9',
          colorText: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
          borderRadius: '0.5rem',
          spacingUnit: '0.5rem',
        },
        elements: {
          rootBox: 'flex items-center justify-center min-h-screen bg-slate-900',
          card: 'bg-slate-800/90 backdrop-blur shadow-2xl border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4',
          
          headerTitle: 'text-white text-xl font-bold mb-1',
          headerSubtitle: 'text-slate-400 text-sm mb-4',
          
          socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-slate-800 border-0 py-2.5 px-4 rounded-lg font-medium shadow-sm mb-3',
          socialButtonsBlockButtonText: '!text-slate-800 font-medium',
          socialButtonsProviderIcon: 'w-5 h-5',
          
          dividerLine: 'bg-slate-700',
          dividerText: 'text-slate-500 text-xs',
          dividerRow: 'my-4',
          
          formFieldLabel: 'text-slate-300 font-medium text-sm mb-1.5',
          formFieldInput: 'bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-2.5 px-3 rounded-lg',
          formFieldRow: 'mb-3',
          
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md mt-4',
          
          footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
          footerActionText: 'text-slate-400 text-sm',
          footer: 'mt-4 text-center',
          
          formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-200',
          
          main: 'space-y-3',
          form: 'space-y-3',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
