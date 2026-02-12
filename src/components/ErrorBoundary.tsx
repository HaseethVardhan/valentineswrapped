import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        // Error is intentionally not logged to the console in production
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-destructive">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6">
                        Something unexpected happened. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
