"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
const globals_1 = require("@jest/globals");
const dom_operations_1 = require("./dom_operations");
const test_constants_and_helpers_1 = require("./test_constants_and_helpers");
(0, globals_1.describe)("test generateQueryFromElement", function () {
    // TODO
});
(0, globals_1.describe)("test wrapInElement", function () {
    (0, globals_1.beforeEach)(function () {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("wrap element in element", function () {
        const italics = document.querySelector("i#italics-1");
        const anchor = document.createElement("a");
        const italicsTextContent = italics === null || italics === void 0 ? void 0 : italics.textContent;
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italics === null || italics === void 0 ? void 0 : italics.parentNode).not.toBeNull();
        const parentNode = italics.parentNode;
        const allSiblings = Array.from(parentNode.childNodes);
        const startContainerOffset = allSiblings.findIndex(n => n === italics);
        const endContainerOffset = startContainerOffset + 1;
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(parentNode, startContainerOffset, parentNode, endContainerOffset);
        (0, globals_1.expect)(selection).not.toBeNull();
        (0, globals_1.expect)(selection.anchorNode).toBe(selection.focusNode);
        (0, globals_1.expect)(selection).not.toBeNull();
        const selectionTextContent = selection.toString();
        (0, globals_1.expect)(selectionTextContent).toBe(italicsTextContent);
        (0, dom_operations_1.wrapInElement)(selection, anchor, document.body);
        const reestablishedItalics = document.querySelector("i#italics-1");
        (0, globals_1.expect)(anchor.parentNode).toBe(reestablishedItalics);
        // make sure italics textContent is unchanged
        (0, globals_1.expect)(italics.textContent).toBe(italicsTextContent);
        (0, globals_1.expect)(anchor.textContent).toBe(italicsTextContent);
    });
    (0, globals_1.test)("wrap text in element", function () {
        const italics = document.querySelector("i#italics-2");
        (0, globals_1.expect)(italics).not.toBeNull();
        const italicsText = italics.childNodes[0];
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(italicsText, 7, italicsText, 18);
        (0, globals_1.expect)(selection).not.toBeNull();
        const underlineElement = document.createElement('u');
        (0, dom_operations_1.wrapInElement)(selection, underlineElement, document.body);
        (0, globals_1.expect)(underlineElement.parentNode).toBe(italics);
        (0, globals_1.expect)(underlineElement.textContent).toEqual(selection.toString());
        (0, globals_1.expect)(italics.childNodes.length).toBe(3);
        (0, globals_1.expect)(italics.childNodes[1]).toBe(underlineElement);
    });
    (0, globals_1.test)("wraps text in element but leaves unbreakable tag outside", function () {
        document.body.innerHTML = test_constants_and_helpers_1.alternateHTMLwithUnbreakable;
        const underline = document.querySelector("u");
        const lastItalics = document.querySelector("div > i");
        (0, globals_1.expect)(underline).not.toBeNull();
        (0, globals_1.expect)(lastItalics).not.toBeNull();
        const underlineText = underline.childNodes[0];
        const lastItalicsText = lastItalics.childNodes[0];
        (0, globals_1.expect)(underlineText).not.toBeNull();
        (0, globals_1.expect)(lastItalicsText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(underlineText, 8, lastItalicsText, 7);
        const selectionText = selection.toString();
        (0, globals_1.expect)(selectionText).not.toBeNull();
        // expect(selectionText).toBe("")
        (0, globals_1.expect)(selectionText).toBe("e in Fourth Strong Text Fifth Strong Text - UnbreakableItalics");
        const anchorElement = document.createElement('a');
        const div = document.querySelector("div");
        (0, globals_1.expect)(div).not.toBeNull();
        (0, dom_operations_1.wrapInElement)(selection, anchorElement, div);
        (0, globals_1.expect)(document.body.innerHTML).toBe(`
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
    });
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
(0, globals_1.describe)("test deleteEmptyElementsByQuery", function () {
    (0, globals_1.test)("delete empty elements, leave valid elements 1", function () {
        document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
        (0, dom_operations_1.deleteEmptyElementsByQuery)("i", document.querySelector("div"));
        (0, globals_1.expect)(document.body.innerHTML).toBe("<div><strong></strong><i><strong></strong></i><strong></strong><strong><i>Valid Text</i></strong></div>");
    });
    (0, globals_1.test)("delete empty elements, leave valid elements 2", function () {
        document.body.innerHTML = "<div><strong></strong><i></i><i><strong></strong></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>";
        (0, dom_operations_1.deleteEmptyElementsByQuery)("strong", document.querySelector("div"));
        (0, globals_1.expect)(document.body.innerHTML).toBe("<div><i></i><i></i><strong><i></i></strong><strong><i>Valid Text</i></strong></div>");
    });
});
(0, globals_1.describe)("test deleteEmptyElements", function () {
    // TODO
});
(0, globals_1.describe)("test unwrapSelectionFromQuery", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("promotes text out of italics", function () {
        const italics = document.querySelector("i#italics-2");
        const italicsTextContent = italics === null || italics === void 0 ? void 0 : italics.textContent;
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italics === null || italics === void 0 ? void 0 : italics.parentNode).not.toBeNull();
        const parentNode = italics.parentNode;
        (0, globals_1.expect)(italics.childNodes.length).toBe(1);
        const italicsTextNode = italics.childNodes[0];
        (0, globals_1.expect)(italicsTextContent).toEqual(italicsTextNode.textContent);
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(italicsTextNode, 0, italicsTextNode, italicsTextContent.length);
        (0, globals_1.expect)(selection).not.toBeNull();
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        (0, dom_operations_1.unwrapSelectionFromQuery)(selection, "i", limitingContainer);
        (0, globals_1.expect)(italics.textContent.length).toEqual(0);
        const range = selection.getRangeAt(0);
        (0, globals_1.expect)(range).not.toBeNull();
        (0, globals_1.expect)(selection.anchorNode).toBe(selection.focusNode);
        (0, globals_1.expect)(selection.anchorNode.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(document.querySelectorAll("i#italics-2").length).toBe(0);
    });
    (0, globals_1.test)("promote text in italics out of strong", function () {
        const italics = document.querySelector("i#italics-2");
        const italicsTextContent = italics === null || italics === void 0 ? void 0 : italics.textContent;
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italics === null || italics === void 0 ? void 0 : italics.parentNode).not.toBeNull();
        const parentNode = italics.parentNode;
        (0, globals_1.expect)(italics.childNodes.length).toBe(1);
        const italicsTextNode = italics.childNodes[0];
        (0, globals_1.expect)(italicsTextContent).toEqual(italicsTextNode.textContent);
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(italicsTextNode, 0, italicsTextNode, italicsTextContent.length);
        (0, globals_1.expect)(selection).not.toBeNull();
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        (0, dom_operations_1.unwrapSelectionFromQuery)(selection, "strong", limitingContainer);
        (0, globals_1.expect)(document.body.innerHTML).toBe(`<div>
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
    });
});
(0, globals_1.describe)("test unwrapSelectionFromQuery - alternateHTML", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.alternateHTML;
    });
    (0, globals_1.test)("unwrapSelectionFromQuery", function () {
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const firstStrong = document.querySelector("strong:nth-of-type(1)");
        const thirdStrong = document.querySelector("strong:nth-of-type(3)");
        (0, globals_1.expect)(firstStrong).not.toBeNull();
        (0, globals_1.expect)(thirdStrong).not.toBeNull();
        const firstStrongText = firstStrong.childNodes[0];
        const thirdStrongText = thirdStrong.childNodes[0];
        (0, globals_1.expect)(firstStrongText).not.toBeNull();
        (0, globals_1.expect)(thirdStrongText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(firstStrongText, 5, thirdStrongText, 7);
        (0, globals_1.expect)(selection).not.toBeNull();
        (0, dom_operations_1.unwrapSelectionFromQuery)(selection, "strong", limitingContainer);
        (0, globals_1.expect)(document.body.innerHTML).toBe(`
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
    </div>`.replaceAll(/\n */g, ''));
    });
});
(0, globals_1.describe)("test unwrapRangeFromQuery", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("promotes text out of italics", function () {
        const italics = document.querySelector("i#italics-2");
        const italicsTextContent = italics === null || italics === void 0 ? void 0 : italics.textContent;
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italics === null || italics === void 0 ? void 0 : italics.parentNode).not.toBeNull();
        const parentNode = italics.parentNode;
        (0, globals_1.expect)(italics.childNodes.length).toBe(1);
        const italicsTextNode = italics.childNodes[0];
        (0, globals_1.expect)(italicsTextContent).toEqual(italicsTextNode.textContent);
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(italicsTextNode, 0, italicsTextNode, italicsTextContent.length);
        (0, globals_1.expect)(selection).not.toBeNull();
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const range = selection.getRangeAt(0);
        (0, globals_1.expect)(range).not.toBeNull();
        (0, dom_operations_1.unwrapRangeFromQuery)(range, "i", limitingContainer);
        (0, globals_1.expect)(italics.textContent.length).toEqual(0);
        // const range = selection!.getRangeAt(0);
        (0, globals_1.expect)(range).not.toBeNull();
        (0, globals_1.expect)(selection.anchorNode).toBe(selection.focusNode);
        (0, globals_1.expect)(selection.anchorNode.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(document.querySelectorAll("i#italics-2").length).toBe(0);
    });
    (0, globals_1.test)("promote text in italics out of strong", function () {
        const italics = document.querySelector("i#italics-2");
        const italicsTextContent = italics === null || italics === void 0 ? void 0 : italics.textContent;
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italics === null || italics === void 0 ? void 0 : italics.parentNode).not.toBeNull();
        const parentNode = italics.parentNode;
        (0, globals_1.expect)(italics.childNodes.length).toBe(1);
        const italicsTextNode = italics.childNodes[0];
        (0, globals_1.expect)(italicsTextContent).toEqual(italicsTextNode.textContent);
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(italicsTextNode, 0, italicsTextNode, italicsTextContent.length);
        (0, globals_1.expect)(selection).not.toBeNull();
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const range = selection.getRangeAt(0);
        (0, globals_1.expect)(range).not.toBeNull();
        (0, dom_operations_1.unwrapRangeFromQuery)(range, "strong", limitingContainer);
        (0, globals_1.expect)(document.body.innerHTML).toBe(`<div>
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
    });
});
(0, globals_1.describe)("test promoteChildrenOfNode", function () {
    // TODO
});
(0, globals_1.describe)("test generateQuery", function () {
    (0, globals_1.test)("generateQuery on #strong-1", function () {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
        const idealQuery = "strong#strong-1";
        const generatedQuery = (0, dom_operations_1.generateQuery)({
            element: "strong",
            id: "strong-1"
        });
        (0, globals_1.expect)(generatedQuery).toEqual(idealQuery);
        const strong = document.querySelector(generatedQuery);
        (0, globals_1.expect)(strong).not.toBeNull();
        (0, globals_1.expect)(strong.textContent).toBe("Strong Text");
    });
    (0, globals_1.test)("generateQuery with attributes and unbreakable", function () {
        const generatedQuery = (0, dom_operations_1.generateQuery)({
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
        (0, globals_1.expect)(generatedQuery).toBe(`strong#strong-1[data-unbreakable][test-attribute="17"][test-attribute-two="test-attribute-two-value"]`);
    });
});
(0, globals_1.describe)("test createWrapper", function () {
    (0, globals_1.test)("create empty strong element", function () {
        const wrapper = (0, dom_operations_1.createWrapper)({
            element: "strong",
            id: "strong-1"
        }, document);
        (0, globals_1.expect)(wrapper.classList.length).toBe(0);
        (0, globals_1.expect)(wrapper instanceof HTMLElement).toBe(true);
        (0, globals_1.expect)(wrapper.childNodes.length).toBe(0);
        (0, globals_1.expect)(wrapper.nodeName).toBe("STRONG");
        (0, globals_1.expect)(wrapper.id).toBe("strong-1");
    });
    (0, globals_1.test)("create strong element with classes", function () {
        const wrapper = (0, dom_operations_1.createWrapper)({
            element: "strong",
            classList: [
                "strong-wrapper",
                "wrapper-strong"
            ]
        }, document);
        (0, globals_1.expect)(wrapper instanceof HTMLElement).toBe(true);
        (0, globals_1.expect)(wrapper.childNodes.length).toBe(0);
        (0, globals_1.expect)(wrapper.nodeName).toBe("STRONG");
        (0, globals_1.expect)(wrapper.classList.length).toBe(2);
        (0, globals_1.expect)(wrapper.classList.contains("strong-wrapper")).toBe(true);
        (0, globals_1.expect)(wrapper.classList.contains("wrapper-strong")).toBe(true);
    });
    (0, globals_1.test)("create strong element with unbreakable attribute", function () {
        const wrapper = (0, dom_operations_1.createWrapper)({
            element: "strong",
            unbreakable: true
        }, document);
        (0, globals_1.expect)(wrapper instanceof HTMLElement).toBe(true);
        (0, globals_1.expect)(wrapper.childNodes.length).toBe(0);
        (0, globals_1.expect)(wrapper.nodeName).toBe("STRONG");
        (0, globals_1.expect)(wrapper.getAttribute('fake-attribute')).toBeNull();
        // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
        (0, globals_1.expect)(wrapper.getAttribute('data-unbreakable')).toBe('');
    });
    (0, globals_1.test)("create strong element with unbreakable and other attributes", function () {
        const wrapper = (0, dom_operations_1.createWrapper)({
            element: "strong",
            unbreakable: true,
            attributes: {
                "test-one": "true",
                "test-two": undefined,
                "test-three": "testvalue"
            }
        }, document);
        (0, globals_1.expect)(wrapper instanceof HTMLElement).toBe(true);
        (0, globals_1.expect)(wrapper.childNodes.length).toBe(0);
        (0, globals_1.expect)(wrapper.nodeName).toBe("STRONG");
        (0, globals_1.expect)(wrapper.getAttribute('fake-attribute')).toBeNull();
        // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
        (0, globals_1.expect)(wrapper.getAttribute('data-unbreakable')).toBe('');
        (0, globals_1.expect)(wrapper.getAttribute('test-one')).toBe('true');
        (0, globals_1.expect)(wrapper.getAttribute('test-two')).toBe('');
        (0, globals_1.expect)(wrapper.getAttribute('test-three')).toBe('testvalue');
    });
    (0, globals_1.test)("ensure that unbreakable named argument overrides unbreakable in attributes argument", function () {
        const wrapper = (0, dom_operations_1.createWrapper)({
            element: "strong",
            unbreakable: true,
            attributes: {
                "data-unbreakable": "test-value-to-be-overidden"
            }
        }, document);
        (0, globals_1.expect)(wrapper instanceof HTMLElement).toBe(true);
        (0, globals_1.expect)(wrapper.childNodes.length).toBe(0);
        (0, globals_1.expect)(wrapper.nodeName).toBe("STRONG");
        (0, globals_1.expect)(wrapper.getAttribute('fake-attribute')).toBeNull();
        // expect(wrapper.getAttribute('unbreakable')).not.toBeNull();
        (0, globals_1.expect)(wrapper.getAttribute('data-unbreakable')).toBe('');
    });
});
(0, globals_1.describe)("test cushionTextNode", function () {
    // TODO
});
