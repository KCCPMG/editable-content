/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { setSelection, resetSelectionToTextNodes, experimental_moveSelection } from "./selection_movements";
import { startingHTML, mdnDocPageHTML } from "./test_constants";
import { getAllTextNodes } from './checks';


function compareSelection(selection: Selection, expAnchorNode: Node, expAnchorOffset: number, expFocusNode?: Node, expFocusOffset?: number) {
  expect(selection.anchorNode).toBe(expAnchorNode);
  expect(selection.anchorOffset).toBe(expAnchorOffset);
  if (expFocusNode) {
    expect(selection.focusNode).toBe(expFocusNode);
  } else expect(selection.focusNode).toBe(expAnchorNode);
  if (expFocusOffset) {
    expect(selection.focusOffset).toBe(expFocusOffset);
  } else expect(selection.focusOffset).toBe(expAnchorOffset);
}


function checkText(selection: Selection, character: string) {
  expect(selection.anchorNode!.textContent![selection.anchorOffset]).toBe(character);
}


function moveAndCompareSelectionCheckText(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right", expAnchorNode: Node, expAnchorOffset: number, character?: string) {
  experimental_moveSelection(selection, limitingContainer, moveDirection);
  expect(selection?.anchorNode).toBe(expAnchorNode);
  expect(selection?.anchorOffset).toBe(expAnchorOffset);
  if (character) expect(selection?.anchorNode!.textContent![selection.anchorOffset]).toBe(character);
}

// before all
beforeAll(function() {
  document.body.innerHTML = startingHTML;
})





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
    const selection = setSelection(italicsText!, 7, italicsText!, 18);

    const range = new Range();
    range.setStart(italicsText, 7);
    range.setEnd(italicsText, 18);
    
    range.setStart(italicsText, 0);
    range.setEnd(italicsText, 7);

    expect(selection).not.toBeNull();
    expect(selection!.anchorNode?.nodeName).toBe("#text");
    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.toString()).toEqual("and Italics")

  })

});


describe("test resetSelectionToTextNodes", function() {

  beforeEach(function() {
    document.body.innerHTML = mdnDocPageHTML;
  })


  const idealRangeText = "An integer greater than or equal to zero describing the position inside referenceNode of the point to be checked. If referenceNode is a Node of type Text, Comment, or CDATASection, then offset is the number of characters from the start of referenceNode. For other Node types, offset is the number of child nodes from the start of the referenceNode.";


  test("Set selection range to cover bounding p", function() {

    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStartBefore(p!);
    range.setEndAfter(p!);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);

  })


  test("set selection range to starting with text, ending covering bounding p", function() {

    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();

    expect(p!.hasChildNodes()).toBe(true);
    expect(p!.childNodes[0].nodeType).toBe(Node.TEXT_NODE);

    range.setStart(p!.childNodes[0], 0);
    // console.log([range.startContainer, range.startContainer.textContent]);
    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    range.setEndAfter(p!);
    // console.log([range.endContainer, range.endContainer.textContent]);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);

  })

  test("set selection to start with covering bounding p, end with text", function() {
    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStart(p!.childNodes[0], 0);
    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);

    const lastTextNode = p!.childNodes[p!.childNodes.length-1];
    expect(lastTextNode).not.toBeNull();
    expect(lastTextNode.nodeType).toBe(Node.TEXT_NODE);
    range.setEnd(lastTextNode, lastTextNode!.textContent!.length);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);
  })


  test("set selection to text at both ends", function() {
    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    const range = selection!.getRangeAt(0);
    const p = document.querySelector("#content > article > section:nth-child(4) > div > dl > dd:nth-child(4) > p");
    expect(p).not.toBeNull();
    range.setStart(p!.childNodes[0], 0);
    const lastTextNode = p!.childNodes[p!.childNodes.length-1];
    expect(lastTextNode).not.toBeNull();
    expect(lastTextNode.nodeType).toBe(Node.TEXT_NODE);
    range.setEnd(lastTextNode, lastTextNode!.textContent!.length);

    const returnedSelection = resetSelectionToTextNodes();

    expect(range.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.endContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(range.toString()).toEqual(idealRangeText);
  })
})


describe("test resetRangeToTextNodes", function() {
  // TODO
})


// using experimental_moveSelection
describe("test moveSelection", function() {

  // before all
  const LC = document.createElement("div");

  const strong = document.createElement("strong");
  const strongText = new Text("\u200BStrong Text\u200B");
  strong.append(strongText);
  LC.append(strong);

  const rootFirstTextNode = new Text("\u200B This is text after strong\u200B");
  LC.append(rootFirstTextNode);

  const rootSecondTextNode = new Text("\u200B This is more text\u200B");
  LC.appendChild(rootSecondTextNode);

  const secondStrong = document.createElement("strong");
  LC.append(secondStrong);

  const secondStrongFirstText = new Text();
  const secondStrongSecondText = new Text("abc\u200B");
  const secondStrongThirdText = new Text("\u200B\u200B")
  const secondStrongFourthText = new Text("\u200B  test \u200B hello\u200B\u200B   \u200B");

  secondStrong.append(secondStrongFirstText);
  secondStrong.append(secondStrongSecondText);
  secondStrong.append(secondStrongThirdText);
  secondStrong.append(secondStrongFourthText);

  beforeAll(function() {
    document.body.innerHTML = '';
    document.body.append(LC);
  })

  test("confirm all nodes are what and where they should be", function() {

    const textNodes = getAllTextNodes([LC]);
    expect(textNodes.length).toBe(7);
    const totalTextContent = "\u200BStrong Text\u200B\u200B This is text after strong\u200B\u200B This is more text\u200Babc\u200B\u200B\u200B\u200B  test \u200B hello\u200B\u200B   \u200B";
    expect(textNodes.map(tn => tn.textContent).join("")).toBe(totalTextContent);
    expect(LC.textContent).toBe(totalTextContent);

    expect(LC.childNodes.length).toBe(4);
    expect(LC.childNodes[0].nodeName).toBe("STRONG");
    expect(LC.childNodes[0].childNodes.length).toBe(1);

    expect(LC.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
    expect(LC.childNodes[2].nodeType).toBe(Node.TEXT_NODE);

    expect(LC.childNodes[3].nodeName).toBe("STRONG");
    expect(LC.childNodes.length).toBe(4);
  })
  
  test("move selection left", function() {
    const selection = window.getSelection();

    expect(secondStrongFourthText.textContent!.length).toBe(21);
    expect(secondStrongFourthText)

    // set after final character (zero-width space) in last text node
    selection!.setBaseAndExtent(secondStrongFourthText, 21, secondStrongFourthText, 21);
    compareSelection(selection!, secondStrongFourthText, 21, secondStrongFourthText, 21);

    // should skip 1 zero-width space
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 19, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 18, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 17, " ");

    // next move should skip two zero-width spaces
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 14, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 13, "l");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 12, "l");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 11, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 10, "h");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 9, " ");

    // next move should skip one zero-width space
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 7, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 6, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 5, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 4, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 3, "t");

    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 2, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongFourthText, 1, " ");

    // going to prior text node, should skip node entirely as it is a direct sibling without valid characters, go to secondStrongSecondText
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongSecondText, 2, "c");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongSecondText, 1, "b");
    moveAndCompareSelectionCheckText(selection!, LC, "left", secondStrongSecondText, 0, "a");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 19, "\u200B");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 18, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 17, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 16, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 15, "t");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 14, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 13, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 12, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 11, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 10, "m");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 9, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 8, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 7, "i");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 6, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 5, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 4, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 3, "h");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 2, "T");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootSecondTextNode, 1, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 26, "g");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 25, "n");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 24, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 23, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 22, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 21, "s");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 20, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 19, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 18, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 17, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 16, "f");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 15, "a");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 14, " ");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 13, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 12, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 11, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 10, "t");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 9, " ");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 8, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 7, "i");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 6, " ");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 5, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 4, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 3, "h");
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 2, "T");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", rootFirstTextNode, 1, " ");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 12, "\u200B");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 11, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 10, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 9, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 8, "T");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 7, " ");
    
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 6, "g");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 5, "n");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 4, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 3, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 2, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 1, "S");

    // Nowhere else to go, should stay in place
    moveAndCompareSelectionCheckText(selection!, LC, "left", strongText, 1, "S");

  })
  
  
  test("move selection right", function() {
    const selection = window.getSelection();
    
    // set before first 
    selection!.setBaseAndExtent(strongText, 1, strongText, 1);
    compareSelection(selection!, strongText, 1, strongText, 1);
    checkText(selection!, "S");

    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 2, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 3, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 4, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 5, "n");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 6, "g");

    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 7, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 8, "T");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 9, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 10, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 11, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", strongText, 12, "\u200B");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 1, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 2, "T");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 3, "h");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 4, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 5, "s");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 6, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 7, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 8, "s");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 9, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 10, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 11, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 12, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 13, "t");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 14, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 15, "a");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 16, "f");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 17, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 18, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 19, "r");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 20, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 21, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 22, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 23, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 24, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 25, "n");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 26, "g");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootFirstTextNode, 27, "\u200B");

    // rootSecondTextNode - "\u200B This is more text\u200B"
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 2, "T");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 3, "h");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 4, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 5, "s");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 6, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 7, "i");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 8, "s");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 9, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 10, "m");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 11, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 12, "r");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 13, "e");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 14, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 15, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 16, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 17, "x");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 18, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", rootSecondTextNode, 19, "\u200B");

    // go into empty text node because it is not a sibling
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFirstText, 0, undefined);

    // secondStrongSecondText "abc\u200B", should skip first character due to being siblings
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongSecondText, 1, "b");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongSecondText, 2, "c");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongSecondText, 3, "\u200B");

    // skip secondStrongThirdText because it is empty and a sibling

    // secondStrongFourthText "\u200B  test \u200B hello\u200B\u200B   \u200B", skip first space, only zws in between last position and space
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 2, " ");

    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 3, "t");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 4, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 5, "s");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 6, "t");

    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 7, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 8, "\u200B");

    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 10, "h");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 11, "e");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 12, "l");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 13, "l");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 14, "o");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 15, "\u200B");

    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 18, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 19, " ");
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 20, "\u200B");

    // moving right again should have no effect
    moveAndCompareSelectionCheckText(selection!, LC, "right", secondStrongFourthText, 20, "\u200B");

  })
  
  afterAll(function() {
    document.body.innerHTML = startingHTML;
  })


})


describe("test shiftSelection", function() {
  // TODO
})


describe("test resetTextNodesCushions", function() {
  // TODO
})