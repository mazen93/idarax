'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Catches React rendering errors and displays a premium 
 * fallback UI instead of a white screen or raw crash.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 bg-[var(--background)] border border-border rounded-3xl text-center">
          <div className="w-16 h-16 bg-error-500/10 border border-error-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-error-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            The application encountered an unexpected error. We&apos;ve been notified and are working on a fix.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-border rounded-xl font-bold transition-all"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 w-full max-w-2xl text-left bg-black/40 border border-border rounded-2xl p-6 overflow-auto">
              <p className="text-error-400 font-mono text-xs mb-2 font-bold uppercase tracking-wider">Debug Info:</p>
              <pre className="text-muted-foreground font-mono text-[10px] whitespace-pre-wrap">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
