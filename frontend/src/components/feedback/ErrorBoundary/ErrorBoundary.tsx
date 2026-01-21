import React, { Component, type ReactNode } from 'react';
import { Alert } from '../Alert';
import { Button } from '../../action';
import { Stack } from '../../layout';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Stack direction="column" align="center" justify="center" gap="md" className="error-boundary">
          <Alert severity="error" title="Something went wrong">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Alert>
          <Button variant="primary" onClick={this.handleReset}>
            Try again
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
