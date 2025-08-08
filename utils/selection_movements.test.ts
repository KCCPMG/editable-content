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


function moveAndCompareSelectionCheckText(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right", expAnchorNode: Node, expAnchorOffset: number, character: string) {
  experimental_moveSelection(selection, limitingContainer, moveDirection);
  expect(selection?.anchorNode).toBe(expAnchorNode);
  expect(selection?.anchorOffset).toBe(expAnchorOffset);
  expect(selection?.anchorNode!.textContent![selection.anchorOffset]).toBe(character);
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
  const limitingContainer = document.createElement("div");

  const strong = document.createElement("strong");
  const strongText = new Text("\u200BStrong Text\u200B");
  strong.append(strongText);
  limitingContainer.append(strong);

  const rootFirstTextNode = new Text("\u200B This is text after strong\u200B");
  limitingContainer.append(rootFirstTextNode);

  const rootSecondTextNode = new Text("\u200B This is more text\u200B");
  limitingContainer.appendChild(rootSecondTextNode);

  const secondStrong = document.createElement("strong");
  limitingContainer.append(secondStrong);

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
    document.body.append(limitingContainer);
  })

  test("confirm all nodes are what and where they should be", function() {

    const textNodes = getAllTextNodes([limitingContainer]);
    expect(textNodes.length).toBe(7);
    const totalTextContent = "\u200BStrong Text\u200B\u200B This is text after strong\u200B\u200B This is more text\u200Babc\u200B\u200B\u200B\u200B  test \u200B hello\u200B\u200B   \u200B";
    expect(textNodes.map(tn => tn.textContent).join("")).toBe(totalTextContent);
    expect(limitingContainer.textContent).toBe(totalTextContent);

    expect(limitingContainer.childNodes.length).toBe(4);
    expect(limitingContainer.childNodes[0].nodeName).toBe("STRONG");
    expect(limitingContainer.childNodes[0].childNodes.length).toBe(1);

    expect(limitingContainer.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
    expect(limitingContainer.childNodes[2].nodeType).toBe(Node.TEXT_NODE);

    expect(limitingContainer.childNodes[3].nodeName).toBe("STRONG");
    expect(limitingContainer.childNodes.length).toBe(4);
  })
  
  test("move selection left", function() {
    const selection = window.getSelection();

    expect(secondStrongFourthText.textContent!.length).toBe(21);
    expect(secondStrongFourthText)

    // set after final character (zero-width space) in last text node
    selection!.setBaseAndExtent(secondStrongFourthText, 21, secondStrongFourthText, 21);
    compareSelection(selection!, secondStrongFourthText, 21, secondStrongFourthText, 21);

    // should skip 1 zero-width space
    // experimental_moveSelection(selection!, limitingContainer, "left");
    // compareSelection(selection!, secondStrongFourthText, 20);
    // checkText(selection!, "\u200B");


    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 19);

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 18);
    
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 17);
    // text spot check
    checkText(selection!, " ");

    // next move should skip two zero-width spaces
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 14);
    // text spot check
    checkText(selection!, "o");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 13);
    checkText(selection!, "l");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 12);
    checkText(selection!, "l");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 11);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 10);
    checkText(selection!, "h");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 9);
    // text spot check
    checkText(selection!, " ");

    // next move should skip one zero-width space
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 7);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 6);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 5);
    checkText(selection!, "s");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 4);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 3);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 2);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongFourthText, 1);
    checkText(selection!, " ");

    // going to prior text node, should skip node entirely as it is a direct sibling without valid characters, go to secondStrongSecondText
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongSecondText, 2);
    checkText(selection!, "c");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongSecondText, 1);
    checkText(selection!, "b");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, secondStrongSecondText, 0);
    checkText(selection!, "a");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 19);
    checkText(selection!, "\u200B");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 18);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 17);
    checkText(selection!, "x");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 16);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 15);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 14);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 13);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 12);
    checkText(selection!, "r");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 11);
    checkText(selection!, "o");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 10);
    checkText(selection!, "m");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 9);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 8);
    checkText(selection!, "s");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 7);
    checkText(selection!, "i");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 6);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 5);
    checkText(selection!, "s");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 4);
    checkText(selection!, "i");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 3);
    checkText(selection!, "h");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 2);
    checkText(selection!, "T");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootSecondTextNode, 1);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 26);
    checkText(selection!, "g");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 25);
    checkText(selection!, "n");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 24);
    checkText(selection!, "o");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 23);
    checkText(selection!, "r");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 22);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 21);
    checkText(selection!, "s");
    
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 20);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 19);
    checkText(selection!, "r");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 18);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 17);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 16);
    checkText(selection!, "f");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 15);
    checkText(selection!, "a");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 14);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 13);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 12);
    checkText(selection!, "x");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 11);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 10);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 9);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 8);
    checkText(selection!, "s");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 7);
    checkText(selection!, "i");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 6);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 5);
    checkText(selection!, "s");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 4);
    checkText(selection!, "i");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 3);
    checkText(selection!, "h");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 2);
    checkText(selection!, "T");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, rootFirstTextNode, 1);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 12);
    checkText(selection!, "\u200B");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 11);
    checkText(selection!, "t");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 10);
    checkText(selection!, "x");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 9);
    checkText(selection!, "e");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 8);
    checkText(selection!, "T");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 7);
    checkText(selection!, " ");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 6);
    checkText(selection!, "g");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 5);
    checkText(selection!, "n");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 4);
    checkText(selection!, "o");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 3);
    checkText(selection!, "r");

    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 2);
    checkText(selection!, "t");

    // experimental_moveSelection(selection!, limitingContainer, "left");
    // compareSelection(selection!, strongText, 1);
    // checkText(selection!, "S");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "left", strongText, 1, "S");

    // Nowhere else to go, should stay in place
    experimental_moveSelection(selection!, limitingContainer, "left");
    compareSelection(selection!, strongText, 1);
    checkText(selection!, "S");

    moveAndCompareSelectionCheckText(selection!, limitingContainer, "left", strongText, 1, "S");

  })
  
  
  test("move selection right", function() {
    const selection = window.getSelection();
    
    // set before first 
    selection!.setBaseAndExtent(strongText, 1, strongText, 1);
    compareSelection(selection!, strongText, 1, strongText, 1);
    checkText(selection!, "S");

    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 2, "t");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 3, "r");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 4, "o");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 5, "n");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 6, "g");

    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 7, " ");

    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 8, "T");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 9, "e");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 10, "x");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 11, "t");
    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", strongText, 12, "\u200B");

    moveAndCompareSelectionCheckText(selection!, limitingContainer, "right", rootFirstTextNode, 1, " ");


  })
  
  // test("isolate", function() {
    
  // })

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