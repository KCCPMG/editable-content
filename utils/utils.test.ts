/**
 * @jest-environment jsdom
 */


import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { setSelection, wrapInElement, unwrapSelectionFromQuery, deleteEmptyElementsByQuery, nodeIsDescendentOf, selectionIsDescendentOfNode, selectionIsCoveredBy, generateQuery } from './utils';


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


describe("test setSelection", function() {

  beforeEach(function() {
    testNumber++;
  })

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


describe("test selectionIsCoveredBy", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  });
  

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

describe("test selectionIsCoveredBy - alternate DOM", function() {

  beforeEach(function() {
    document.body.innerHTML = `
    <div>
      <strong>First Strong Text</strong>
      <strong>Second Strong Text</strong>
      <strong>Third Strong Text</strong>
      <strong>
        Fourth Strong Text 
        <i>Italics In Fourth Strong Text </i>
        <u>Underline in Fourth Strong Text </u>
      </strong>
      <strong>Fifth Strong Text</strong>
      <i>Italics After Fifth Strong Text</i>
      <strong>Sixth Strong Text</strong>
    </div>`.replaceAll(/\n */g, '');
  });



  test("selection in range of siblings of same type", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    const thirdStrong = document.querySelector("strong:nth-of-type(3)");

    expect(firstStrong).not.toBeNull();
    expect(thirdStrong).not.toBeNull();

    const firstStrongText = firstStrong!.childNodes[0];
    const thirdStrongText = thirdStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();
    expect(thirdStrongText).not.toBeNull();

    const selection = setSelection(firstStrongText, 5, thirdStrongText, 7);
    expect(selection).not.toBeNull();

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "italics", limitingContainer!)).toBe(false)

  })

  test("range of siblings contains element children", function() {

    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const fourthStrong = document.querySelector("strong:nth-of-type(4)");
    const fifthStrong = document.querySelector("strong:nth-of-type(5)");

    expect(fourthStrong).not.toBeNull();
    expect(fifthStrong).not.toBeNull();

    const fourthStrongText = fourthStrong!.childNodes[0];
    const fifthStrongText = fifthStrong!.childNodes[0];

    expect(fourthStrongText).not.toBeNull();
    expect(fifthStrongText).not.toBeNull();

    const selection = setSelection(fourthStrongText, 7, fifthStrongText, 4)

    expect(selectionIsCoveredBy(selection!, "strong", limitingContainer!)).toBe(true);
    expect(selectionIsCoveredBy(selection!, "italics", limitingContainer!)).toBe(false);


  })

  test("", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    const fourthStrong = document.querySelector("strong:nth-of-type(4)");
    
    expect(firstStrong).not.toBeNull();
    expect(fourthStrong).not.toBeNull();
    
    const firstStrongText = firstStrong!.childNodes[0];
    const fourthStrongText = fourthStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();
    expect(fourthStrongText).not.toBeNull();

    const selection = setSelection(firstStrongText, 3, firstStrongText, 8);
    expect(selectionIsCoveredBy(selection!, 'strong', limitingContainer!)).toBe(true);


  })

  test("across siblings which are not of same type", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const fourthStrong = document.querySelector("strong:nth-of-type(4)");
    const sixthStrong = document.querySelector("strong:nth-of-type(6)");
    
    expect(fourthStrong).not.toBeNull();
    expect(sixthStrong).not.toBeNull();

    const fourthStrongText = fourthStrong!.childNodes[0];
    const sixthStrongText = sixthStrong!.childNodes[0];

    expect(fourthStrongText).not.toBeNull();
    expect(sixthStrongText).not.toBeNull();
    expect(sixthStrongText.textContent).toBe("Sixth Strong Text");

    const selection = setSelection(fourthStrongText, 4, sixthStrongText, 10);

    expect(selectionIsCoveredBy(selection!, 'strong', limitingContainer!)).toBe(false);
    expect(selectionIsCoveredBy(selection!, 'i', limitingContainer!)).toBe(false);
  })
})


describe("test generateQuery", function() {

  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  });

  test("generateQuery on #strong-1", function() {
    const idealQuery = "strong#strong-1"
    const generatedQuery = generateQuery({
      element: "strong",
      id: "strong-1"
    });
    expect(generatedQuery).toEqual(idealQuery);
    
    const strong = document.querySelector(generatedQuery);
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("Strong Text");
    
  })
})


describe("test createWrapper", function() {

})