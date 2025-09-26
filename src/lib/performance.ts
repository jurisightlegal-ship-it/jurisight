// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure page load performance
  measurePageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.metrics.set(`${pageName}_load_time`, loadTime);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
      }
    });
  }

  // Measure component render time
  measureComponent(componentName: string, startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.set(`${componentName}_render_time`, renderTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  }

  // Measure API call performance
  measureAPI(apiName: string, startTime: number): void {
    const apiTime = performance.now() - startTime;
    this.metrics.set(`${apiName}_api_time`, apiTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${apiName} API call took ${apiTime.toFixed(2)}ms`);
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Hook for measuring component performance
export function usePerformanceMeasure(componentName: string) {
  const startTime = performance.now();
  
  return {
    measure: () => {
      PerformanceMonitor.getInstance().measureComponent(componentName, startTime);
    }
  };
}

// Hook for measuring API performance
export function useAPIPerformance() {
  return {
    measure: (apiName: string, startTime: number) => {
      PerformanceMonitor.getInstance().measureAPI(apiName, startTime);
    }
  };
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Measure First Contentful Paint (FCP)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('🎨 First Contentful Paint:', entry.startTime.toFixed(2) + 'ms');
      }
    }
  }).observe({ entryTypes: ['paint'] });

  // Measure Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('🖼️ Largest Contentful Paint:', lastEntry.startTime.toFixed(2) + 'ms');
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Measure Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    console.log('📐 Cumulative Layout Shift:', clsValue.toFixed(4));
  }).observe({ entryTypes: ['layout-shift'] });
}
