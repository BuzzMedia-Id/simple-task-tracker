// Production monitoring and error tracking utilities
// This file handles error reporting, performance monitoring, and analytics

interface ErrorReport {
  error: Error
  context?: Record<string, any>
  userId?: string
  timestamp: Date
  url: string
  userAgent: string
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  context?: Record<string, any>
}

class MonitoringService {
  private isProduction = process.env.NODE_ENV === 'production'
  private userId: string | null = null

  // Initialize monitoring with user context
  initialize(userId?: string) {
    this.userId = userId || null
    
    if (this.isProduction) {
      this.setupErrorHandlers()
      this.setupPerformanceMonitoring()
    }
  }

  // Set user context for monitoring
  setUser(userId: string) {
    this.userId = userId
  }

  // Clear user context (logout)
  clearUser() {
    this.userId = null
  }

  // Report error to monitoring service
  reportError(error: Error, context?: Record<string, any>) {
    const errorReport: ErrorReport = {
      error,
      context,
      userId: this.userId || undefined,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('MonitoringService - Error:', errorReport)
      return
    }

    // Send to error tracking service (Sentry, LogRocket, etc.)
    this.sendErrorReport(errorReport)
  }

  // Report performance metric
  reportPerformance(name: string, value: number, context?: Record<string, any>) {
    if (!this.isProduction) return

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      context
    }

    this.sendPerformanceMetric(metric)
  }

  // Track user action for analytics
  trackAction(action: string, properties?: Record<string, any>) {
    if (!this.isProduction) return

    const event = {
      action,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    }

    this.sendAnalyticsEvent(event)
  }

  // Setup global error handlers
  private setupErrorHandlers() {
    if (typeof window === 'undefined') return

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      })
    })

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          if (navigation) {
            this.reportPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart)
            this.reportPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
            this.reportPerformance('first_paint', navigation.responseStart - navigation.requestStart)
          }
        }, 0)
      })
    }
  }

  // Send error report to external service
  private sendErrorReport(errorReport: ErrorReport) {
    // This would integrate with your error tracking service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    try {
      // Example: Send to your own API endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      }).catch(err => {
        console.error('Failed to send error report:', err)
      })

      // Example: Send to Sentry (if configured)
      // if (window.Sentry) {
      //   window.Sentry.captureException(errorReport.error, {
      //     contexts: { custom: errorReport.context },
      //     user: { id: errorReport.userId }
      //   })
      // }
    } catch (err) {
      console.error('Error in error reporting:', err)
    }
  }

  // Send performance metric to external service
  private sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      // Example: Send to your analytics API
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      }).catch(err => {
        console.error('Failed to send performance metric:', err)
      })
    } catch (err) {
      console.error('Error in performance reporting:', err)
    }
  }

  // Send analytics event to external service
  private sendAnalyticsEvent(event: any) {
    try {
      // Example: Send to your analytics API
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }).catch(err => {
        console.error('Failed to send analytics event:', err)
      })

      // Example: Send to Google Analytics
      // if (window.gtag) {
      //   window.gtag('event', event.action, event.properties)
      // }
    } catch (err) {
      console.error('Error in analytics reporting:', err)
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService()

// Export convenience functions
export const reportError = (error: Error, context?: Record<string, any>) => {
  monitoring.reportError(error, context)
}

export const reportPerformance = (name: string, value: number, context?: Record<string, any>) => {
  monitoring.reportPerformance(name, value, context)
}

export const trackAction = (action: string, properties?: Record<string, any>) => {
  monitoring.trackAction(action, properties)
}

export const initializeMonitoring = (userId?: string) => {
  monitoring.initialize(userId)
}