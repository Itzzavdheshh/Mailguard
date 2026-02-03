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
          colorDanger: '#ef4444',
          borderRadius: '0.5rem',
        },
        elements: {
          rootBox: 'flex items-center justify-center min-h-screen bg-slate-900',
          card: 'bg-slate-800 shadow-xl border-0 rounded-xl p-8',
          headerTitle: 'text-white text-2xl font-bold mb-2',
          headerSubtitle: 'text-slate-400 text-sm mb-6',
          formFieldLabel: 'text-slate-300 font-medium text-sm mb-2',
          formFieldInput: 'bg-slate-700 border-0 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold',
          footerActionText: 'text-slate-400',
          socialButtonsBlockButton: 'bg-white hover:bg-gray-50 border-0 py-3',
          socialButtonsBlockButtonText: 'text-gray-700 font-medium',
          socialButtonsIconButton: 'brightness-100',
          dividerLine: 'bg-slate-700 h-px',
          dividerText: 'text-slate-500 text-sm px-4',
          formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-200',
          identityPreviewText: 'text-slate-300',
          identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300',
          form: 'space-y-4',
          formFieldRow: 'mb-4',
          main: 'space-y-4',
          footer: 'mt-6',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
