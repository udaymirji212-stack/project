import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#FAF7F2]">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#0D2818]/15 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#0D2818]">Rendering Issue Detected</h3>
            <p className="text-xs text-[#0D2818]/70 font-sans leading-relaxed">
              An unexpected component error occurred. You can reload this view to continue.
            </p>
            {this.state.error && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl text-[11px] font-mono text-rose-800 overflow-x-auto text-left border border-rose-200">
                {this.state.error.message}
              </div>
            )}
            <Button
              variant="accent"
              size="md"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mx-auto"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
