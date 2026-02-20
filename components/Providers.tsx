"use client";

import { ReactNode } from "react";
import { ChainProvider } from "@/lib/chain-context";
import { ToastProvider } from "@/lib/toast-context";
import { ProcessingProvider } from "@/lib/processing-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import FFmpegLoader from "@/components/FFmpegLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ChainProvider>
          <ProcessingProvider>
            {children}
            <FFmpegLoader />
            <KeyboardShortcuts />
          </ProcessingProvider>
        </ChainProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
