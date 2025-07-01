import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="max-w-md w-full card p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold font-display text-neutral-900 mb-2">Something went wrong!</h1>
            <p className="text-neutral-600 mb-6">We encountered an unexpected error while loading the application.</p>
            
            <details className="text-left mb-6 bg-neutral-50 rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                View Error Details
              </summary>
              <pre className="mt-3 text-xs text-neutral-600 bg-white p-3 rounded-lg overflow-auto border border-neutral-200">
                {this.state.error?.toString()}
              </pre>
            </details>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reload Page</span>
              </button>
              <button 
                onClick={() => window.history.back()}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
