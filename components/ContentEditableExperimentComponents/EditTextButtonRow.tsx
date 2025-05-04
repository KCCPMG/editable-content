import EditTextButton, { EditTextButtonProps } from "./EditTextButton";
import { ReactElement, cloneElement } from "react";

type EditTextButtonRowProps = {
  contentRef: React.MutableRefObject<HTMLDivElement | null>,
  // children: ReactElement<EditTextButtonProps> | ReactElement<EditTextButtonProps>[]
  children: ReactElement<EditTextButtonProps>[]
}

export default function EditTextButtonRow({contentRef, children}: EditTextButtonRowProps): React.ReactElement {

  return (
    <div>
      {children.map(
        (child) => {
          if (child.type === EditTextButton) return (
            cloneElement(child, {

              ...child.props, 
              key: child.props.dataKey,
              // key: "testkey",
              contentRef
            })
            
          );
          else return null;
        }
      )}
    </div>
  )
}