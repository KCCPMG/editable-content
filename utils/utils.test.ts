/**
 * @jest-environment jsdom
 */


import {describe, expect, jest, test, beforeAll} from '@jest/globals';
import { setSelection } from './utils';


const startingHTML = `
<div>
  <strong id="strong-1">Strong Text</strong>
  <i>Italics Test</i>
  Orphan Text
  <strong id="strong-2">
    Strong Text
    <i>
      Strong and Italics Text
    </i>
    More Strong Text
  </strong>
</div>
`;





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

  test("set Selection on text in node", function() {
    const italics = document.querySelector("i");
    expect(italics).not.toBeNull();
    const selection = setSelection(italics!, 0, italics!, italics!.childNodes.length);
    expect(selection?.toString()).toEqual(italics!.textContent);


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