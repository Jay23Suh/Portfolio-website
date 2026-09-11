import React, { createContext, useContext, useState } from 'react';

interface HeaderVisibilityContextValue {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextValue>({
  hidden: false,
  setHidden: () => {},
});

export const HeaderVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hidden, setHidden] = useState(false);
  return (
    <HeaderVisibilityContext.Provider value={{ hidden, setHidden }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};

export const useHeaderVisibility = () => useContext(HeaderVisibilityContext);
