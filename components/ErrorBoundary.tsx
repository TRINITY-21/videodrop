"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                An unexpected error occurred. This is usually caused by a browser compatibility issue or memory limit.
              </p>
            </div>
            {this.state.error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-left">
                <p className="text-xs font-mono text-red-400/80 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl font-medium text-sm bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="w-full py-3 rounded-xl font-medium text-sm text-zinc-400 border border-white/8 hover:border-white/15 hover:text-zinc-300 transition-all inline-block"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
