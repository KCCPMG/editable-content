import { useEditableContentContext } from "@kccpmg/editable-content";
import DisplayContainer from "./DisplayContainer";


type DehydratedHTMLDisplayProps = {
  show?: boolean
}

export default function DehydratedHTMLDisplay(
  {show} : DehydratedHTMLDisplayProps
) {
  const dehydratedHTML = useEditableContentContext().dehydratedHTML

  return (
    <DisplayContainer 
      title="Dehydrated HTML" 
      showInitial={!!show} 
    >
      <pre
        style={{ 
          backgroundColor: '#f5f5f5',
          padding: '15px', 
          border: '1px solid #ccc', 
          overflowX: 'auto' 
        }}
      >
        <code>{formatHTML(dehydratedHTML, 2)}</code>
      </pre>
    </DisplayContainer>
  )
}



function isTag(tag: string) {
  if (tag[0] === '<' && tag[tag.length-1] === '>') return true;
  else return false;
}


function isClosingTag(tag: string) {
  if (tag.slice(1, tag.length-1).trim()[0] === "/") return true;
  else return false;
}

function isSelfClosingTag(tag: string) {
  const substring = tag.slice(1, tag.length-1).trim()
  if (substring[substring.length-1] === "/") return true;
  if (substring.slice(0,2) === 'br') return true;
  else return false;
}


function isOpeningTag(tag: string) {
  return (!isClosingTag(tag) && !(isSelfClosingTag(tag)))
}

function formatHTML(htmlStr: string, indentSpaces: number) {
  const htmlAsArr = [];

  let indentLevel = 0;

  let startPointer = 0;
  for (let i=0; i<htmlStr.length; i++) {
    if (htmlStr[i] === '<') {
      const substring = htmlStr.slice(startPointer, i);
      htmlAsArr.push(" ".repeat(indentLevel * indentSpaces) + substring);
      startPointer = i;
      while (i<htmlStr.length && htmlStr[i] != ">") i++;
      const tagSubstring = htmlStr.slice(startPointer, i+1);
      if (isClosingTag(tagSubstring)) indentLevel--;
      const indent = " ".repeat(indentLevel * indentSpaces);
      htmlAsArr.push(indent + tagSubstring);
      if (isOpeningTag(tagSubstring)) indentLevel++;
      startPointer = i+1;
    }
  }

  return htmlAsArr.filter(el => el.trim().length > 0).join("\n");
}