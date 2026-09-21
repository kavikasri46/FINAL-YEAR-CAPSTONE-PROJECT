import React, { Component, ErrorInfo, ReactNode } from "react";
import { Shield, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = "/auth";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-2xl border border-purple-500/30 bg-card/90 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold font-display">EduGuard System</h1>
            <p className="text-sm text-muted-foreground">
              A temporary display error occurred while loading this page.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className="h-4 w-4" /> Reload & Reset Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
