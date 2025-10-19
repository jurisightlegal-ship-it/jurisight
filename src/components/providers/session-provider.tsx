'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useClarity } from '@/hooks/use-clarity';

interface ProvidersProps {
  children: ReactNode;
}

function ClaritySessionTracker() {
  const { data: session, status } = useSession();
  const { setUserId, identify, trackEvent } = useClarity();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Set user ID for Clarity
      setUserId(session.user.id);
      
      // Identify user with additional context
      identify(
        session.user.id,
        undefined, // sessionId - let Clarity generate
        undefined, // pageId - let Clarity generate
        session.user.name || session.user.email || 'Anonymous'
      );

      // Track login event
      trackEvent('user_login', {
        userId: session.user.id,
        userRole: session.user.role || 'USER',
        userEmail: session.user.email,
      });

      console.log('Clarity: User session tracked');
    } else if (status === 'unauthenticated') {
      // Track logout event
      trackEvent('user_logout');
      console.log('Clarity: User logged out');
    }
  }, [session, status, setUserId, identify, trackEvent]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ClaritySessionTracker />
      {children}
    </SessionProvider>
  );
}
