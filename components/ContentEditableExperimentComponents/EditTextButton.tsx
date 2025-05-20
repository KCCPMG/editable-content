import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { ButtonOwnProps } from "@mui/material";
import { EditTextButtonProps, WrapperArgs } from ".";




export default function EditTextButton({MUIButton ,dataKey, child, defaultColor, selectedColor, contentRef, onClick, selected,
  wrapperArgs : {element, classList, id}}: EditTextButtonProps
) {

  const [query, setQuery] = useState("");
  const [currentColor, setCurrentColor] = useState<ButtonOwnProps['color']>(defaultColor || "primary");

  

  useEffect(() => {
    
    console.log("placeholder");
    // const classList = wrapperClassList ? wrapperClassList.map(c => "."+c).join("") : "";
    // const id = "#"+wrapperId;
    // setQuery(wrapperElement + classList + id);

  }, [element, classList, id])

  // useEffect(() => {
  //   console.log("selection listener useEffect");
  //   getSelectionIsDescendentOf() ? setCurrentColor(selectedColor) : setCurrentColor(defaultColor)
  // }, [selection?.anchorNode, selection?.focusNode, selection?.anchorOffset, selection?.focusOffset])

  // console.log(selection?.toString());


  // logic moved
  // function createWrapper({wrapperElement, wrapperClassList, wrapperId}: WrapperArgs): HTMLElement {

  //   const wrapper = document.createElement(wrapperElement);
  //   if (wrapperClassList) {
  //     wrapperClassList.forEach(wcl => {
  //       wrapper.classList.add(wcl);
  //     })
  //   }
  //   if (wrapperId) {
  //     wrapper.setAttribute('id', wrapperId);
  //   }

  //   return wrapper;
  // }
  
  
  // function handleClick() {
  //   // selection not descendent of wrapper, selection not covered
  //   console.log(`click from EditTextButton ${dataKey}`)
    
  //   // TODO: purge any contents within of wrapper
    
    
  //   if (!getSelectionIsDescendentOf() && !!selection) {
      
  //     const wrapper = createWrapper();
  //     wrapInElement(selection, wrapper);

  //     if (wrapper.childNodes.length === 0) {
  //       const textNode = document.createTextNode("\u00A0");
  //       wrapper.append(textNode);
  //     }
  //     selection.setBaseAndExtent(wrapper, 0, wrapper, wrapper.childNodes.length);

  //   }

    // TODO: selection not descendent of wrapper, selection covered


    // TODO: selection descendent of wrapper


    // TODO: Restore selection
    // console.log(window.getSelection());
    // !!selection && !!selection.anchorNode && !!selection.focusNode &&  selection.setBaseAndExtent(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
  // }


  // function getSelectionIsDescendentOf(): boolean {
  //   if (
  //     !selection || 
  //     !contentRef || 
  //     !contentRef.current ||
  //     query.trim() === ""
  //   ) return false;
  //   else return selectionIsDescendentOf(selection, query, contentRef.current);
  // }

  return (
    MUIButton ? 
      <Button 
        variant="outlined"
        color={selected ? (selectedColor || "secondary") : (defaultColor || "primary") }
        onClick={onClick}
      >
        {child}
      </Button> :
      <button
        onClick={onClick}
      >
        {child}
      </button>
    // <>
    //   {/* <ListItemButton onClick={handleClick} selected>
    //     {children}
    //   </ListItemButton> */}
    //   {/* <p>
    //     Is Descendent Of: {String(getSelectionIsDescendentOf())}, Selection Covered By: {String(true)}
    //   </p> */}
    // </>
  )
}



// import ReactDOM

// function blarg(button: HTMLButtonElement) {
//   console.log(button);
// }

// blarg(<Button />)
// blarg(<button></button>)
// blarg(button)
// blarg(document.createElement('button'));
// blarg(ReactDOM.render(<Button />))


// function renderButton(): HTMLButtonElement {
//   return(
//     <Button>
//     </Button>
//   )
// }
// blarg(renderButton());

// <Button></Button>
// Button()



// type BruttonProps = {
//   children: Array<React.ReactNode>
// }

// function Brutton({children}: BruttonProps) {

//   return (
//     <>
//       // {children}
//       {children.map(child => child)}
//     </>
//   )

// }

// const x = Button({children: "hello"})
// const y: React.JSX.Element = React.createElement("button")
// // const z = React.createElement("button", DefaultCompn

// y.type

// /**
//  * How can I get the goddamn button part of the button
//  * MUI button true or false
//  * How do I tell an MUI Button to render just as a button
//  */