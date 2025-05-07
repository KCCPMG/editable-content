"use client"
import React, { ReactElement, useRef, useState, useEffect, forwardRef, MutableRefObject } from "react";
import { createRoot } from 'react-dom/client';
import { wrapInElement, unwrapChildrenFrom, selectionIsDescendentOf, selectionIsDescendentOfNode, generateQuery, selectionCoveredBy, createWrapper } from '@/utils/utils';
import { EditableContentProps, EditTextButtonProps } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";
import EditTextButtonRow from "./ContentEditableExperimentComponents/EditTextButtonRow";
import WackyLink from "./ContentEditableExperimentComponents/WackyLink";


function handleItalics(ref: React.MutableRefObject<HTMLDivElement | null>) {
  console.log("Italics");
  console.log(window.getSelection());

  const selection = window.getSelection();
  
  // Check if the selection is within the specific div
  if (ref.current && selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (ref.current.contains(range.startContainer) || ref.current.contains(range.endContainer)) {
        // Get the selected text
        const selectedText = selection.toString();
        range.surroundContents(document.createElement('i'));

    } 
  }
}





export default function EditableContent({initialHTML, editTextButtons}: EditableContentProps) {

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefState, setContentRefState] = useState<MutableRefObject<null | HTMLDivElement> | null>(null);
  // const [contentRefCurrent, setContentRefContent] = useState(contentRef?.current?.innerHTML || undefined)
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null)
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null)
  const [selectionToString, setSelectionToString] = useState<string>("")


  useEffect(() => {

    if (contentRef.current && initialHTML) {
      setContentRefState(contentRef)
      contentRef.current.innerHTML = initialHTML;
    }


    document.addEventListener('selectionchange', function(e) {
      const gotSelection = window.getSelection();

      console.log(
        Boolean(gotSelection), 
        Boolean(contentRef.current), 
        gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)
      );

      if (gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)) {
        setSelectionAnchorNode(gotSelection.anchorNode);
        setSelectionAnchorOffset(gotSelection.anchorOffset);
        setSelectionFocusNode(gotSelection.focusNode);
        setSelectionFocusOffset(gotSelection.focusOffset);
        setSelectionToString(gotSelection.toString());
      } else {
        setSelectionAnchorNode(null);
        setSelectionAnchorOffset(null);
        setSelectionFocusNode(null);
        setSelectionFocusOffset(null);
        setSelectionToString("");
      }
    })
  }, [])


  function handleBold() {
    console.log("Bold");
    console.log(window.getSelection());


    const selection = window.getSelection();
    
    // Check if the selection is within the specific div
    if (contentRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (contentRef.current.contains(range.startContainer) || contentRef.current.contains(range.endContainer)) {
        // Get the selected text
        const selectedText = selection.toString();
        range.surroundContents(document.createElement('strong'));

      } 
    }
  }

  function handleWackyLink() {
    console.log("Wacky Link");
    console.log(window.getSelection());

    const selection = window.getSelection();
    // Check if the selection is within the specific div
    if (contentRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (contentRef.current.contains(range.startContainer) || contentRef.current.contains(range.endContainer)) {
          // Get the selected text
          const selectedText = selection.toString();
          
          const root = createRoot(contentRef.current); 
          root.render(<WackyLink initialText="YO SOY TAN WACKY" />);

      } 
    }

  }

  function insertTextInto() {
    console.log(window.getSelection());

    const selection = window.getSelection();
    

    if (contentRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = range;

      const commonAncestor = range.commonAncestorContainer;
      // edit ^ to make sure that we are getting an element besides "#text", potentially make this recursive
      // to handle bisecting nested elements all the way up to the ref



      const ancestorPreSelectionText = commonAncestor.textContent?.slice(0, startOffset) || "";
      const selectionText = commonAncestor.textContent?.slice(startOffset, endOffset) || "";
      const ancestorPostSelectionText = commonAncestor.textContent?.slice(endOffset) || "";

      const nodeName = commonAncestor.nodeName

      console.log({
        range,
        commonAncestor,
        ancestorPreSelectionText,
        selectionText,
        ancestorPostSelectionText,
        nodeName,
        myRefCurrent: contentRef.current,
        isDescendent: contentRef.current.contains(commonAncestor)
      })

      // ancestorPreSelectionText  document.createElement(nodeName);
      const span = document.createElement("span")
      span.innerText = "Split here";
      range.insertNode(span);

      const new_selection = window.getSelection();
      new_selection?.removeAllRanges();
      range.selectNodeContents(contentRef.current);
      new_selection?.addRange(range);
      
      range.setStartAfter(span);
      range.collapse(true);

      // range.collapse(false);
      // range.selectNodeContents(myRef.current)
      // selection.addRange(range)

      // if (window.getSelection) {
      //   var sel = window.getSelection();
      //   sel.removeAllRanges();
      //   range.selectNodeContents(myRef.current);
      //   sel.addRange(range);
      //   range.collapse(false);
      // }


    }
  }



  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        {/* <button onClick={handleBold}><strong>B</strong></button>
        <button onClick={()=> handleItalics(myRef)}><i>I</i></button>
        <button onClick={handleWackyLink}><i>WL</i></button>
        <button onClick={insertTextInto}>Insert Goofy Text</button>
        <button onClick={alternateBisect}>Bisect</button> */}
      </div>
      <div>
        {
          
          contentRef.current ? editTextButtons.map(etb => {
            console.log("should re-render button");
            const query = generateQuery(etb.wrapperArgs);
            const selection = window.getSelection();
            const selected = selection ? selectionCoveredBy(selection, query, contentRef.current!): false; // typescript not deeply analyzng callback, prior check of contentRef.current is sufficient

            console.log(JSON.stringify({selected, selection, query}));

            return (
              <EditTextButton
                {...etb}
                onClick={
                  selected ? 
                    () => {console.log("unimplemented")} :
                    () => {
                      const wrapper = createWrapper(etb.wrapperArgs, document);
                      const selection = window.getSelection();
                      if (selection) wrapInElement(selection, wrapper);
                    }
                }
                selected={selected}

              />
            )
          }): [] 
        }

        {/* <EditTextButton
          dataKey="strong"
          wrapperElement="strong"
          selection={selection}
        >
          <strong>B</strong>
        </EditTextButton>
        <EditTextButton
          dataKey="italics"
          wrapperElement="i"
          selection={selection}
        >
          <i>I</i>
        </EditTextButton> */}
      </div>
      <div
        contentEditable
        ref={contentRef}
        style={{
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
        }}
        
        // onSelect={(e) => {
        //   // console.log(window.getSelection()?.toString())
        //   setSelection(window.getSelection())
        // }}
        
        // onBlur={(e) => {
        //   setSelection(null);
        // }}


        // onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        //   if (e.key === 'Tab') {
        //     e.preventDefault();
        //     console.log("tab!");
        //     console.log({e});
        //     console.log({myRef});
        //     if (myRef.current) {
        //       console.log({selection: window.getSelection()});
        //       myRef.current!.textContent += "tab"
        //     }
            
        //   }
        //   console.log("key down", {text: myRef.current?.innerText})
        //   console.log(myRef.current)
          
        // }}
        // onKeyDownCapture={(e) => console.log("key down capture", {text: myRef.current?.innerText})}
        // onKeyUp={(e) => console.log("key up", {text: myRef.current?.innerText})}
        // onKeyUpCapture={(e) => console.log("key up capture", {text: myRef.current?.innerText})}
        // onChange={(e) => console.log("keydown", {text: myRef.current?.innerText})}
        // onChangeCapture={(e) => console.log("keydown", {text: myRef.current?.innerText})}
        // onInput={(e) => console.log("input", {text: myRef.current?.innerText})}
        // onInputCapture={(e) => console.log("input capture", {text: myRef.current?.innerText})}

      >
        
        {/* <WackyLink initialText="Wacky Link Text" /> */}
      </div>
      <div>
        <p>Selection:</p>
        {selectionToString}
      </div>
      {/* <p>This text should not change</p>
      <div>
        {JSON.stringify(myRefCurrent)}
      </div> */}
    </>
  )
}








// const AllowedChild = forwardRef((props: AllowedChildProps, ref: Ref<HTMLDivElement>) => {
  //   return (
    //     <div ref={ref}> {/* Attach the forwarded ref to the desired DOM element */}
    //       Allowed Child: {props.name}
    //       {props.parentProp && <p>Parent Prop: {props.parentProp}</p>}
    //       {props.children && <div>{props.children}</div>}
    //     </div>
    //   );
    // });
    


