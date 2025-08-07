/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { setSelection, resetSelectionToTextNodes, experimental_moveSelection } from "./selection_movements";
import { startingHTML, mdnDocPageHTML } from "./test_constants";
import { getAllTextNodes } from './checks';


// before all
document.body.innerHTML = startingHTML;


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


describe("test moveSelection", function() {

  // before all
  const htmlAsNode = `
    <div class="limiting-container">
      <strong>\u200BStrong Text\u200B<strong>
    
    
    
    </div>
  `

  const limitingContainer = document.createElement("div");

  const strong = document.createElement("strong");
  const strongText = document.createTextNode("\u200BStrong Text\u200B");
  strong.append(strongText);
  limitingContainer.append(strong);

  const afterStrongTextNode = new Text("\u200B This is text after strong\u200B");
  limitingContainer.append(afterStrongTextNode);

  const afterStrongSiblingTextNode = new Text("\u200B This is more text\u200B");
  limitingContainer.appendChild(afterStrongSiblingTextNode);

  // do more




  test("confirm all nodes are what they should be", function() {

    const textNodes = getAllTextNodes([limitingContainer]);
    expect(textNodes.length).toBe(3);
    // do more
  })
  
  // test("", function() {
  //   const selection = window.getSelection();
  //   selection!.setBaseAndExtent()
  //   experimental_moveSelection
  // })


})


describe("test shiftSelection", function() {
  // TODO
})


describe("test resetTextNodesCushions", function() {
  // TODO
})