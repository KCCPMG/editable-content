/**
 * @jest-environment jsdom
 */


import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { setSelection, wrapInElement, unwrapSelectionFromQuery, deleteEmptyElementsByQuery, nodeIsDescendentOf, selectionIsDescendentOfNode, selectionIsCoveredBy } from './utils';


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
</div>`
.replaceAll(/\n */g, ''); // avoid empty text nodes from human-readable version above


let testNumber = 0;


describe("basic test", () => {
  test("basic test", () => {
    expect(2).toBe(2);
  })

  test("jsdom example", () => {
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


// describe("test setSelection", function() {

//   beforeEach(function() {
//     testNumber++;
//   })

//   test("set Selection on text inside italics node", function() {
//     const italics = document.querySelector("i");
//     expect(italics).not.toBeNull();
//     const selection = setSelection(italics!, 0, italics!, italics!.childNodes.length);
//     expect(selection?.toString()).toEqual(italics!.textContent);
//   })

//   test("set Selection on limited text inside italics node", function() {
//     const italics = document.querySelector("i#italics-2");
//     expect(italics).not.toBeNull();
//     const italicsText = italics!.childNodes[0];
//     const selection = setSelection(italicsText!, 7, italicsText!, 18);

//     const range = new Range();
//     range.setStart(italicsText, 7);
//     range.setEnd(italicsText, 18);
    
//     range.setStart(italicsText, 0);
//     range.setEnd(italicsText, 7);

//     expect(selection).not.toBeNull();
//     expect(selection!.anchorNode?.nodeName).toBe("#text");
//     expect(selection!.anchorNode).toBe(selection!.focusNode);
//     expect(selection!.toString()).toEqual("and Italics")

//   })

// });



describe("test wrapInElement", function() {

  beforeEach(function() {
    document.body.innerHTML = startingHTML;
    testNumber++;
  })

  test("wrap element in element", function() {
    const italics = document.querySelector("i#italics-1");
    const anchor = document.createElement("a");
    const italicsTextContent = italics?.textContent;
    
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();

    const parentNode = italics!.parentNode;
    const allSiblings = Array.from(parentNode!.childNodes);

    const startContainerOffset = allSiblings.findIndex(n => n ===italics);
    const endContainerOffset = startContainerOffset + 1;
    const selection = setSelection(parentNode!, startContainerOffset, parentNode!, endContainerOffset);
    expect(selection).not.toBeNull();
    expect(selection!.anchorNode).toBe(selection!.focusNode)
    expect(selection).not.toBeNull();

    const selectionTextContent = selection!.toString();
    expect(selectionTextContent).toBe(italicsTextContent);

    wrapInElement(selection!, anchor);
    const reestablishedItalics = document.querySelector("i#italics-1");
    expect(reestablishedItalics!.parentNode).toBe(anchor);
    // make sure italics textContent is unchanged
    expect(italics!.textContent).toBe(italicsTextContent);
    expect(anchor.textContent).toBe(italicsTextContent);

  })

  test("wrap text in element", function(){
    const italics = document.querySelector("i#italics-2");
    expect(italics).not.toBeNull();
    const italicsText = italics!.childNodes[0];
    const selection = setSelection(italicsText!, 7, italicsText!, 18);
    expect(selection).not.toBeNull();

    const underlineElement = document.createElement('u');
    wrapInElement(selection!, underlineElement);

    expect(underlineElement.parentNode).toBe(italics);
    expect(underlineElement.textContent).toEqual(selection!.toString());
    expect(italics!.childNodes.length).toBe(3);
    expect(italics!.childNodes[1]).toBe(underlineElement);

  })

});


describe("test deleteEmptyElementsByQuery", function() {

  test("delete empty elements, leave valid elements 1", function() {
    document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
    deleteEmptyElementsByQuery("i", document.querySelector("div")!);
    expect(document.body.innerHTML).toBe("<div><strong></strong><i><strong></strong></i><strong></strong><strong><i>Valid Text</i></strong></div>")
  })


  test("delete empty elements, leave valid elements 2", function() {
    document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
    deleteEmptyElementsByQuery("strong", document.querySelector("div")!);
    expect(document.body.innerHTML).toBe("<div><i></i><i></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>");
  })

})


describe("test unwrapSelectionFromQuery", function() {

  beforeEach(() => {
    testNumber++;
    document.body.innerHTML = startingHTML;
  })

  test("promotes text out of italics", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "i", limitingContainer!);

    expect(italics!.textContent!.length).toEqual(0);

    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();

    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.anchorNode).toBe(document.querySelector("#strong-2"));

    expect(document.querySelectorAll("i#italics-2").length).toBe(0);
  })

  test("promote text in italics out of strong", function() {
    const italics = document.querySelector("i#italics-2");
    const italicsTextContent = italics?.textContent;
    expect(italics).not.toBeNull();
    expect(italics?.parentNode).not.toBeNull();
    const parentNode = italics!.parentNode;

    expect(italics!.childNodes.length).toBe(1);
    const italicsTextNode = italics!.childNodes[0];

    expect(italicsTextContent).toEqual(italicsTextNode!.textContent);

    const selection = setSelection(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(
      `<div>
        <strong id="strong-1">Strong Text</strong>
        <i id="italics-1">Italics Test</i>
        Orphan Text
        <strong id="strong-2">
          Strong Text
          <i id="italics-2"></i>
        </strong>
        <i id="italics-2">
          Strong and Italics Text
        </i>
        <strong id="strong-2">
          <i id="italics-2"></i>
          More Strong Text
        </strong>
      </div>`.replaceAll(/\n */g, ''));
  })

});

describe("test nodeIsDescendentOf", function() {

  beforeEach(() => {
    testNumber++;
    document.body.innerHTML = startingHTML;
  })

  test("test ancestors of italics-2", function() {
    const italics = document.querySelector("i#italics-2");
    const limitingContainer = document.querySelector("div");

    expect(italics).not.toBeNull();
    expect(limitingContainer).not.toBeNull();

    expect(nodeIsDescendentOf(italics!, "strong#strong-2", limitingContainer!)).toBe(true);
    expect(nodeIsDescendentOf(italics!, "strong", limitingContainer!)).toBe(true);
    
    expect(nodeIsDescendentOf(italics!, "div", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "i#italics-1", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "i", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "strong#strong-1", limitingContainer!)).toBe(false);
    expect(nodeIsDescendentOf(italics!, "a", limitingContainer!)).toBe(false);

  })
})


describe("test selectionIsDescendentOfNode", function() {

  beforeEach(() => {
    testNumber++;
    document.body.innerHTML = startingHTML;
  })
  
  test("test selection is descendent of node", function() {
    const div = document.querySelector("div");
    const strong = document.querySelector("strong#strong-1");
    const textNode = strong!.childNodes[0];

    const selection = setSelection(textNode!, 4, textNode!, 8);

    expect(selection).not.toBeNull();

    expect(
      selectionIsDescendentOfNode(selection!, strong!)
    ).toBe(true);

    expect(
      selectionIsDescendentOfNode(selection!, div!)
    ).toBe(true);

    const badStrong = document.querySelector("strong#strong-2");
    const badItalics = document.querySelector("i#italics-1");

    expect(
      selectionIsDescendentOfNode(selection!, badStrong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, badItalics!)
    ).toBe(false);
  })


  test("selection is split across nodes", function() {
    const div = document.querySelector("div");
    const strong = document.querySelector("strong#strong-1");
    const strongTextNode = strong!.childNodes[0];
    const italics = document.querySelector("i#italics-1");
    const italicsTextNode = italics!.childNodes[0]

    const selection = setSelection(strongTextNode!, 4, italicsTextNode!, 3);

    expect(selection).not.toBeNull();

    expect(
      selectionIsDescendentOfNode(selection!, strong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, italics!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, div!)
    ).toBe(true);

    const badStrong = document.querySelector("strong#strong-2");
    const badItalics = document.querySelector("i#italics-1");

    expect(
      selectionIsDescendentOfNode(selection!, badStrong!)
    ).toBe(false);

    expect(
      selectionIsDescendentOfNode(selection!, badItalics!)
    ).toBe(false);

  })
})


describe("test selectionCoveredBy", function() {

  beforeEach(() => {
    testNumber++;
    document.body.innerHTML = startingHTML;
  })
  

  test("selection is covered by - 1", function() {
    const limitingContainer = document.querySelector("div");

    const strong = document.querySelector("strong#strong-2");
    const strongText = strong!.childNodes[0];
    const secondStrongText = strong!.childNodes[2];

    expect(strong).not.toBeNull();
    expect(strongText).not.toBeNull();
    expect(secondStrongText).not.toBeNull();

    const selection = setSelection(strongText, 5, secondStrongText, 5);

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);

    expect(selectionIsCoveredBy(selection!, "strong#strong-2", limitingContainer!)).toBe(true);

    expect(selectionIsCoveredBy(selection!, "i", limitingContainer!)).toBe(false);
  })

  test("selection is covered by - 2", function() {
    // not done, just a copy of 1 at this point
    const limitingContainer = document.querySelector("div");

    const strong = document.querySelector("strong#strong-1");
    const strongText = strong!.childNodes[0];
    const italics = document.querySelector("i#italics-1");
    const italicsText = italics!.childNodes[0];

    expect(strong).not.toBeNull();
    expect(strongText).not.toBeNull();
    expect(italics).not.toBeNull();
    expect(italicsText).not.toBeNull();

    const selection = setSelection(strongText, 5, italicsText, 5);

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(false);

    expect(selectionIsCoveredBy(selection!, "i", limitingContainer!)).toBe(false);

    expect(selectionIsCoveredBy(selection!, "strong#strong-1", limitingContainer!)).toBe(false);

    expect(selectionIsCoveredBy(selection!, "i#italics-1", limitingContainer!)).toBe(false);
  })
  

})