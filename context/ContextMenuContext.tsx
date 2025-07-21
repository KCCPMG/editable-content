import { MenuItem } from "@mui/material";
import React, { createContext, useContext, useState } from "react";
import ContextMenu from "@/components/TestComponents/ContextMenu";



export type ContextMenuContextType = {
  showMenu: boolean,
  menuX: number,
  menuY: number,
  populateContextMenu: (x: number, y: number) => void,
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
  const [additionalMenuItemProps, setAdditionalMenuItemProps] = useState<Array<React.ComponentProps<typeof MenuItem>>>([
    {
      key: "option-1",
      children: "Option 1",
      onClick: (e) => {
        console.log("Option 1");
      }
    },
    {
      key: "option-2",
      children: "Option 2",
      onClick: (e) => {
        console.log("Option 2");
      }
    }
  ]);


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
        additionalMenuItemProps,
        populateContextMenu
      }}
    >
      <ContextMenu 
        showMenu={showMenu}
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