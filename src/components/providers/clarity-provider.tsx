'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

interface ClarityProviderProps {
  children: React.ReactNode;
}

export function ClarityProvider({ children }: ClarityProviderProps) {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    // Only initialize Clarity if we have a valid project ID
    if (projectId && projectId !== 'your-clarity-project-id-here') {
      try {
        clarity.init(projectId);
        console.log('Microsoft Clarity initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Microsoft Clarity:', error);
      }
    } else {
      console.warn('Microsoft Clarity project ID not configured. Please set NEXT_PUBLIC_CLARITY_PROJECT_ID in your environment variables.');
    }
  }, []);

  return <>{children}</>;
}

export default ClarityProvider;
