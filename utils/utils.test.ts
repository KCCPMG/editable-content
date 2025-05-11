/**
 * @jest-environment jsdom
 */


import {describe, expect, jest, test, beforeAll} from '@jest/globals';
import { setSelection } from './utils';


const startingHTML = 
`<div>
  <strong id="strong-1">Strong Text</strong>
  <i id="italics-1">Italics Test</i>
  Orphan Text
  <strong id="strong-2">
    Strong Text
    <i id="italics-2">
      Strong and Italics Text
    </i>
    More Strong Text
  </strong>
</div>
`.replaceAll(/\n +/g, ''); // avoid empty text nodes from human-readable version above





describe("basic test", () => {
  test("basic test", () => {
    console.log("ahhhhh");
    expect(2).toBe(2);
  })

  describe("jsdom example", () => {
    const div = document.createElement("div");
    document.body.append(div);
    expect(document.querySelector("div")).toBe(div);
    expect(div).toBeInstanceOf(HTMLDivElement);
  })


  test("confirmHTML is working", () => {
    document.body.innerHTML = startingHTML;
    expect(document.body.innerHTML).toBe(startingHTML);
  })

});


describe("test setSelection", function() {

  test("set Selection on text inside italics node", function() {
    const italics = document.querySelector("i");
    expect(italics).not.toBeNull();
    const selection = setSelection(italics!, 0, italics!, italics!.childNodes.length);
    expect(selection?.toString()).toEqual(italics!.textContent);
  })

  test("set Selection on limited text inside italics node", function() {
    const italics = document.querySelector("i#italics-2");
    expect(italics).not.toBeNull();
    const italicsText = italics!.childNodes[0];
    console.log(italicsText.textContent);
    console.log(italicsText.nodeName);
    console.log(italicsText.nodeType);
    const selection = setSelection(italicsText!, 7, italicsText!, 18);

    const range = new Range();
    range.setStart(italicsText, 7);
    range.setEnd(italicsText, 18);
    console.log(range.toString());
    
    range.setStart(italicsText, 0);
    range.setEnd(italicsText, 7);
    console.log(range.toString());
    
    console.log(italics?.childNodes.length);

    expect(selection).not.toBeNull();
    expect(selection!.anchorNode?.nodeName).toBe("#text");
    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.toString()).toEqual("and Italics")

  })

})



describe("test wrapInElement", function() {

  test("wrap element in element", function() {
    const italics = document.querySelector("i");
    const anchor = document.createElement("a");
    
    expect(italics).not.toBeNull();
    // const endContainerOffset = Array.from(italics?.parentNode?.childNodes).findIndex(n => n ===italics);
    // setSelection(italics, 0, italics?.parentNode, endContainerOffset)





  })


})