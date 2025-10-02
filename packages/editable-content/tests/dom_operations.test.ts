/**
 * @jest-environment jsdom
 */
import {describe, expect, jest, test, beforeEach} from '@jest/globals';
import { wrapInElement, deleteEmptyElementsByQuery, unwrapSelectionFromQuery, unwrapRangeFromQuery, generateQuery, createWrapper } from "../src/utils/dom_operations";
import { startingHTML, alternateHTMLwithUnbreakable, alternateHTML } from "./test_constants_and_helpers";



describe("test generateQueryFromElement", function() {
  // TODO
})


describe("test wrapInElement", function() {

  beforeEach(function() {
    document.body.innerHTML = startingHTML;
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
    const selection = window.getSelection();
    selection?.setBaseAndExtent(parentNode!, startContainerOffset, parentNode!, endContainerOffset);
    expect(selection).not.toBeNull();
    expect(selection!.anchorNode).toBe(selection!.focusNode)
    expect(selection).not.toBeNull();

    const selectionTextContent = selection!.toString();
    expect(selectionTextContent).toBe(italicsTextContent);

    wrapInElement(selection!, anchor, document.body);


    const reestablishedItalics = document.querySelector("i#italics-1");
    expect(anchor!.parentNode).toBe(reestablishedItalics);
    // make sure italics textContent is unchanged
    expect(italics!.textContent).toBe(italicsTextContent);
    expect(anchor.textContent).toBe(italicsTextContent);

  })

  test("wrap text in element", function(){
    const italics = document.querySelector("i#italics-2");
    expect(italics).not.toBeNull();
    const italicsText = italics!.childNodes[0];
    const selection = window.getSelection();
    selection?.setBaseAndExtent(italicsText!, 7, italicsText!, 18);
    expect(selection).not.toBeNull();

    const underlineElement = document.createElement('u');
    wrapInElement(selection!, underlineElement, document.body);

    expect(underlineElement.parentNode).toBe(italics);
    expect(underlineElement.textContent).toEqual(selection!.toString());
    expect(italics!.childNodes.length).toBe(3);
    expect(italics!.childNodes[1]).toBe(underlineElement);

  })


  test("wraps text in element but leaves unbreakable tag outside", function() {

    document.body.innerHTML = alternateHTMLwithUnbreakable;

    const underline = document.querySelector("u");
    const lastItalics = document.querySelector("div > i");
    expect(underline).not.toBeNull();
    expect(lastItalics).not.toBeNull();
    const underlineText = underline!.childNodes[0];
    const lastItalicsText = lastItalics!.childNodes[0];
    expect(underlineText).not.toBeNull();
    expect(lastItalicsText).not.toBeNull();

    const selection = window.getSelection();
    selection?.setBaseAndExtent(underlineText!, 8, lastItalicsText!, 7);
    const selectionText = selection!.toString();
    expect(selectionText).not.toBeNull();
    // expect(selectionText).toBe("")
    expect(selectionText).toBe("e in Fourth Strong Text Fifth Strong Text - UnbreakableItalics");

    const anchorElement = document.createElement('a');
    const div = document.querySelector("div");
    expect(div).not.toBeNull();
    wrapInElement(selection!, anchorElement, div!);

    expect(document.body.innerHTML).toBe(`
      <div>
        <strong>First Strong Text</strong>
        <strong>Second Strong Text</strong>
        <strong>Third Strong Text</strong>
        <strong>
          Fourth Strong Text 
          <i>Italics In Fourth Strong Text </i>
          <u>Underlin</u>
        </strong>
        <a>
          <strong>
            <u>e in Fourth Strong Text </u>
          </strong>
        </a>
        <strong data-unbreakable="">Fifth Strong Text - Unbreakable</strong>
        <a>
          <i>Italics</i>
        </a>
        <i> After Fifth Strong Text</i>
        <strong>Sixth Strong Text</strong>
      </div>`.replaceAll(/\n */g, ''));


  })

  // `<div>
  //   <strong>First Strong Text</strong>
  //   <strong>Second Strong Text</strong>
  //   <strong>Third Strong Text</strong>
  //   <strong>
  //     Fourth Strong Text 
  //     <i>Italics In Fourth Strong Text </i>
  //     <u>Underline</u>
  //   </strong>
  //   <strong>
  //     <u>e in Fourth Strong Text </u>
  //   </strong>
  //   <strong unbreakable=\"\">Fifth Strong Text - Unbreakable</strong>
  //   <i>Italics</i>
  //   <i> After Fifth Strong Text</i>
  //   <strong>Sixth Strong Text</strong>
  // </div>`

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


describe("test deleteEmptyElements", function() {
  // TODO
})


describe("test unwrapSelectionFromQuery", function() {

  beforeEach(() => {
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

    const selection = window.getSelection();
    selection?.setBaseAndExtent(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "i", limitingContainer!);

    expect(italics!.textContent!.length).toEqual(0);

    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();

    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.anchorNode!.nodeType).toBe(Node.TEXT_NODE);

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

    const selection = window.getSelection();
    selection?.setBaseAndExtent(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    unwrapSelectionFromQuery(selection!, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(
      `<div>
        <strong id="strong-1">Strong Text</strong>
        <i id="italics-1">Italics Text</i>
        Orphan Text
        <strong id="strong-2">
          Strong Text
        </strong>
        <i id="italics-2">
          Strong and Italics Text
        </i>
        <strong id="strong-2">
          More Strong Text
        </strong>
      </div>`.replaceAll(/\n */g, ''));
  })
});


describe("test unwrapSelectionFromQuery - alternateHTML", function() {
  
  beforeEach(() => {
    document.body.innerHTML = alternateHTML;
  })

  test("unwrapSelectionFromQuery", function() {
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

    const selection = window.getSelection();
    selection?.setBaseAndExtent(firstStrongText, 5, thirdStrongText, 7);
    expect(selection).not.toBeNull();

    unwrapSelectionFromQuery(selection!, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(`
    <div>
      <strong>First</strong> Strong Text
      Second Strong Text
      Third S<strong>trong Text</strong>
      <strong>
        Fourth Strong Text 
        <i>Italics In Fourth Strong Text </i>
        <u>Underline in Fourth Strong Text </u>
      </strong>
      <strong>Fifth Strong Text</strong>
      <i>Italics After Fifth Strong Text</i>
      <strong>Sixth Strong Text</strong>
    </div>`.replaceAll(/\n */g, '')
    )
  })

})


describe("test unwrapRangeFromQuery", function() {
  beforeEach(() => {
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

    const selection = window.getSelection();
    selection?.setBaseAndExtent(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();
    unwrapRangeFromQuery(range, "i", limitingContainer!);

    expect(italics!.textContent!.length).toEqual(0);

    // const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();

    expect(selection!.anchorNode).toBe(selection!.focusNode);
    expect(selection!.anchorNode!.nodeType).toBe(Node.TEXT_NODE);

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

    const selection = window.getSelection();
    selection?.setBaseAndExtent(italicsTextNode!, 0, italicsTextNode!, italicsTextContent!.length);

    expect(selection).not.toBeNull();

    const limitingContainer = document.querySelector("div")

    expect(limitingContainer).not.toBeNull();
    const range = selection!.getRangeAt(0);
    expect(range).not.toBeNull();
    unwrapRangeFromQuery(range, "strong", limitingContainer!);

    expect(document.body.innerHTML).toBe(
      `<div>
        <strong id="strong-1">Strong Text</strong>
        <i id="italics-1">Italics Text</i>
        Orphan Text
        <strong id="strong-2">
          Strong Text
        </strong>
        <i id="italics-2">
          Strong and Italics Text
        </i>
        <strong id="strong-2">
          More Strong Text
        </strong>
      </div>`.replaceAll(/\n */g, ''));
  })
})


describe("test promoteChildrenOfNode", function() {
  // TODO
})


describe("test generateQuery", function() {

  test("generateQuery on #strong-1", function() {
    document.body.innerHTML = startingHTML;
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


  test("generateQuery with attributes and unbreakable", function() {
    const generatedQuery = generateQuery({
      element: "strong",
      classList: [
        "fake-class",
        "bad-class"
      ],
      id: "strong-1",
      unbreakable: true,
      attributes: {
        "test-attribute": "17",
        "test-attribute-two": "test-attribute-two-value"
      }
    });

    expect(generatedQuery).toBe(`strong#strong-1[data-unbreakable][test-attribute="17"][test-attribute-two="test-attribute-two-value"]`)
  })


})


describe("test createWrapper", function() {

  test("create empty strong element", function() {
    const wrapper = createWrapper({
      element: "strong",
      id: "strong-1"
    }, document);

    expect(wrapper.classList.length).toBe(0);
    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.id).toBe("strong-1");
  })

  test("create strong element with classes", function() {
    const wrapper = createWrapper({
      element: "strong",
      classList: [
        "strong-wrapper",
        "wrapper-strong"
      ]
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.classList.length).toBe(2);
    expect(wrapper.classList.contains("strong-wrapper")).toBe(true);
    expect(wrapper.classList.contains("wrapper-strong")).toBe(true);
  })

  test("create strong element with unbreakable attribute", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
  })

  test("create strong element with unbreakable and other attributes", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true,
      attributes: {
        "test-one": "true",
        "test-two": undefined,
        "test-three": "testvalue"
      }

    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
    expect(wrapper.getAttribute('test-one')).toBe('true');
    expect(wrapper.getAttribute('test-two')).toBe('');
    expect(wrapper.getAttribute('test-three')).toBe('testvalue');
  })

  test("ensure that unbreakable named argument overrides unbreakable in attributes argument", function() {
    const wrapper = createWrapper({
      element: "strong",
      unbreakable: true,
      attributes: {
        "data-unbreakable": "test-value-to-be-overidden"
      }
    }, document);

    expect(wrapper instanceof HTMLElement).toBe(true);
    expect(wrapper.childNodes.length).toBe(0);
    expect(wrapper.nodeName).toBe("STRONG");
    expect(wrapper.getAttribute('fake-attribute')).toBeNull();
    // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
    expect(wrapper.getAttribute('data-unbreakable')).toBe('');
  })

})


describe("test cushionTextNode", function() {
  // TODO
})

