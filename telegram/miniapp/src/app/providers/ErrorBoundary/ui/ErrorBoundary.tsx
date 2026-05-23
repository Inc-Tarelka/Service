import React, { Suspense, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorPage } from 'widgets/ErrorPage/ui/ErrorPage';
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryInnerProps extends ErrorBoundaryProps {
  resetKey: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryInner extends React.Component<
  ErrorBoundaryInnerProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ErrorBoundaryInnerProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Suspense fallback="">
          <ErrorPage />
        </Suspense>
      );
    }

    return children;
  }
}

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <ErrorBoundaryInner resetKey={resetKey}>{children}</ErrorBoundaryInner>
  );
};

export default ErrorBoundary;
