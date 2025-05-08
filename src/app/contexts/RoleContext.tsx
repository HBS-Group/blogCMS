// app/contexts/RoleContext.tsx
'use client' // This directive is crucial

import { createContext, useContext, ReactNode, useMemo } from 'react';

type RoleContextType = {
  role: string | null;
};

// Create the context with a default undefined value
const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Custom hook to use the RoleContext
export const useUserRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a RoleProvider');
  }
  return context;
};

// Provider component
export const RoleProvider = ({ children, role }: { children: ReactNode; role: string | null }) => {
  // useMemo to prevent unnecessary re-renders if role prop doesn't change
  const value = useMemo(() => ({ role }), [role]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};