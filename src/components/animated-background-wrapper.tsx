"use client";

import dynamic from 'next/dynamic';

const RaycastAnimatedBackground = dynamic(
  () => import('@/components/ui/raycast-animated-background').then(mod => ({ default: mod.Component })),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
    )
  }
);

export default function AnimatedBackgroundWrapper() {
  return <RaycastAnimatedBackground />;
}
