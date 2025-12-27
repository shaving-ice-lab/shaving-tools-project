'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorDisplay error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface ErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorDisplay({ error, onRetry, title = '出现错误', description = '处理过程中发生了错误，请重试' }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 bg-muted rounded-lg text-sm font-mono overflow-auto max-h-32">{error.message}</div>}
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => console.log('Error details:', error)}>
            <Bug className="h-4 w-4 mr-2" />
            查看详情
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
