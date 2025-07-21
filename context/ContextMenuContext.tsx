import React, { createContext, useContext, useState } from "react";



export type ContextMenuContextType = {
  showMenu: boolean,
  menuX: number,
  menuY: number,
  additionalMenuItems: Array<React.ReactNode>,
  populateContextMenu: (x: number, y: number) => void
}

export const ContextMenuContext = createContext<ContextMenuContextType | null>(null)

type ContextMenuContextProviderProps = {
  children?: React.ReactNode
}

export function ContextMenuContextProvider({children}: ContextMenuContextProviderProps) {

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuX, setMenuX] = useState<number>(0);
  const [menuY, setMenuY] = useState<number>(0);
  const [additionalMenuItems, setAdditionalMenuItems] = useState<Array<React.ReactNode>>([]);

  function populateContextMenu (x: number, y: number) {
    setShowMenu(true);
    setMenuX(x);
    setMenuY(y);
    return;
  }

  return (
    <ContextMenuContext.Provider 
      value={{
        showMenu,
        menuX,
        menuY,
        additionalMenuItems,
        populateContextMenu
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  )
}

export function useContextMenuContext() {

  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenuContext must be in ContextMenuContextProvider")
  }

  return context;
}