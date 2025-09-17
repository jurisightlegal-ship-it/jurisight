'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-jurisight-navy">Jurisight</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user?.name}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-jurisight-navy text-jurisight-navy hover:bg-jurisight-navy hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Welcome Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-jurisight-navy">
                  Welcome to Jurisight Dashboard
                </CardTitle>
                <CardDescription>
                  Your role: <span className="font-semibold text-jurisight-royal">{session.user?.role}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You're logged in with {session.user?.email}. 
                  {session.user?.role === 'CONTRIBUTOR' && ' You can create and submit articles for review.'}
                  {session.user?.role === 'EDITOR' && ' You can review and approve articles from contributors.'}
                  {session.user?.role === 'ADMIN' && ' You have full access to manage the platform.'}
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {session.user?.role === 'CONTRIBUTOR' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Article</CardTitle>
                  <CardDescription>
                    Write a new legal article
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-jurisight-lime text-jurisight-navy hover:bg-jurisight-lime-dark">
                    New Article
                  </Button>
                </CardContent>
              </Card>
            )}

            {session.user?.role === 'EDITOR' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Queue</CardTitle>
                  <CardDescription>
                    Articles waiting for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-jurisight-teal text-white hover:bg-jurisight-teal-dark">
                    Review Articles
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* My Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Articles</CardTitle>
                <CardDescription>
                  {session.user?.role === 'CONTRIBUTOR' ? 'Your submitted articles' : 'All articles'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  No articles yet. Start writing!
                </div>
              </CardContent>
            </Card>

            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> {session.user?.email}</p>
                  <p className="text-sm"><strong>Role:</strong> {session.user?.role}</p>
                  <p className="text-sm"><strong>Status:</strong> 
                    <span className={`ml-1 ${session.user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {session.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
