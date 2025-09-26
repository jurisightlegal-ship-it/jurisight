"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to true after hydration
    setIsClient(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, isClient };
};

export const Component = () => {
  const { width, height, isClient } = useWindowSize();

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className={cn("flex flex-col items-center")}>
        <div 
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "650px"
          }}
          className=""
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center")}>
        <UnicornScene 
        production={true} projectId="cbmTT38A0CcuYxeiyj5H" width={width} height={height} />
    </div>
  );
};

