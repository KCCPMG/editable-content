"use client"
import React, { ReactElement, useRef, useState, useEffect, forwardRef } from "react";
import { createRoot } from 'react-dom/client';
import { wrapInElement, unwrapChildrenFrom, selectionIsDescendentOf, selectionIsDescendentOfNode } from '@/utils/utils';


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


export default function ContentEditableExperiment() {

  const myRef = useRef<null | HTMLDivElement>(null);
  const [myRefCurrent, setMyRefContent] = useState(myRef?.current?.innerHTML || undefined)
  const [selection, setSelection] = useState<Selection | null>(null)


  useEffect(() => {
    console.log("myRef.current", myRef.current);
    document.addEventListener('selectionchange', function(e) {

      const gotSelection = window.getSelection();

      console.log(Boolean(gotSelection), Boolean(myRef.current), gotSelection && myRef.current && selectionIsDescendentOfNode(gotSelection, myRef.current))



      if (gotSelection && myRef.current && selectionIsDescendentOf(gotSelection, "", myRef.current)) {
        console.log(e);
        setSelection(window.getSelection());
      }

    })
  }, [])

  function handleBold() {
    console.log("Bold");
    console.log(window.getSelection());


    const selection = window.getSelection();
    
    // Check if the selection is within the specific div
    if (myRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (myRef.current.contains(range.startContainer) || myRef.current.contains(range.endContainer)) {
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
    if (myRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (myRef.current.contains(range.startContainer) || myRef.current.contains(range.endContainer)) {
          // Get the selected text
          const selectedText = selection.toString();
          
          const root = createRoot(myRef.current); 
          root.render(<WackyLink initialText="YO SOY TAN WACKY" />);

      } 
    }

  }

  function insertTextInto() {
    console.log(window.getSelection());

    const selection = window.getSelection();
    

    if (myRef.current && selection && selection.rangeCount > 0) {
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
        myRefCurrent: myRef.current,
        isDescendent: myRef.current.contains(commonAncestor)
      })

      // ancestorPreSelectionText  document.createElement(nodeName);
      const span = document.createElement("span")
      span.innerText = "Split here";
      range.insertNode(span);

      const new_selection = window.getSelection();
      new_selection?.removeAllRanges();
      range.selectNodeContents(myRef.current);
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





  function alternateBisect() {


    const selection = window.getSelection()

    const thisRange = window.getSelection()?.getRangeAt(0) || null;

    if (!thisRange || !selection) {
      console.log("oopsie poopsie");
      return;
    }

    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

    console.log({ anchorNode, anchorOffset, focusNode, focusOffset })


  }


  function bisect() {

    console.log(window.getSelection());

    const selection = window.getSelection();

    function nearestElementAncestor(node: Node | null) {
      if (node instanceof Element) return node;
      else return nearestElementAncestor(node?.parentNode || null)
    }

    function getPreRange(range: Range) {
      const { startOffset, endOffset, startContainer, endContainer } = range;

      const preRange = new Range();
      preRange.setStart(nearestElementAncestor(startContainer), 0);
      preRange.setEnd(startContainer, startOffset);

      return preRange;
      // if (preRange.startContainer instanceof Element) {
      //   return preRange;
      // } else {
      //   if (startContainer.parentNode) {
      //     preRange.setStart(startContainer.parentNode, 0)
      //     return getPreRange(preRange);
      //   } else return null;
      // }
    }

    function getPostRange(range: Range) {
      const { startOffset, endOffset, startContainer, endContainer } = range;

      const postRange = new Range();
      const safeAncestor = nearestElementAncestor(endContainer);
      postRange.setStart(endContainer, endOffset);
      console.log(postRange, safeAncestor, safeAncestor?.textContent?.length)
      if (safeAncestor) {
        postRange.setEnd(safeAncestor, 1);
      }

      return postRange;
    }

    if (myRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset, startContainer, endContainer } = range;
      
      console.log("range", range);

      const preRange = getPreRange(range);
      const postRange = getPostRange(range);
      console.log({preRange, postRange});

      const preRangeSpan = document.createElement("span");
      const preRangeContents = preRange.extractContents();
      preRangeSpan.append(preRangeContents);
      preRange.startContainer.appendChild(preRangeSpan);
      // preRange.startContainer.appendChild(preRangeContents);

      const postRangeSpan = document.createElement("span");
      const postRangeContents = postRange.extractContents();
      postRangeSpan.append(postRangeContents);
      postRange.startContainer.appendChild(postRangeSpan);
      // postRange.startContainer.appendChild(postRangeContents);

      // Try to prepend and append new spans, preRange from start of text to cursor, postRange from cursor to end of text

      // range.extractContents() into each span 

      // consider writing promoteToSibling, demoteToChild functions

      // const postRange = new Range();
      // postRange.setStart(startContainer, startOffset);
      // postRange.setEnd(startContainer, 0);
      // console.log({postRange});
    }
  }

  useEffect(() => {
    setMyRefContent(myRef.current?.innerHTML)
  }, [myRef.current?.innerHTML])

  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        <button onClick={handleBold}><strong>B</strong></button>
        <button onClick={()=> handleItalics(myRef)}><i>I</i></button>
        <button onClick={handleWackyLink}><i>WL</i></button>
        <button onClick={insertTextInto}>Insert Goofy Text</button>
        <button onClick={alternateBisect}>Bisect</button>
      </div>
      <EditTextButtonRow contentRef={myRef} >
        <EditTextButton
          query="strong"
          wrapper={document.createElement("strong")}
          selection={selection}
        >
          <strong>B</strong>
        </EditTextButton>
        <EditTextButton
          query="i"
          wrapper={document.createElement("i")}
          selection={selection}
        >
          <i>I</i>
        </EditTextButton>
      </EditTextButtonRow>
      <div
        contentEditable
        ref={myRef}
        style={{
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
        }}
        
        onSelect={(e) => {
          // console.log(window.getSelection()?.toString())
          setSelection(window.getSelection())
        }}
        
        onBlur={(e) => {
          setSelection(null);
        }}
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
        A B C D E F G
        {/* <WackyLink initialText="Wacky Link Text" /> */}
      </div>
      <div>
        <p>Selection:</p>
        {selection?.toString()}
      </div>
      {/* <p>This text should not change</p>
      <div>
        {JSON.stringify(myRefCurrent)}
      </div> */}
    </>
  )
}


type WackyLinkProps = {
  initialText: String
}


function WackyLink({initialText}: WackyLinkProps) {
  return (
    <div 
      contentEditable
      
      style={{
        backgroundColor: "red",
        display: "inline-block"
      }}
    >
      {initialText}
    </div>
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
    
type EditTextButtonProps = {
  children: React.ReactNode,
  selection: Selection | null,
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  query: string,
  wrapper: Element
}


function EditTextButton({children, selection, contentRef, query, wrapper}: EditTextButtonProps) {

  function handleClick() {
    console.log(contentRef?.current?.innerHTML);
  }

  function getSelectionIsDescendentOf(): boolean {
    if (!selection || !contentRef || !contentRef.current) return false;
    else return selectionIsDescendentOf(selection, query, contentRef.current);
  }

  return (
    <>
      <button onClick={handleClick}>
        {children}
      </button>
      <p>
        Is Descendent Of: {String(getSelectionIsDescendentOf())}, Selection Covered By: {String(true)}
      </p>
    </>
  )
}


type EditTextButtonRowProps = {
  contentRef: React.MutableRefObject<HTMLDivElement | null>,
  // children: ReactElement<EditTextButtonProps> | ReactElement<EditTextButtonProps>[]
  children: ReactElement<EditTextButtonProps>[]
}

export function EditTextButtonRow({contentRef, children}: EditTextButtonRowProps): React.ReactElement {

  return (
    <div>
      {children.map(
        (child) => {
          if (child.type === EditTextButton) return (
            <EditTextButton {...child.props} contentRef={contentRef} />
          );
          else return null;
        }
      )}
    </div>
  )
}