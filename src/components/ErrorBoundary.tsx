import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  readonly children: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-[440px] flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-error mb-2" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.12" />
              <path d="M24 16v10M24 30v2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-sans font-bold text-[24px] text-text-primary">
            Something went wrong
          </h2>
          <p className="text-base text-text-secondary">
            An unexpected error occurred. Please refresh and try again.
          </p>
          <button
            className="mt-6 py-4 px-8 min-h-12 rounded-full font-sans font-bold text-md cursor-pointer bg-accent text-accent-text border-none transition-colors duration-150 ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            onClick={() => this.setState({ hasError: false, error: null })}
            type="button"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
