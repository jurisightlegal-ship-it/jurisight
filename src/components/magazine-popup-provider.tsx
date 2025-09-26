"use client";

import React from "react";
import { MagazinePopup, useMagazinePopup } from "./magazine-popup";

interface MagazinePopupProviderProps {
  children: React.ReactNode;
}

export function MagazinePopupProvider({ children }: MagazinePopupProviderProps) {
  const { isOpen, closePopup } = useMagazinePopup();

  return (
    <>
      {children}
      <MagazinePopup isOpen={isOpen} onClose={closePopup} />
    </>
  );
}
