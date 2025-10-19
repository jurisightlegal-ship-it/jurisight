'use client';

import { useEffect } from 'react';

interface ClarityProviderProps {
  children: React.ReactNode;
}

export function ClarityProvider({ children }: ClarityProviderProps) {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    // Only initialize Clarity if we have a valid project ID
    if (projectId && projectId !== 'your-clarity-project-id-here') {
      try {
        // Load Microsoft Clarity script dynamically
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `;
        document.head.appendChild(script);
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
