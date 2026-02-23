"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

type EditModeContextType = {
  isEditMode: boolean;
  setEditMode: (v: boolean) => void;
  canEdit: boolean;
};

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isEditMode, setEditMode] = useState(false);
  const canEdit = status === "authenticated";

  return (
    <EditModeContext.Provider
      value={{
        isEditMode: canEdit ? isEditMode : false,
        setEditMode,
        canEdit,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used within EditModeProvider");
  return ctx;
}
