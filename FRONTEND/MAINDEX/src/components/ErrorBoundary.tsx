import React from 'react'
import { Text, Button } from 'uikit'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{ padding: 24, background: '#1a1a1a', color: '#fff', minHeight: 200 }}>
          <Text bold mb="16px">Something went wrong</Text>
          <Text fontSize="14px" color="textSubtle" mb="16px">
            {this.state.error.message}
          </Text>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="primary"
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
