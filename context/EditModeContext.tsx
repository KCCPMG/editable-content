import React, { createContext, SetStateAction, Dispatch, useState } from "react";

type EditModeContextType = {
  editMode: boolean,
  setEditMode: Dispatch<SetStateAction<boolean>>
}

export const EditModeContext = createContext<EditModeContextType | null>(null);


type EditModeContextProviderProps = {
  initialEditMode: boolean,
  children: React.ReactNode
}

export function EditModeContextProvider({initialEditMode, children}: EditModeContextProviderProps) {

  const [editMode, setEditMode] = useState<boolean>(initialEditMode);

  return (
    <EditModeContext.Provider value={{
      editMode,
      setEditMode
    }}>
      {children}
    </EditModeContext.Provider>
  )
}




