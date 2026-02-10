/**
 * REGISTER PAGE
 * New user registration using Clerk
 */

import { SignUp } from '@clerk/clerk-react'
import Logo from '../components/Logo'

function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-purple-500/10 w-full max-w-md p-6 sm:p-8">
        {/* Header with Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm sm:text-base">Join Mailguard for AI protection</p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="flex justify-center w-full">
          <SignUp 
            routing="path"
            path="/register"
            signInUrl="/login"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}

export default Register
