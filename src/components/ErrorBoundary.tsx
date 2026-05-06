import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surfaced to the console in case the host has remote logging hooked up.
    console.error('Mareo render error:', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ hasError: false, message: undefined });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="thal-errorboundary">
        <div className="thal-errorboundary-inner">
          <div className="thal-eyebrow">Something went wrong</div>
          <h2 className="thal-h3">The dashboard hit an unexpected error.</h2>
          {this.state.message && <p className="thal-errorboundary-msg">{this.state.message}</p>}
          <button className="thal-btn thal-btn--primary" onClick={this.reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}
