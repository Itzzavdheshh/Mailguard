import React from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * ErrorBoundary Component
 * Catches unhandled React errors and displays a fallback UI
 * Prevents entire app from crashing on component errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('❌ ErrorBoundary caught an error:', error)
    console.error('❌ Component stack:', errorInfo.componentStack)
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    // Reload the page to reset the app
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/50 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            </div>
            
            <p className="text-gray-300 mb-6">
              An unexpected error occurred. This has been logged for investigation.
            </p>

            <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-6 overflow-auto max-h-64">
              <p className="text-red-400 font-mono text-sm mb-2">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
