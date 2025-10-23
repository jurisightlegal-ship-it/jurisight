"use client";

import React, { createContext, useContext } from "react";
import { MagazinePopup, useMagazinePopup } from "./magazine-popup";

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
      <MagazinePopup isOpen={isOpen} onClose={closePopup} />
    </MagazinePopupContext.Provider>
  );
}
