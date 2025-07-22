'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY;
  
  if (!apiKey) {
    console.warn('NEXT_PUBLIC_CDP_CLIENT_API_KEY not found. MiniKit features will be limited.');
    return <>{children}</>;
  }

  return (
    <MiniKitProvider
      apiKey={apiKey}
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
} 