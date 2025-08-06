/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { selectionIsDescendentOfNode, getSelectionChildNodes, getRangeChildNodes, selectionIsCoveredBy, nodeIsDescendentOf, getLastValidCharacterIndex } from "./checks";
import { setSelection, resetRangeToTextNodes } from "./selection_movements";
import { startingHTML, alternateHTML } from "./test_constants";



describe("test isValidTextEndpoint", function() {
  // TODO
})


describe("test getNearestValidOffset", function() {
  // TODO
})


describe("test nodeIsDescendentOf", function() {

  beforeEach(() => {
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


describe("test getAncestorNode", function() {
  // TODO
})


describe("test getRangeLowestAncestorElement", function() {
  // TODO
})


describe("test getNodeLowestAncestorElement", function() {
  // TODO
})


describe("test getSelectionDirection", function() {
  // TODO
})


describe("test nodeIsDescendentOfNode", function() {
  // TODO
})


describe("test selectionIsDescendentOfNode", function() {

  beforeEach(() => {
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


describe("test getSelectionChildNodes", function() {
  beforeEach(() => {
    document.body.innerHTML = startingHTML;
  })

  test("Check selection across elements", function() {
    const strong = document.querySelector("strong#strong-1");

    const limitingContainer = document.querySelector("div") 
    const orphanTextNode = limitingContainer?.childNodes[2];

    expect(strong).not.toBeNull();
    expect(orphanTextNode).not.toBeNull();
    const strongText = strong!.childNodes[0];
    expect(strongText).not.toBeNull();

    expect(orphanTextNode!.nodeType).toBe(Node.TEXT_NODE);

    const selection = setSelection(strongText!, 5, orphanTextNode!, 7);

    const result = getSelectionChildNodes(selection!, limitingContainer!);

    expect(result instanceof Array).toBe(true);
    expect(result.length).toBe(4);
    expect(result[0].textContent).toBe("Strong Text")
    expect(result[1].textContent).toBe("Italics Text")
    expect(result[2].textContent).toBe("Italics Text")
    expect(result[3].textContent).toBe("Orphan Text")
  })
})


describe("test getRangeChildNodes", function() {

  const htmlAsNode = new DOMParser()
    .parseFromString(startingHTML, "text/html").body;

  const containingDiv = htmlAsNode.childNodes[0];

  const firstStrong = containingDiv.childNodes[0];
  const firstStrongText = firstStrong.childNodes[0];

  const firstItalics = containingDiv.childNodes[1];
  const firstItalicsText = firstItalics.childNodes[0];

  const orphanText = containingDiv.childNodes[2];

  const secondStrong = containingDiv.childNodes[3];
  const secondStrongFirstText = secondStrong.childNodes[0];
  const secondStrongFirstItalics = secondStrong.childNodes[1];
  const secondStrongFirstItalicsText = secondStrongFirstItalics.childNodes[0];
  const secondStrongSecondText = secondStrong.childNodes[2];



  test("make sure nodes are what they should be", function() {
    expect(firstStrong.textContent).toBe("Strong Text");
    expect(firstStrong.nodeType).toBe(Node.ELEMENT_NODE);
    expect((firstStrong as Element).tagName).toBe("STRONG");

    expect(firstStrongText.textContent).toBe("Strong Text");
    expect(firstStrongText.nodeType).toBe(Node.TEXT_NODE);

    expect(firstItalics.textContent).toBe("Italics Text");
    expect(firstItalics.nodeType).toBe(Node.ELEMENT_NODE);
    expect((firstItalics as Element).tagName).toBe("I");

    expect(firstItalicsText.textContent).toBe("Italics Text");
    expect(firstItalicsText.nodeType).toBe(Node.TEXT_NODE);

    expect(orphanText.textContent).toBe("Orphan Text");
    expect(orphanText.nodeType).toBe(Node.TEXT_NODE);

    expect(secondStrong.textContent).toBe("Strong TextStrong and Italics TextMore Strong Text");
    expect(secondStrong.nodeType).toBe(Node.ELEMENT_NODE);
    expect((secondStrong as Element).tagName).toBe("STRONG");

    expect(secondStrongFirstText.textContent).toBe("Strong Text");
    expect(secondStrongFirstText.nodeType).toBe(Node.TEXT_NODE);

    expect(secondStrongFirstItalics.textContent).toBe("Strong and Italics Text");
    expect(secondStrongFirstItalics.nodeType).toBe(Node.ELEMENT_NODE);
    expect((secondStrongFirstItalics as Element).tagName).toBe("I");

    expect(secondStrongFirstItalicsText.textContent).toBe("Strong and Italics Text");
    expect(secondStrongFirstItalicsText.nodeType).toBe(Node.TEXT_NODE);   

    expect(secondStrongSecondText.textContent).toBe("More Strong Text");
    expect(secondStrongSecondText.nodeType).toBe(Node.TEXT_NODE);   


  }) 

  test("get nodes covering text within strongText", function() {
    const range = new Range();
    range.setStart(firstStrongText, 0);
    range.setEnd(firstStrongText, 11);
    const nodes = getRangeChildNodes(range, htmlAsNode);
    expect(nodes.length).toBe(1);
    expect(nodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[0].textContent).toBe("Strong Text");
  })

  test("get nodes covering text across nodes", function() {
    const range = new Range();
    range.setStart(firstStrongText, 7);
    range.setEnd(orphanText, 6);
    expect(range.toString()).toBe("TextItalics TextOrphan");
    const nodes = getRangeChildNodes(range, htmlAsNode);
    expect(nodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[1].nodeType).toBe(Node.ELEMENT_NODE);
    expect(nodes[2].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[3].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[0]).toBe(firstStrongText);
    expect(nodes[1]).toBe(firstItalics);
    expect(nodes[2]).toBe(firstItalicsText);
    expect(nodes[3]).toBe(orphanText);
    expect(nodes.length).toBe(4);
  })

  test("get nodes when range starts in non-text node", function() {
    const range = new Range();
    range.setStart(containingDiv, 1);
    range.setEnd(orphanText, 6);
    expect(range.toString()).toBe("Italics TextOrphan");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstItalics);
    expect(nodes[1]).toBe(firstItalicsText);
    expect(nodes[2]).toBe(orphanText);
    expect(nodes.length).toBe(3);
  })

  test("get nodes when range ends in non-text node", function() {
    const range = new Range();
    range.setStart(containingDiv, 1);
    range.setEnd(containingDiv, 3);
    expect(range.toString()).toBe("Italics TextOrphan Text");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstItalics);
    expect(nodes[1]).toBe(firstItalicsText);
    expect(nodes[2]).toBe(orphanText);
    expect(nodes.length).toBe(3);
  })

  test("get nodes when range ends in non-text node 2", function() {
    const range = new Range();
    range.setStart(firstStrongText, 2);
    range.setEnd(containingDiv, 2);
    expect(range.toString()).toBe("rong TextItalics Text");
    const nodes = getRangeChildNodes(range, containingDiv);
    expect(nodes[0]).toBe(firstStrongText);
    expect(nodes[1]).toBe(firstItalics);
    expect(nodes[2]).toBe(firstItalicsText);
    expect(nodes.length).toBe(3);
  })


  test("get nodes in propful-only example", function() {
    const customHTML = `
      <div 
        id="portal-container-12345" 
        data-button-key="propful-only"
      >
        <div 
          class="MuiBox-root css-1otupa8" 
          data-bk="propful-only" data-unbreakable=""
        >
          <span data-exclude-from-dehydrated="">
            ​6​​ ​
          </span>
          ​Propful Component​
        </div>
      </div>`.replace(/\n */g, ''); 
    const customHTMLAsNode = new DOMParser()
      .parseFromString(customHTML, "text/html")
      .body;

    const expectedContainingDiv = customHTMLAsNode.childNodes[0];
    // confirm correct div
    expect(expectedContainingDiv.nodeType).toBe(Node.ELEMENT_NODE);

    // type confirmed
    const containingDiv = expectedContainingDiv as Element;
    expect(containingDiv.tagName).toBe('DIV');
    expect(containingDiv.getAttribute('id')).toBe('portal-container-12345');

    // set the following range:
    /**
     * <div 
        id="portal-container-12345" 
        data-button-key="propful-only"
      >
        ^
        <div 
          class="MuiBox-root css-1otupa8" 
          data-bk="propful-only" data-unbreakable=""
        >
          <span data-exclude-from-dehydrated="">
            ​6​ 
          </span>
          ​Propful Component​
        </div>
              ^
      </div>`
     */

    const childrenRange = new Range();
    childrenRange.setStart(containingDiv, 0);
    childrenRange.setEnd(containingDiv, containingDiv.childNodes.length);

    const childrenRangeText = childrenRange.toString();
    const expectedString = '​6​​ ​​Propful Component​';
    const expectedSpanText = '​6​​ ​';
    for (let i=0; i<childrenRangeText.length; i++) {
      expect(childrenRangeText[i]).toBe(expectedString[i]);
    }
    expect(childrenRangeText.length).toBe(expectedString.length);
    expect(childrenRange.toString()).toEqual(expectedString);



    
    const nodes = getRangeChildNodes(childrenRange, customHTMLAsNode);


    expect(nodes[0].textContent).toBe(childrenRangeText);

    expect(nodes.length).toBe(4);

    expect(nodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    expect((nodes[0] as Element).className).toBe("MuiBox-root css-1otupa8")
    expect(nodes[0].textContent).toBe(expectedString);

    expect(nodes[1].nodeType).toBe(Node.ELEMENT_NODE);
    expect((nodes[1] as Element).tagName).toBe('SPAN');
    expect(nodes[1].textContent).toBe(expectedSpanText);

    expect(nodes[2].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[2].textContent).toBe(expectedSpanText);

    expect(nodes[3].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes[3].textContent).toBe(`​Propful Component​`);

    resetRangeToTextNodes(childrenRange);
    // expect(childrenRange.toString()).toEqual(expectedString);

    const resetNodes = getRangeChildNodes(childrenRange, customHTMLAsNode);

    console.log(resetNodes);
    expect(resetNodes.length).toBe(3);

    // expect(resetNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    // expect((resetNodes[0] as Element).className).toBe("MuiBox-root css-1otupa8")
    // expect(resetNodes[0].textContent).toBe(`​6​​ ​​Propful Component​`);

    expect(resetNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    expect((resetNodes[0] as Element).tagName).toBe('SPAN');
    expect(resetNodes[0].textContent).toBe(`​6​​ ​`);

    expect(resetNodes[2].nodeType).toBe(Node.TEXT_NODE);
    expect(resetNodes[2].textContent).toBe(`​6​​ ​`);

    expect(resetNodes[3].nodeType).toBe(Node.TEXT_NODE);
    expect(resetNodes[3].textContent).toBe(`​Propful Component​`);


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


describe("test selectionIsCoveredBy - alternate HTML", function() {

  beforeEach(function() {
    document.body.innerHTML = alternateHTML;
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

  test("range set within element", function() {
    const limitingContainer = document.querySelector("div");
    expect(limitingContainer).not.toBeNull();

    const firstStrong = document.querySelector("strong:nth-of-type(1)");
    
    expect(firstStrong).not.toBeNull();
    
    const firstStrongText = firstStrong!.childNodes[0];

    expect(firstStrongText).not.toBeNull();

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


describe("test selectionHasTextNodes", function() {
  // TODO
})


describe("test selectionContainsOnlyText", function() {
  // TODO
})


describe("test selectionContainsNoUnbreakables", function() {
  // TODO
})


describe("test getButtonStatus", function() {
  // TODO
})


describe("test getAllTextNodes", function() {
  // TODO
})


describe("test getLastValidTextNode", function() {
  // TODO
})


describe("test getLastValidCharacterIndex", function() {

  test("given text node with all valid characters, returns length", function() {  
    const textNode = new Text("abcde abcdefghijk");
    expect(getLastValidCharacterIndex(textNode)).toBe(textNode.textContent!.length);
  })

  test("given text node with all valid characters when last character is space, returns length", function() {    
    const textNode = new Text("abcde abcdefghijk  ");
    expect(getLastValidCharacterIndex(textNode)).toBe(textNode.textContent!.length);
  })

  test("given text node with invalid character at end, returns length-1", function() {
    const textNode = new Text("abcde abcdefghijk  \u200B");
    expect(getLastValidCharacterIndex(textNode)).toBe(textNode.textContent!.length-1);
  })

  test("edge case, empty cushion", function() {
    const textNode = new Text("\u200B\u200B\u200B\u200B\u200B");
    expect(getLastValidCharacterIndex(textNode)).toBe(1);
  })

  test("edge case, single zero-width space", function() {
    const textNode = new Text("\u200B");
    expect(getLastValidCharacterIndex(textNode)).toBe(1);
  })

  test("edge case, empty text", function() {
    const textNode = new Text("");
    expect(getLastValidCharacterIndex(textNode)).toBe(0);
  })

  test("edge case, no text", function() {
    const textNode = new Text();
    expect(getLastValidCharacterIndex(textNode)).toBe(0);
  })


})

describe("test getLastValidCharacterIndex with max offset", function() {

  test("given text node with all valid characters and maxOffset, returns maxOffset", function() {  
    const textNode = new Text("abcde abcdefghijk");
    expect(getLastValidCharacterIndex(textNode, 8)).toBe(8);
  })

  test("given text node with invalid characters up to maxOffset, returns 0", function() {
    const textNode = new Text("\u200B\u200B\u200Babcde abcdefghijk");
    expect(getLastValidCharacterIndex(textNode, 2)).toBe(0);
  })

  test("given text node with invalid characters short of maxOffset, returns maxOffset", function() {
    const textNode = new Text("\u200B\u200B\u200Babcde abcdefghijk");
    expect(textNode.textContent![3]).toBe("a");
    expect(getLastValidCharacterIndex(textNode, 3)).toBe(3);
  })

  test("given text node with maxOffset greater than content length, returns content length - 1", function() {
    const textNode = new Text("abcde abcdefghijk");
    const textLength = textNode.textContent!.length;
    expect(getLastValidCharacterIndex(textNode, 100)).toBe(textLength-1);
  })

  test("returns correct index if maxOffset is on or after zero-width space", function() {
    const textNode = new Text("abcde \u200B\u200Babcde");
    expect(getLastValidCharacterIndex(textNode, 6)).toBe(5);
    expect(getLastValidCharacterIndex(textNode, 7)).toBe(5);
    expect(getLastValidCharacterIndex(textNode, 8)).toBe(8);
  })

})


describe("test getIsReactComponent", function() {
  // TODO
})


describe("test textNodeIsCushioned", function() {
  // TODO
})


describe("test identifyBadTextNodes", function() {
  // TODO
})