"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ChainedFile {
  file: File;
  from: string; // tool name the file came from
}

interface ChainContextType {
  chainedFile: ChainedFile | null;
  setChainedFile: (file: ChainedFile | null) => void;
  consumeChainedFile: () => ChainedFile | null;
}

const ChainContext = createContext<ChainContextType>({
  chainedFile: null,
  setChainedFile: () => {},
  consumeChainedFile: () => null,
});

export function ChainProvider({ children }: { children: ReactNode }) {
  const [chainedFile, setChainedFile] = useState<ChainedFile | null>(null);

  const consumeChainedFile = useCallback(() => {
    const file = chainedFile;
    setChainedFile(null);
    return file;
  }, [chainedFile]);

  return (
    <ChainContext.Provider value={{ chainedFile, setChainedFile, consumeChainedFile }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  return useContext(ChainContext);
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}
