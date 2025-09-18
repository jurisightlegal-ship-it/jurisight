"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";

export function WhatsAppCommunityBadge() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="https://chat.whatsapp.com/Df10PVVWVde7Akhe1hPUmV?mode=ems_copy_c"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <Users className="h-3 w-3 absolute -top-1 -right-1 bg-white text-green-500 rounded-full p-0.5" />
          </div>
          
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isHovered ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <span className="font-medium whitespace-nowrap">
              Join our WhatsApp community
            </span>
          </div>
        </div>
        
        {/* Pulse animation when not hovered */}
        {!isHovered && (
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
      </Link>
    </div>
  );
}

export default WhatsAppCommunityBadge;
