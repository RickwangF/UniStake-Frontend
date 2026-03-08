"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface BalanceContextType {
  refreshFlag: number;
  triggerRefresh: () => void;
}

const BalanceContext = createContext<BalanceContextType>({
  refreshFlag: 0,
  triggerRefresh: () => {},
});

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  return (
    <BalanceContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  return useContext(BalanceContext);
}
