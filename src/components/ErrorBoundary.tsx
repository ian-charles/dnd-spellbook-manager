/**
 * Error Boundary Component
 *
 * React Error Boundary to catch rendering errors and display a fallback UI
 * instead of the entire app crashing with a white screen.
 *
 * Best Practices:
 * - Must be a class component (React doesn't support error boundaries as hooks yet)
 * - Catches errors in child component tree during rendering, lifecycle methods, and constructors
 * - Does NOT catch errors in event handlers, async code, or SSR
 * - Provides user-friendly error message and option to reload
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error logging service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReload = (): void => {
    // Clear error state and attempt to recover
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the page to reset app state
    window.location.reload();
  };

  handleReset = (): void => {
    // Clear error state without reloading (attempt recovery)
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon" aria-hidden="true">
              ⚠️
            </div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry, but the app encountered an unexpected error.
              <br />
              Don't worry - your spellbook data is safe!
            </p>

            <div className="error-actions">
              <button
                className="btn-primary"
                onClick={this.handleReload}
                aria-label="Reload the page"
              >
                Reload Page
              </button>
              <button
                className="btn-secondary"
                onClick={this.handleReset}
                aria-label="Try to continue without reloading"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Technical Details (Development Only)</summary>
                <div className="error-stack">
                  <h3>Error Message:</h3>
                  <pre>{this.state.error.toString()}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}

                  {this.state.error.stack && (
                    <>
                      <h3>Stack Trace:</h3>
                      <pre>{this.state.error.stack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
