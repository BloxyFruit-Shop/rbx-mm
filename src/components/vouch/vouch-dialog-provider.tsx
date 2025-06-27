"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { VouchDialog } from "./vouch-dialog";
import type { Id } from "~convex/_generated/dataModel";

interface VouchDialogContextType {
  openVouchDialog: (params: {
    toUserId: Id<"user">;
    toUserName: string;
    tradeAdId?: Id<"tradeAds">;
    sessionId: Id<"session">;
  }) => void;
}

const VouchDialogContext = createContext<VouchDialogContextType | undefined>(undefined);

export function useVouchDialog() {
  const context = useContext(VouchDialogContext);
  if (!context) {
    throw new Error("useVouchDialog must be used within a VouchDialogProvider");
  }
  return context;
}

interface VouchDialogProviderProps {
  children: ReactNode;
}

export function VouchDialogProvider({ children }: VouchDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogParams, setDialogParams] = useState<{
    toUserId: Id<"user">;
    toUserName: string;
    tradeAdId?: Id<"tradeAds">;
    sessionId: Id<"session">;
  } | null>(null);

  const openVouchDialog = (params: {
    toUserId: Id<"user">;
    toUserName: string;
    tradeAdId?: Id<"tradeAds">;
    sessionId: Id<"session">;
  }) => {
    setDialogParams(params);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setDialogParams(null);
  };

  return (
    <VouchDialogContext.Provider value={{ openVouchDialog }}>
      {children}
      {dialogParams && (
        <VouchDialog
          open={isOpen}
          onOpenChange={handleClose}
          toUserId={dialogParams.toUserId}
          toUserName={dialogParams.toUserName}
          tradeAdId={dialogParams.tradeAdId}
          sessionId={dialogParams.sessionId}
        />
      )}
    </VouchDialogContext.Provider>
  );
}