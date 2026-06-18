import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Tab = 'today' | 'stats' | 'settings';

export type Modal =
  | { type: 'add' }
  | { type: 'edit'; habitId: string }
  | { type: 'detail'; habitId: string };

interface NavContextValue {
  tab: Tab;
  setTab: (t: Tab) => void;
  stack: Modal[];
  top: Modal | null;
  push: (m: Modal) => void;
  pop: () => void;
  reset: () => void;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('today');
  const [stack, setStack] = useState<Modal[]>([]);

  const push = useCallback((m: Modal) => setStack((s) => [...s, m]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const reset = useCallback(() => setStack([]), []);

  const value = useMemo<NavContextValue>(
    () => ({ tab, setTab, stack, top: stack[stack.length - 1] ?? null, push, pop, reset }),
    [tab, stack, push, pop, reset]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
