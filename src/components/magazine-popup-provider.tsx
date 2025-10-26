"use client";

import React, { createContext, useContext } from "react";
import dynamic from "next/dynamic";
import { useMagazinePopup } from "./magazine-popup";

const MagazinePopupLazy = dynamic(() => import("./magazine-popup").then(m => m.MagazinePopup), {
  ssr: false,
});

interface MagazinePopupContextType {
  openPopup: () => void;
  isOpen: boolean;
}

const MagazinePopupContext = createContext<MagazinePopupContextType | undefined>(undefined);

export function useMagazinePopupContext() {
  const context = useContext(MagazinePopupContext);
  if (context === undefined) {
    throw new Error('useMagazinePopupContext must be used within a MagazinePopupProvider');
  }
  return context;
}

interface MagazinePopupProviderProps {
  children: React.ReactNode;
}

export function MagazinePopupProvider({ children }: MagazinePopupProviderProps) {
  const { isOpen, openPopup, closePopup } = useMagazinePopup();

  return (
    <MagazinePopupContext.Provider value={{ openPopup, isOpen }}>
      {children}
      <MagazinePopupLazy isOpen={isOpen} onClose={closePopup} />
    </MagazinePopupContext.Provider>
  );
}
