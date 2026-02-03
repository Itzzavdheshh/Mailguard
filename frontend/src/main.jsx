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
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1e293b',
          colorText: '#1e293b',
          colorTextSecondary: '#64748b',
          colorDanger: '#ef4444',
          borderRadius: '0.5rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        elements: {
          rootBox: 'flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50',
          card: 'bg-white shadow-2xl border border-slate-200',
          headerTitle: 'text-slate-900 text-2xl font-bold',
          headerSubtitle: 'text-slate-600 text-sm',
          formFieldLabel: 'text-slate-700 font-medium text-sm',
          formFieldInput: 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-400',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200',
          footerActionLink: 'text-indigo-600 hover:text-indigo-700 font-semibold',
          footerActionText: 'text-slate-600',
          socialButtonsBlockButton: 'bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200',
          socialButtonsBlockButtonText: 'text-slate-700 font-medium',
          dividerLine: 'bg-slate-200',
          dividerText: 'text-slate-500 bg-white',
          formFieldInputShowPasswordButton: 'text-slate-500 hover:text-slate-700',
          identityPreviewText: 'text-slate-700',
          identityPreviewEditButton: 'text-indigo-600 hover:text-indigo-700',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
