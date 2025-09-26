'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePreloader, useAPILoading } from '@/hooks/use-loading';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { 
  Loader2, 
  Download, 
  Upload, 
  RefreshCw, 
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function TestPreloaderPage() {
  const preloader = usePreloader();
  const { fetchWithLoading, fetchWithProgress } = useAPILoading();
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicLoading = async () => {
    preloader.setLoading(true, {
      message: 'Testing basic loading...',
      variant: 'default'
    });
    
    setTimeout(() => {
      preloader.hideLoading();
      addResult('Basic loading completed');
    }, 2000);
  };

  const testFullscreenLoading = async () => {
    preloader.showPageTransition();
    
    setTimeout(() => {
      preloader.hideLoading();
      addResult('Fullscreen loading completed');
    }, 3000);
  };

  const testProgressLoading = async () => {
    preloader.setLoading(true, {
      message: 'Testing progress loading...',
      variant: 'default',
      showProgress: true,
      progress: 0
    });

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      preloader.setProgress(i);
    }
    
    preloader.hideLoading();
    addResult('Progress loading completed');
  };

  const testAPILoading = async () => {
    try {
      await fetchWithLoading(
        '/api/articles?limit=5',
        {},
        { message: 'Testing API loading...' }
      );
      addResult('API loading completed');
    } catch (error) {
      addResult('API loading failed');
    }
  };

  const testProgressAPI = async () => {
    try {
      await fetchWithProgress(
        '/api/articles?limit=10',
        {},
        { message: 'Testing progress API...' }
      );
      addResult('Progress API completed');
    } catch (error) {
      addResult('Progress API failed');
    }
  };

  const testMinimalLoading = async () => {
    preloader.showInlineLoading('Testing minimal loading...');
    
    setTimeout(() => {
      preloader.hideLoading();
      addResult('Minimal loading completed');
    }, 1500);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Preloader System Demo
            </h1>
            <p className="text-lg text-gray-600">
              Test different types of loading states and animations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Basic Loading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5" />
                  Basic Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Standard loading with spinner and message
                </p>
                <Button 
                  onClick={testBasicLoading}
                  className="w-full"
                  variant="outline"
                >
                  Test Basic Loading
                </Button>
              </CardContent>
            </Card>

            {/* Fullscreen Loading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Fullscreen Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Full-screen loading with animations
                </p>
                <Button 
                  onClick={testFullscreenLoading}
                  className="w-full"
                  variant="outline"
                >
                  Test Fullscreen
                </Button>
              </CardContent>
            </Card>

            {/* Progress Loading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progress Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Loading with progress bar
                </p>
                <Button 
                  onClick={testProgressLoading}
                  className="w-full"
                  variant="outline"
                >
                  Test Progress
                </Button>
              </CardContent>
            </Card>

            {/* API Loading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  API Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Loading with API call
                </p>
                <Button 
                  onClick={testAPILoading}
                  className="w-full"
                  variant="outline"
                >
                  Test API Loading
                </Button>
              </CardContent>
            </Card>

            {/* Progress API */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Progress API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  API call with progress updates
                </p>
                <Button 
                  onClick={testProgressAPI}
                  className="w-full"
                  variant="outline"
                >
                  Test Progress API
                </Button>
              </CardContent>
            </Card>

            {/* Minimal Loading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Minimal Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Inline minimal loading
                </p>
                <Button 
                  onClick={testMinimalLoading}
                  className="w-full"
                  variant="outline"
                >
                  Test Minimal
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Test Results
                </span>
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  size="sm"
                >
                  Clear Results
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No tests run yet. Click any button above to test the preloader system.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800"
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Usage:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { usePreloader } from '@/hooks/use-loading';

const { setLoading, hideLoading } = usePreloader();

// Show loading
setLoading(true, { message: 'Loading...' });

// Hide loading
hideLoading();`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">API Loading:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useAPILoading } from '@/hooks/use-loading';

const { fetchWithLoading } = useAPILoading();

const data = await fetchWithLoading(
  '/api/articles',
  {},
  { message: 'Loading articles...' }
);`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
