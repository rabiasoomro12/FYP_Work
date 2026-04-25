import { createContext, useContext, useState, ReactNode } from 'react';

export interface ScanResult {
  imageUrl: string;
  predictedClass: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface ScanContextType {
  scanResult: ScanResult | null;
  setScanResult: (r: ScanResult | null) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  return (
    <ScanContext.Provider value={{ scanResult, setScanResult }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
