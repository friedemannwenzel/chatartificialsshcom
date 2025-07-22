"use client";

import { useEffect, ReactNode } from "react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface MiniKitWrapperProps {
  children: ReactNode;
}

export function MiniKitWrapper({ children }: MiniKitWrapperProps) {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady && setFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <>{children}</>;
} 