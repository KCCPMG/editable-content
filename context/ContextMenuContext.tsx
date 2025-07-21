import { MenuItem } from "@mui/material";
import React, { createContext, useContext, useState } from "react";
import ContextMenu from "@/components/TestComponents/ContextMenu";



export type ContextMenuContextType = {
  showMenu: boolean,
  menuX: number,
  menuY: number,
  populateContextMenu: (x: number, y: number, itemMenuProps: Array<React.ComponentProps<typeof MenuItem>>) => void,
  depopulateAndHideContextMenu: () => void,
  additionalMenuItemProps: Array<React.ComponentProps<typeof MenuItem>>
}

export const ContextMenuContext = createContext<ContextMenuContextType | null>(null)

type ContextMenuContextProviderProps = {
  children?: React.ReactNode
}

export function ContextMenuContextProvider({children}: ContextMenuContextProviderProps) {

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuX, setMenuX] = useState<number>(0);
  const [menuY, setMenuY] = useState<number>(0);
  const [additionalMenuItemProps, setAdditionalMenuItemProps] = useState<Array<React.ComponentProps<typeof MenuItem>>>([]);


  function  populateContextMenu(
    x: number, y: number, itemMenuProps: Array<React.ComponentProps<typeof MenuItem>>
  ) {
    setShowMenu(true);
    setMenuX(x);
    setMenuY(y);
    setAdditionalMenuItemProps(itemMenuProps);
    return;
  }

  function depopulateAndHideContextMenu() {
    setAdditionalMenuItemProps([]);
    setMenuX(0);
    setMenuY(0);
    setShowMenu(false);
  }

  return (
    <ContextMenuContext.Provider 
      value={{
        showMenu,
        menuX,
        menuY,
        populateContextMenu,
        depopulateAndHideContextMenu,
        additionalMenuItemProps,
      }}
    >
      <ContextMenu 
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menuX={menuX}
        menuY={menuY}
        additionalMenuItemProps={additionalMenuItemProps}
      />
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