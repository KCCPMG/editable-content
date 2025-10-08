"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
const globals_1 = require("@jest/globals");
const checks_1 = require("../src/utils/checks");
const test_constants_and_helpers_1 = require("./test_constants_and_helpers");
(0, globals_1.describe)("test isValidTextEndpoint", function () {
    // TODO
});
(0, globals_1.describe)("test getNearestValidOffset", function () {
    // TODO
});
(0, globals_1.describe)("test nodeIsDescendentOf", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("test ancestors of italics-2", function () {
        const italics = document.querySelector("i#italics-2");
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "strong#strong-2", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "strong", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "div", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "i#italics-1", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "i", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "strong#strong-1", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.nodeIsDescendentOf)(italics, "a", limitingContainer)).toBe(false);
    });
});
(0, globals_1.describe)("test getAncestorNode", function () {
    // TODO
});
(0, globals_1.describe)("test getRangeLowestAncestorElement", function () {
    // TODO
});
(0, globals_1.describe)("test getNodeLowestAncestorElement", function () {
    // TODO
});
(0, globals_1.describe)("test getSelectionDirection", function () {
    // TODO
});
(0, globals_1.describe)("test nodeIsDescendentOfNode", function () {
    // TODO
});
(0, globals_1.describe)("test selectionIsDescendentOfNode", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("test selection is descendent of node", function () {
        const div = document.querySelector("div");
        const strong = document.querySelector("strong#strong-1");
        const textNode = strong.childNodes[0];
        const selection = window.getSelection();
        if (selection === null)
            throw new Error("selection is null");
        selection.setBaseAndExtent(textNode, 4, textNode, 8);
        (0, globals_1.expect)(selection).not.toBeNull();
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, strong)).toBe(true);
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, div)).toBe(true);
        const badStrong = document.querySelector("strong#strong-2");
        const badItalics = document.querySelector("i#italics-1");
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, badStrong)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, badItalics)).toBe(false);
    });
    (0, globals_1.test)("selection is split across nodes", function () {
        const div = document.querySelector("div");
        const strong = document.querySelector("strong#strong-1");
        const strongTextNode = strong.childNodes[0];
        const italics = document.querySelector("i#italics-1");
        const italicsTextNode = italics.childNodes[0];
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(strongTextNode, 4, italicsTextNode, 3);
        (0, globals_1.expect)(selection).not.toBeNull();
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, strong)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, italics)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, div)).toBe(true);
        const badStrong = document.querySelector("strong#strong-2");
        const badItalics = document.querySelector("i#italics-1");
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, badStrong)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsDescendentOfNode)(selection, badItalics)).toBe(false);
    });
});
(0, globals_1.describe)("test getSelectionChildNodes", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("Check selection across elements", function () {
        const strong = document.querySelector("strong#strong-1");
        const limitingContainer = document.querySelector("div");
        const orphanTextNode = limitingContainer === null || limitingContainer === void 0 ? void 0 : limitingContainer.childNodes[2];
        (0, globals_1.expect)(strong).not.toBeNull();
        (0, globals_1.expect)(orphanTextNode).not.toBeNull();
        const strongText = strong.childNodes[0];
        (0, globals_1.expect)(strongText).not.toBeNull();
        (0, globals_1.expect)(orphanTextNode.nodeType).toBe(Node.TEXT_NODE);
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(strongText, 5, orphanTextNode, 7);
        const result = (0, checks_1.getSelectionChildNodes)(selection, limitingContainer);
        (0, globals_1.expect)(result instanceof Array).toBe(true);
        (0, globals_1.expect)(result.length).toBe(4);
        (0, globals_1.expect)(result[0].textContent).toBe("Strong Text");
        (0, globals_1.expect)(result[1].textContent).toBe("Italics Text");
        (0, globals_1.expect)(result[2].textContent).toBe("Italics Text");
        (0, globals_1.expect)(result[3].textContent).toBe("Orphan Text");
    });
});
(0, globals_1.describe)("test getRangeChildNodes", function () {
    const htmlAsNode = new DOMParser()
        .parseFromString(test_constants_and_helpers_1.startingHTML, "text/html").body;
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
    (0, globals_1.test)("make sure nodes are what they should be", function () {
        (0, globals_1.expect)(firstStrong.textContent).toBe("Strong Text");
        (0, globals_1.expect)(firstStrong.nodeType).toBe(Node.ELEMENT_NODE);
        (0, globals_1.expect)(firstStrong.tagName).toBe("STRONG");
        (0, globals_1.expect)(firstStrongText.textContent).toBe("Strong Text");
        (0, globals_1.expect)(firstStrongText.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(firstItalics.textContent).toBe("Italics Text");
        (0, globals_1.expect)(firstItalics.nodeType).toBe(Node.ELEMENT_NODE);
        (0, globals_1.expect)(firstItalics.tagName).toBe("I");
        (0, globals_1.expect)(firstItalicsText.textContent).toBe("Italics Text");
        (0, globals_1.expect)(firstItalicsText.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(orphanText.textContent).toBe("Orphan Text");
        (0, globals_1.expect)(orphanText.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(secondStrong.textContent).toBe("Strong TextStrong and Italics TextMore Strong Text");
        (0, globals_1.expect)(secondStrong.nodeType).toBe(Node.ELEMENT_NODE);
        (0, globals_1.expect)(secondStrong.tagName).toBe("STRONG");
        (0, globals_1.expect)(secondStrongFirstText.textContent).toBe("Strong Text");
        (0, globals_1.expect)(secondStrongFirstText.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(secondStrongFirstItalics.textContent).toBe("Strong and Italics Text");
        (0, globals_1.expect)(secondStrongFirstItalics.nodeType).toBe(Node.ELEMENT_NODE);
        (0, globals_1.expect)(secondStrongFirstItalics.tagName).toBe("I");
        (0, globals_1.expect)(secondStrongFirstItalicsText.textContent).toBe("Strong and Italics Text");
        (0, globals_1.expect)(secondStrongFirstItalicsText.nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(secondStrongSecondText.textContent).toBe("More Strong Text");
        (0, globals_1.expect)(secondStrongSecondText.nodeType).toBe(Node.TEXT_NODE);
    });
    (0, globals_1.test)("get nodes covering text within strongText", function () {
        const range = new Range();
        range.setStart(firstStrongText, 0);
        range.setEnd(firstStrongText, 11);
        const nodes = (0, checks_1.getRangeChildNodes)(range, htmlAsNode);
        (0, globals_1.expect)(nodes.length).toBe(1);
        (0, globals_1.expect)(nodes[0].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(nodes[0].textContent).toBe("Strong Text");
    });
    (0, globals_1.test)("get nodes covering text across nodes", function () {
        const range = new Range();
        range.setStart(firstStrongText, 7);
        range.setEnd(orphanText, 6);
        (0, globals_1.expect)(range.toString()).toBe("TextItalics TextOrphan");
        const nodes = (0, checks_1.getRangeChildNodes)(range, htmlAsNode);
        (0, globals_1.expect)(nodes[0].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(nodes[1].nodeType).toBe(Node.ELEMENT_NODE);
        (0, globals_1.expect)(nodes[2].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(nodes[3].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(nodes[0]).toBe(firstStrongText);
        (0, globals_1.expect)(nodes[1]).toBe(firstItalics);
        (0, globals_1.expect)(nodes[2]).toBe(firstItalicsText);
        (0, globals_1.expect)(nodes[3]).toBe(orphanText);
        (0, globals_1.expect)(nodes.length).toBe(4);
    });
    (0, globals_1.test)("get nodes when range starts in non-text node", function () {
        const range = new Range();
        range.setStart(containingDiv, 1);
        range.setEnd(orphanText, 6);
        (0, globals_1.expect)(range.toString()).toBe("Italics TextOrphan");
        const nodes = (0, checks_1.getRangeChildNodes)(range, containingDiv);
        (0, globals_1.expect)(nodes[0]).toBe(firstItalics);
        (0, globals_1.expect)(nodes[1]).toBe(firstItalicsText);
        (0, globals_1.expect)(nodes[2]).toBe(orphanText);
        (0, globals_1.expect)(nodes.length).toBe(3);
    });
    (0, globals_1.test)("get nodes when range ends in non-text node", function () {
        const range = new Range();
        range.setStart(containingDiv, 1);
        range.setEnd(containingDiv, 3);
        (0, globals_1.expect)(range.toString()).toBe("Italics TextOrphan Text");
        const nodes = (0, checks_1.getRangeChildNodes)(range, containingDiv);
        (0, globals_1.expect)(nodes[0]).toBe(firstItalics);
        (0, globals_1.expect)(nodes[1]).toBe(firstItalicsText);
        (0, globals_1.expect)(nodes[2]).toBe(orphanText);
        (0, globals_1.expect)(nodes.length).toBe(3);
    });
    (0, globals_1.test)("get nodes when range ends in non-text node 2", function () {
        const range = new Range();
        range.setStart(firstStrongText, 2);
        range.setEnd(containingDiv, 2);
        (0, globals_1.expect)(range.toString()).toBe("rong TextItalics Text");
        const nodes = (0, checks_1.getRangeChildNodes)(range, containingDiv);
        (0, globals_1.expect)(nodes[0]).toBe(firstStrongText);
        (0, globals_1.expect)(nodes[1]).toBe(firstItalics);
        (0, globals_1.expect)(nodes[2]).toBe(firstItalicsText);
        (0, globals_1.expect)(nodes.length).toBe(3);
    });
    // test fails on resetNodes length check, temporarily disabling
    // TODO: fix test or underlying function
    // test("get nodes in propful-only example", function () {
    //   const customHTML = `
    //     <div 
    //       id="portal-container-12345" 
    //       data-button-key="propful-only"
    //     >
    //       <div 
    //         class="MuiBox-root css-1otupa8" 
    //         data-bk="propful-only" data-unbreakable=""
    //       >
    //         <span data-exclude-from-dehydrated="">
    //           ​6​​ ​
    //         </span>
    //         ​Propful Component​
    //       </div>
    //     </div>`.replace(/\n */g, '');
    //   const customHTMLAsNode = new DOMParser()
    //     .parseFromString(customHTML, "text/html")
    //     .body;
    //   const expectedContainingDiv = customHTMLAsNode.childNodes[0];
    //   // confirm correct div
    //   expect(expectedContainingDiv.nodeType).toBe(Node.ELEMENT_NODE);
    //   // type confirmed
    //   const containingDiv = expectedContainingDiv as Element;
    //   expect(containingDiv.tagName).toBe('DIV');
    //   expect(containingDiv.getAttribute('id')).toBe('portal-container-12345');
    //   // set the following range:
    //   /**
    //    * <div 
    //       id="portal-container-12345" 
    //       data-button-key="propful-only"
    //     >
    //       ^
    //       <div 
    //         class="MuiBox-root css-1otupa8" 
    //         data-bk="propful-only" data-unbreakable=""
    //       >
    //         <span data-exclude-from-dehydrated="">
    //            6​ 
    //         </span>
    //          Propful Component​
    //       </div>
    //             ^
    //     </div>`
    //    */
    //   const childrenRange = new Range();
    //   childrenRange.setStart(containingDiv, 0);
    //   childrenRange.setEnd(containingDiv, containingDiv.childNodes.length);
    //   const childrenRangeText = childrenRange.toString();
    //   const expectedString = '​6​​ ​​Propful Component​';
    //   const expectedSpanText = '​6​​ ​';
    //   for (let i = 0; i < childrenRangeText.length; i++) {
    //     expect(childrenRangeText[i]).toBe(expectedString[i]);
    //   }
    //   expect(childrenRangeText.length).toBe(expectedString.length);
    //   expect(childrenRange.toString()).toEqual(expectedString);
    //   const nodes = getRangeChildNodes(childrenRange, customHTMLAsNode);
    //   expect(nodes[0].textContent).toBe(childrenRangeText);
    //   expect(nodes.length).toBe(4);
    //   expect(nodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    //   expect((nodes[0] as Element).className).toBe("MuiBox-root css-1otupa8")
    //   expect(nodes[0].textContent).toBe(expectedString);
    //   expect(nodes[1].nodeType).toBe(Node.ELEMENT_NODE);
    //   expect((nodes[1] as Element).tagName).toBe('SPAN');
    //   expect(nodes[1].textContent).toBe(expectedSpanText);
    //   expect(nodes[2].nodeType).toBe(Node.TEXT_NODE);
    //   expect(nodes[2].textContent).toBe(expectedSpanText);
    //   expect(nodes[3].nodeType).toBe(Node.TEXT_NODE);
    //   expect(nodes[3].textContent).toBe(`​Propful Component​`);
    //   resetRangeToTextNodes(childrenRange);
    //   // expect(childrenRange.toString()).toEqual(expectedString);
    //   const resetNodes = getRangeChildNodes(childrenRange, customHTMLAsNode);
    //   console.log(resetNodes);
    //   expect(resetNodes.length).toBe(3);
    //   // expect(resetNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    //   // expect((resetNodes[0] as Element).className).toBe("MuiBox-root css-1otupa8")
    //   // expect(resetNodes[0].textContent).toBe(`​6​​ ​​Propful Component​`);
    //   expect(resetNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    //   expect((resetNodes[0] as Element).tagName).toBe('SPAN');
    //   expect(resetNodes[0].textContent).toBe(`​6​​ ​`);
    //   expect(resetNodes[2].nodeType).toBe(Node.TEXT_NODE);
    //   expect(resetNodes[2].textContent).toBe(`​6​​ ​`);
    //   expect(resetNodes[3].nodeType).toBe(Node.TEXT_NODE);
    //   expect(resetNodes[3].textContent).toBe(`​Propful Component​`);
    // })
});
(0, globals_1.describe)("test selectionIsCoveredBy", function () {
    (0, globals_1.beforeEach)(() => {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
    (0, globals_1.test)("selection is covered by - 1", function () {
        const limitingContainer = document.querySelector("div");
        const strong = document.querySelector("strong#strong-2");
        const strongText = strong.childNodes[0];
        const secondStrongText = strong.childNodes[2];
        (0, globals_1.expect)(strong).not.toBeNull();
        (0, globals_1.expect)(strongText).not.toBeNull();
        (0, globals_1.expect)(secondStrongText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(strongText, 5, secondStrongText, 5);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong#strong-2", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "i", limitingContainer)).toBe(false);
    });
    (0, globals_1.test)("selection is covered by - 2", function () {
        const limitingContainer = document.querySelector("div");
        const strong = document.querySelector("strong#strong-1");
        const strongText = strong.childNodes[0];
        const italics = document.querySelector("i#italics-1");
        const italicsText = italics.childNodes[0];
        (0, globals_1.expect)(strong).not.toBeNull();
        (0, globals_1.expect)(strongText).not.toBeNull();
        (0, globals_1.expect)(italics).not.toBeNull();
        (0, globals_1.expect)(italicsText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(strongText, 5, italicsText, 5);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "i", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong#strong-1", limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "i#italics-1", limitingContainer)).toBe(false);
    });
});
(0, globals_1.describe)("test selectionIsCoveredBy - alternate HTML", function () {
    (0, globals_1.beforeEach)(function () {
        document.body.innerHTML = test_constants_and_helpers_1.alternateHTML;
    });
    (0, globals_1.test)("selection in range of siblings of same type", function () {
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
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "italics", limitingContainer)).toBe(false);
    });
    (0, globals_1.test)("range of siblings contains element children", function () {
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const fourthStrong = document.querySelector("strong:nth-of-type(4)");
        const fifthStrong = document.querySelector("strong:nth-of-type(5)");
        (0, globals_1.expect)(fourthStrong).not.toBeNull();
        (0, globals_1.expect)(fifthStrong).not.toBeNull();
        const fourthStrongText = fourthStrong.childNodes[0];
        const fifthStrongText = fifthStrong.childNodes[0];
        (0, globals_1.expect)(fourthStrongText).not.toBeNull();
        (0, globals_1.expect)(fifthStrongText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(fourthStrongText, 7, fifthStrongText, 4);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "strong", limitingContainer)).toBe(true);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, "italics", limitingContainer)).toBe(false);
    });
    (0, globals_1.test)("range set within element", function () {
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const firstStrong = document.querySelector("strong:nth-of-type(1)");
        (0, globals_1.expect)(firstStrong).not.toBeNull();
        const firstStrongText = firstStrong.childNodes[0];
        (0, globals_1.expect)(firstStrongText).not.toBeNull();
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(firstStrongText, 3, firstStrongText, 8);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, 'strong', limitingContainer)).toBe(true);
    });
    (0, globals_1.test)("across siblings which are not of same type", function () {
        const limitingContainer = document.querySelector("div");
        (0, globals_1.expect)(limitingContainer).not.toBeNull();
        const fourthStrong = document.querySelector("strong:nth-of-type(4)");
        const sixthStrong = document.querySelector("strong:nth-of-type(6)");
        (0, globals_1.expect)(fourthStrong).not.toBeNull();
        (0, globals_1.expect)(sixthStrong).not.toBeNull();
        const fourthStrongText = fourthStrong.childNodes[0];
        const sixthStrongText = sixthStrong.childNodes[0];
        (0, globals_1.expect)(fourthStrongText).not.toBeNull();
        (0, globals_1.expect)(sixthStrongText).not.toBeNull();
        (0, globals_1.expect)(sixthStrongText.textContent).toBe("Sixth Strong Text");
        const selection = window.getSelection();
        selection === null || selection === void 0 ? void 0 : selection.setBaseAndExtent(fourthStrongText, 4, sixthStrongText, 10);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, 'strong', limitingContainer)).toBe(false);
        (0, globals_1.expect)((0, checks_1.selectionIsCoveredBy)(selection, 'i', limitingContainer)).toBe(false);
    });
});
(0, globals_1.describe)("test selectionHasTextNodes", function () {
    // TODO
});
(0, globals_1.describe)("test selectionContainsOnlyText", function () {
    // TODO
});
(0, globals_1.describe)("test selectionContainsNoUnbreakables", function () {
    // TODO
});
(0, globals_1.describe)("test getButtonStatus", function () {
    // TODO
});
(0, globals_1.describe)("test getAllTextNodes", function () {
    // TODO
});
(0, globals_1.describe)("test getLastValidTextNode", function () {
    // TODO
});
(0, globals_1.describe)("test getLastValidCharacterIndex", function () {
    (0, globals_1.test)("given text node with all valid characters, returns length", function () {
        const textNode = new Text("abcde abcdefghijk");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(textNode.textContent.length);
    });
    (0, globals_1.test)("given text node with all valid characters when last character is space, returns length", function () {
        const textNode = new Text("abcde abcdefghijk  ");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(textNode.textContent.length);
    });
    (0, globals_1.test)("given text node with invalid character at end, returns length-1", function () {
        const textNode = new Text("abcde abcdefghijk  \u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(textNode.textContent.length - 1);
    });
    (0, globals_1.test)("edge case, empty cushion", function () {
        const textNode = new Text("\u200B\u200B\u200B\u200B\u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(1);
    });
    (0, globals_1.test)("edge case, single zero-width space", function () {
        const textNode = new Text("\u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(1);
    });
    (0, globals_1.test)("edge case, empty text", function () {
        const textNode = new Text("");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(0);
    });
    (0, globals_1.test)("edge case, no text", function () {
        const textNode = new Text();
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(0);
    });
});
(0, globals_1.describe)("test getLastValidCharacterIndex with max offset", function () {
    (0, globals_1.test)("given text node with all valid characters and maxOffset, returns maxOffset", function () {
        const textNode = new Text("abcde abcdefghijk");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 8)).toBe(8);
    });
    (0, globals_1.test)("given text node with invalid characters up to maxOffset, returns 0", function () {
        const textNode = new Text("\u200B\u200B\u200Babcde abcdefghijk");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 2)).toBe(0);
    });
    (0, globals_1.test)("given text node with invalid characters short of maxOffset, returns maxOffset", function () {
        const textNode = new Text("\u200B\u200B\u200Babcde abcdefghijk");
        (0, globals_1.expect)(textNode.textContent[3]).toBe("a");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 3)).toBe(3);
    });
    (0, globals_1.test)("given text node with maxOffset greater than content length, returns content length, indicating cursor can be placed at end of text", function () {
        const textNode = new Text("abcde abcdefghijk");
        const textLength = textNode.textContent.length;
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 100)).toBe(textLength);
    });
    (0, globals_1.test)("returns correct index if maxOffset is on or after zero-width space", function () {
        const textNode = new Text("abcde \u200B\u200Babcde");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 6)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 7)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, true, 8)).toBe(8);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 6)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 7)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 8)).toBe(8);
    });
});
(0, globals_1.describe)("test getLastValidCharacterIndex with acceptEmptyCushions as false", function () {
    (0, globals_1.test)("returns -1 on empty cushioned node", function () {
        const textNode = new Text("\u200B\u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(-1);
    });
    (0, globals_1.test)("returns -1 on node with only one character, zero-width", function () {
        const textNode = new Text("\u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(-1);
    });
    (0, globals_1.test)("returns -1 on node with empty string", function () {
        const textNode = new Text("");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(-1);
    });
    (0, globals_1.test)("returns -1 on node with no content", function () {
        const textNode = new Text();
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(-1);
    });
    (0, globals_1.test)("returns -1 when only zero-width-spaces up to maxOffset", function () {
        const textNode = new Text("\u200B\u200B abcde");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 1)).toBe(-1);
    });
    (0, globals_1.test)("returns correct index if maxOffset is on or after zero-width space", function () {
        const textNode = new Text("abcde \u200B\u200Babcde");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 6)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 7)).toBe(6);
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 8)).toBe(8);
    });
    // repeat prior tests with acceptEmptyCushionNodes set to false
    // first suite
    (0, globals_1.test)("given text node with all valid characters, returns length", function () {
        const textNode = new Text("abcde abcdefghijk");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(textNode.textContent.length);
    });
    (0, globals_1.test)("given text node with all valid characters when last character is space, returns length", function () {
        const textNode = new Text("abcde abcdefghijk  ");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(textNode.textContent.length);
    });
    (0, globals_1.test)("given text node with invalid character at end, returns length-1", function () {
        const textNode = new Text("abcde abcdefghijk  \u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false)).toBe(textNode.textContent.length - 1);
    });
    (0, globals_1.test)("edge case, single zero-width space", function () {
        const textNode = new Text("\u200B");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode)).toBe(1);
    });
    // second suite
    (0, globals_1.test)("given text node with all valid characters and maxOffset, returns maxOffset", function () {
        const textNode = new Text("abcde abcdefghijk");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 8)).toBe(8);
    });
    (0, globals_1.test)("given text node with invalid characters short of maxOffset, returns maxOffset", function () {
        const textNode = new Text("\u200B\u200B\u200Babcde abcdefghijk");
        (0, globals_1.expect)(textNode.textContent[3]).toBe("a");
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 3)).toBe(3);
    });
    (0, globals_1.test)("given text node with maxOffset greater than content length, returns content length, indicating cursor can be placed at end of text node", function () {
        const textNode = new Text("abcde abcdefghijk");
        const textLength = textNode.textContent.length;
        (0, globals_1.expect)((0, checks_1.getLastValidCharacterIndex)(textNode, false, 100)).toBe(textLength);
    });
});
(0, globals_1.describe)("test areUninterruptedSiblingTextNodes", function () {
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
    const secondStrongBreak = document.createElement("br");
    const secondStrongThirdText = new Text("\u200B\u200B");
    const secondStrongFourthText = new Text("\u200B  test \u200B hello\u200B\u200B   \u200B");
    secondStrong.append(secondStrongFirstText);
    secondStrong.append(secondStrongSecondText);
    secondStrong.append(secondStrongBreak);
    secondStrong.append(secondStrongThirdText);
    secondStrong.append(secondStrongFourthText);
    beforeAll(function () {
        document.body.innerHTML = '';
        document.body.append(LC);
    });
    (0, globals_1.test)("correctly identify uninterrupted siblings", function () {
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFirstText, secondStrongSecondText)).toBe(true);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongThirdText, secondStrongFourthText)).toBe(true);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(rootFirstTextNode, rootSecondTextNode)).toBe(true);
        // test in reverse order
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongSecondText, secondStrongFirstText)).toBe(true);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFourthText, secondStrongThirdText)).toBe(true);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(rootSecondTextNode, rootFirstTextNode)).toBe(true);
    });
    (0, globals_1.test)("correctly identify when siblings are interrupted", function () {
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFirstText, secondStrongThirdText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFirstText, secondStrongFourthText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongSecondText, secondStrongThirdText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongSecondText, secondStrongFourthText)).toBe(false);
        // test in reverse order
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongThirdText, secondStrongFirstText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFourthText, secondStrongFirstText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongThirdText, secondStrongSecondText)).toBe(false);
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongFourthText, secondStrongSecondText)).toBe(false);
    });
    (0, globals_1.test)("reject on non-text node", function () {
        const typeBrokenBreak = secondStrongBreak;
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(secondStrongSecondText, typeBrokenBreak)).toBe(false);
        // test in reverse order
        (0, globals_1.expect)((0, checks_1.areUninterruptedSiblingTextNodes)(typeBrokenBreak, secondStrongSecondText)).toBe(false);
    });
    afterAll(function () {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
});
(0, globals_1.describe)("test getIsReactComponent", function () {
    // TODO
});
(0, globals_1.describe)("test textNodeIsCushioned", function () {
    // TODO
});
(0, globals_1.describe)("test identifyBadTextNodes", function () {
    // TODO
});
(0, globals_1.describe)("test getReMatch", function () {
    const testString = "loolooloolloooooool";
    (0, globals_1.test)("getReMatch gives correct match on unconstrained search", function () {
        let match = (0, checks_1.getReMatch)(testString, "ooll", 0, testString.length, false);
        (0, globals_1.expect)(match).toBeTruthy();
        (0, globals_1.expect)(match.index).toBe(7);
    });
    (0, globals_1.test)("getReMatch gives correct match with starting position", function () {
        let match = (0, checks_1.getReMatch)(testString, "ool", 5, testString.length, false);
        (0, globals_1.expect)(match).toBeTruthy();
        (0, globals_1.expect)(match.index).toBe(7);
        match = (0, checks_1.getReMatch)(testString, "ool", 7, testString.length, false);
        (0, globals_1.expect)(match).toBeTruthy();
        (0, globals_1.expect)(match.index).toBe(7);
    });
    (0, globals_1.test)("getReMatch gives correct match with getLast", function () {
        let match = (0, checks_1.getReMatch)(testString, "ol", 5, testString.length, true);
        (0, globals_1.expect)(match).toBeTruthy();
        (0, globals_1.expect)(match.index).toBe(testString.length - 2);
    });
    (0, globals_1.test)("getReMatch gives correct match with getLast and endOffset", function () {
        let match = (0, checks_1.getReMatch)(testString, "o", 5, testString.length - 3, true);
        (0, globals_1.expect)(match).toBeTruthy();
        (0, globals_1.expect)(match.index).toBe(testString.length - 3);
    });
    (0, globals_1.test)("getReMatch returns null when not found", function () {
        let match = (0, checks_1.getReMatch)(testString, "x", 5, testString.length, true);
        (0, globals_1.expect)(match).not.toBeTruthy();
    });
});
(0, globals_1.describe)("test searchCombinedText", function () {
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
    const secondStrongThirdText = new Text("\u200B\u200B");
    const secondStrongFourthText = new Text("\u200B  test \u200B hello\u200B\u200B   \u200B");
    secondStrong.append(secondStrongFirstText);
    secondStrong.append(secondStrongSecondText);
    secondStrong.append(secondStrongThirdText);
    secondStrong.append(secondStrongFourthText);
    beforeAll(function () {
        document.body.innerHTML = '';
        document.body.append(LC);
    });
    /**
     * Reference for all text nodes:
     * strongText             - "\u200BStrong Text\u200B"
     * rootFirstTextNode      - "\u200B This is text after strong\u200B"
     * rootSecondTextNode     - "\u200B This is more text\u200B"
     * secondStrongFirstText  - ""
     * secondStrongSecondText - "abc\u200B"
     * secondStrongThirdText  - "\u200B\u200B"
     * secondStrongFourthText - "\u200B  test \u200B hello\u200B\u200B   \u200B"
     */
    (0, globals_1.test)("make sure combined text is what it's supposed to be", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        (0, globals_1.expect)(textNodes.length).toBe(7);
        const combinedText = textNodes.map(tn => tn.textContent).join("");
        (0, globals_1.expect)(combinedText).toBe("\u200BStrong Text\u200B\u200B This is text after strong\u200B\u200B This is more text\u200Babc\u200B\u200B\u200B\u200B  test \u200B hello\u200B\u200B   \u200B");
    });
    (0, globals_1.test)("returns correct node and index with only required properties", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "Strong Text" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: " Text" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(7);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(12);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "i" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(4);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "strong" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(21);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "more text" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(10);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "abc\u200B" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "[^\u200B]{3}[\u200B]{3}" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B{3} " });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongThirdText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B   \u200B" });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(16);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B \u200B\u200B" });
        (0, globals_1.expect)(result).toBe(null);
    });
    (0, globals_1.test)("returns correct node and index with returnAfterMatch: true", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "Strong Text", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(12);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: " Text", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(12);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "i", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(5);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "strong", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(27);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "more text", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(19);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "abc\u200B", returnAfterMatch: true, getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(4);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "[^\u200B]{3}[\u200B]{3}", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongThirdText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(2);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B{3} ", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(2);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B   \u200B", returnAfterMatch: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(21);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B \u200B\u200B", returnAfterMatch: true });
        (0, globals_1.expect)(result).toBe(null);
    });
    (0, globals_1.test)("returns correct node and index with returnIndexOffset", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "Strong Text", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(3);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: " Text", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(9);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "i", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(6);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "strong", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(23);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "more text", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(12);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "abc\u200B", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(2);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "[^\u200B]{3}[\u200B]{3}", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(2);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B{3} ", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongThirdText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(2);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B   \u200B", returnIndexOffset: 2 });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(18);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B \u200B\u200B", returnIndexOffset: 2 });
        (0, globals_1.expect)(result).toBe(null);
    });
    (0, globals_1.test)("returns correct node and index using getLast", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "Strong Text", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: " Text", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(7);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(15);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "i", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(7);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "strong", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(21);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "more text", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(10);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "abc\u200B", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "[^\u200B]{3}[\u200B]{3}", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongSecondText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B{3} ", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongThirdText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B   \u200B", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(16);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "\u200B\u200B \u200B\u200B", getLast: true });
        (0, globals_1.expect)(result).toBe(null);
        result = (0, checks_1.searchCombinedText)({ textNodes, reSource: "e", getLast: true });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(11);
    });
    (0, globals_1.test)("returns correct node and index with startFrom", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "Strong Text", startFrom: {
                textNode: strongText,
                nodeOffset: 0
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: " Text", startFrom: {
                textNode: strongText,
                nodeOffset: 0
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(7);
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: " This is", startFrom: {
                textNode: rootFirstTextNode,
                nodeOffset: 1
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootFirstTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: " This is", startFrom: {
                textNode: rootFirstTextNode,
                nodeOffset: 2
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(rootSecondTextNode);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "  ", startFrom: {
                textNode: secondStrongFourthText,
                nodeOffset: 2
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(17);
        // returns null on invalid text node
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "\u200B", startFrom: {
                textNode: new Text("\u200B"),
                nodeOffset: 0
            }
        });
        (0, globals_1.expect)(result).toBe(null);
    });
    (0, globals_1.test)("returns correct node and index with upTo", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "Strong Text", upTo: {
                textNode: rootSecondTextNode,
                nodeOffset: 0
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(1);
        // return null when upTo boundary is set before occurrence of text
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: " Text", upTo: {
                textNode: strongText,
                nodeOffset: 6
            }
        });
        (0, globals_1.expect)(result).toBe(null);
        // return when upTo boundary is right at end of sought pattern
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: " Text", upTo: {
                textNode: strongText,
                nodeOffset: 7
            }
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(strongText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(7);
        // returns null on invalid text node
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "\u200B", upTo: {
                textNode: new Text("\u200B"),
                nodeOffset: 0
            }
        });
        (0, globals_1.expect)(result).toBe(null);
        // returns null on offset long than length of text node
        result = (0, checks_1.searchCombinedText)({
            textNodes, reSource: "\u200B", upTo: {
                textNode: strongText,
                nodeOffset: 14
            }
        });
        (0, globals_1.expect)(result).toBe(null);
    });
    (0, globals_1.test)("get correct offset with all properties populated", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        let result = (0, checks_1.searchCombinedText)({
            textNodes,
            reSource: "\u200B",
            startFrom: {
                textNode: rootSecondTextNode,
                nodeOffset: 9
            },
            upTo: {
                textNode: secondStrongFourthText,
                nodeOffset: 5
            },
            getLast: true
        });
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.currentNode).toBe(secondStrongFourthText);
        (0, globals_1.expect)(result === null || result === void 0 ? void 0 : result.offset).toBe(0);
    });
});
(0, globals_1.describe)("test getNextLeftEndpoint", function () {
    // TODO
});
(0, globals_1.describe)("test getNextRightEndpoint", function () {
    // TODO
});
(0, globals_1.describe)("getNextPosition", function () {
    // const htmlAsNode = new DOMParser()
    //   .parseFromString(startingHTML, "text/html").body;
    // const containingDiv = htmlAsNode.childNodes[0];
    // const firstStrong = containingDiv.childNodes[0];
    // const firstStrongText = firstStrong.childNodes[0];
    // const firstItalics = containingDiv.childNodes[1];
    // const firstItalicsText = firstItalics.childNodes[0];
    // const orphanText = containingDiv.childNodes[2];
    // const secondStrong = containingDiv.childNodes[3];
    // const secondStrongFirstText = secondStrong.childNodes[0];
    // const secondStrongFirstItalics = secondStrong.childNodes[1];
    // const secondStrongFirstItalicsText = secondStrongFirstItalics.childNodes[0];
    // const secondStrongSecondText = secondStrong.childNodes[2];
    /**
     * Should be
     * <div>
     *  ""
     *  "Second text"
     *  <br/>
     *  "Third raw text."
     *  <u>
     *    "First Underline First Text. "
     *    "First Underline Second Text."
     *  </u>
     *  <br/>
     *  <strong>
     *    "First Strong First Text."
     *    " First Strong Second Text."
     *    <br/>
     *    <br/>
     *    <i>
     *      <br/>
     *      ""
     *      <br/>
     *      ""
     *      <br/>
     *    </i>
     *    "First Strong Third Text"
     *  </strong>
     *  <br/>
     *  ""
     *  "Fifth raw text."
     * </div>
     */
    // clear out body
    document.body.innerHTML = '';
    const containingDiv = document.createElement('div');
    document.body.appendChild(containingDiv);
    const firstRawText = new Text();
    containingDiv.appendChild(firstRawText);
    const secondRawText = new Text("Second text");
    containingDiv.appendChild(secondRawText);
    const firstRawBreak = document.createElement("br");
    containingDiv.append(firstRawBreak);
    const thirdRawText = new Text("Third raw text.");
    containingDiv.appendChild(thirdRawText);
    const firstUnderline = document.createElement("u");
    containingDiv.appendChild(firstUnderline);
    const firstUnderlineFirstText = new Text("First Underline First Text. ");
    firstUnderline.appendChild(firstUnderlineFirstText);
    const firstUnderlineSecondText = new Text("First Underline Second Text.");
    firstUnderline.appendChild(firstUnderlineSecondText);
    const secondRawBreak = document.createElement("break");
    containingDiv.appendChild(secondRawBreak);
    const firstStrong = document.createElement("strong");
    containingDiv.appendChild(firstStrong);
    const firstStrongFirstText = new Text("First Strong First Text.");
    firstStrong.appendChild(firstStrongFirstText);
    const firstStrongSecondText = new Text(" First Strong Second Text.");
    firstStrong.appendChild(firstStrongSecondText);
    const firstStrongFirstBreak = document.createElement("br");
    firstStrong.appendChild(firstStrongFirstBreak);
    const firstStrongSecondBreak = document.createElement("br");
    firstStrong.appendChild(firstStrongSecondBreak);
    const firstStrongFirstItalics = document.createElement("i");
    firstStrong.appendChild(firstStrongFirstItalics);
    const firstStrongFirstItalicsFirstBreak = document.createElement("br");
    firstStrongFirstItalics.appendChild(firstStrongFirstItalicsFirstBreak);
    const firstStrongFirstItalicsFirstText = new Text();
    firstStrongFirstItalics.appendChild(firstStrongFirstItalicsFirstText);
    const firstStrongFirstItalicsSecondBreak = document.createElement("br");
    firstStrongFirstItalics.appendChild(firstStrongFirstItalicsSecondBreak);
    const firstStrongFirstItalicsSecondText = new Text();
    firstStrongFirstItalics.appendChild(firstStrongFirstItalicsSecondText);
    const firstStrongFirstItalicsThirdBreak = document.createElement("br");
    firstStrongFirstItalics.appendChild(firstStrongFirstItalicsThirdBreak);
    const firstStrongThirdText = new Text("First Strong Third Text");
    firstStrong.appendChild(firstStrongThirdText);
    const thirdRawBreak = document.createElement("br");
    containingDiv.appendChild(thirdRawBreak);
    const fourthRawText = new Text();
    containingDiv.appendChild(fourthRawText);
    const fifthRawText = new Text("Fifth raw text.");
    containingDiv.appendChild(fifthRawText);
    (0, globals_1.test)("everything in its right place", function () {
        // expect(containingDiv.childNodes.length).toBe(8);
        (0, globals_1.expect)(containingDiv.childNodes[0]).toBe(firstRawText);
        (0, globals_1.expect)(containingDiv.childNodes[1]).toBe(secondRawText);
        (0, globals_1.expect)(containingDiv.childNodes[2]).toBe(firstRawBreak);
        (0, globals_1.expect)(containingDiv.childNodes[3]).toBe(thirdRawText);
        (0, globals_1.expect)(containingDiv.childNodes[4]).toBe(firstUnderline);
        (0, globals_1.expect)(containingDiv.childNodes[5]).toBe(secondRawBreak);
        (0, globals_1.expect)(containingDiv.childNodes[6]).toBe(firstStrong);
        (0, globals_1.expect)(containingDiv.childNodes[7]).toBe(thirdRawBreak);
        (0, globals_1.expect)(containingDiv.childNodes[8]).toBe(fourthRawText);
        (0, globals_1.expect)(containingDiv.childNodes[9]).toBe(fifthRawText);
        (0, globals_1.expect)(firstUnderline.childNodes.length).toBe(2);
        (0, globals_1.expect)(firstUnderline.childNodes[0]).toBe(firstUnderlineFirstText);
        (0, globals_1.expect)(firstUnderline.childNodes[1]).toBe(firstUnderlineSecondText);
        (0, globals_1.expect)(firstStrong.childNodes.length).toBe(6);
        (0, globals_1.expect)(firstStrong.childNodes[0]).toBe(firstStrongFirstText);
        (0, globals_1.expect)(firstStrong.childNodes[1]).toBe(firstStrongSecondText);
        (0, globals_1.expect)(firstStrong.childNodes[2]).toBe(firstStrongFirstBreak);
        (0, globals_1.expect)(firstStrong.childNodes[3]).toBe(firstStrongSecondBreak);
        (0, globals_1.expect)(firstStrong.childNodes[4]).toBe(firstStrongFirstItalics);
        (0, globals_1.expect)(firstStrong.childNodes[5]).toBe(firstStrongThirdText);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes.length).toBe(5);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes[0]).toBe(firstStrongFirstItalicsFirstBreak);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes[1]).toBe(firstStrongFirstItalicsFirstText);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes[2]).toBe(firstStrongFirstItalicsSecondBreak);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes[3]).toBe(firstStrongFirstItalicsSecondText);
        (0, globals_1.expect)(firstStrongFirstItalics.childNodes[4]).toBe(firstStrongFirstItalicsThirdBreak);
    });
    // type narrowing
    (0, globals_1.beforeEach)(function () {
        if (!(firstStrongFirstText instanceof Text))
            fail();
        if (!(firstStrongSecondText instanceof Text))
            fail();
    });
    (0, globals_1.test)("simple move left within text node", function () {
        const result = (0, checks_1.getNextPosition)(firstStrongFirstText, 7, containingDiv, "left", ".", false, 0, true, true);
        if (!result)
            fail();
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongFirstText);
        (0, globals_1.expect)(result.offset).toBe(6);
    });
    (0, globals_1.test)("simple move right within text node", function () {
        const result = (0, checks_1.getNextPosition)(firstStrongFirstText, 7, containingDiv, "right", ".", false, 0, true, true);
        if (!result)
            throw new Error("no result");
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongFirstText);
        (0, globals_1.expect)(result.offset).toBe(8);
    });
    (0, globals_1.test)("simple move left across text nodes", function () {
        if (firstStrongFirstText.textContent === null)
            throw new Error("firstStrongFirstText.textContent === null");
        const result = (0, checks_1.getNextPosition)(firstStrongSecondText, 0, containingDiv, "left", ".", false, 0, true, true);
        if (!result)
            fail();
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongFirstText);
        (0, globals_1.expect)(result.offset).toBe(firstStrongFirstText.textContent.length - 1);
    });
    (0, globals_1.test)("simple move right across text nodes", function () {
        if (firstStrongFirstText.textContent === null)
            throw new Error("firstStrongFirstText textContent is null");
        // console.log(firstStrongFirstText.textContent, firstStrongFirstText.textContent.length);
        const result = (0, checks_1.getNextPosition)(firstStrongFirstText, firstStrongFirstText.textContent.length, containingDiv, "right", ".", false, 0, true, true);
        if (!result)
            throw new Error("no result or result is null");
        // console.log(result);
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongSecondText);
        (0, globals_1.expect)(result.offset).toBe(1);
    });
    (0, globals_1.test)("move left and stop on break", function () {
        const result = (0, checks_1.getNextPosition)(firstStrongFirstItalicsSecondText, 0, containingDiv, "left", ".", false, 0, false, true);
        if (!result)
            throw new Error("result is null");
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongFirstItalicsFirstText);
        (0, globals_1.expect)(result.offset).toBe(1);
        // make sure node is cushioned as result of this or earlier operation
        (0, globals_1.expect)(result.currentNode.textContent).toBe("\u200B\u200B");
    });
    (0, globals_1.test)("move right and stop on break", function () {
        const result = (0, checks_1.getNextPosition)(firstStrongFirstItalicsFirstText, 1, containingDiv, "right", ".", false, 0, false, true);
        if (!result)
            throw new Error("result is null");
        (0, globals_1.expect)(result.currentNode).toBe(firstStrongFirstItalicsSecondText);
        (0, globals_1.expect)(result.offset).toBe(1);
        // make sure node is cushioned as result of this or earlier operation
        (0, globals_1.expect)(result.currentNode.textContent).toBe("\u200B\u200B");
    });
    (0, globals_1.test)("move left and stop on reset on sibling interruption", function () {
        // move by just one in overall text
        const firstResult = (0, checks_1.getNextPosition)(firstUnderlineFirstText, 0, containingDiv, "left", ".", false, 0, true, false);
        if (!firstResult)
            throw new Error("result is null");
        (0, globals_1.expect)(firstResult.currentNode).toBe(thirdRawText);
        (0, globals_1.expect)(firstResult.offset).toBe(thirdRawText.textContent.length - 1);
        // move by regex which intentionally will not fit the first interrupted-sibling text node
        const secondResult = (0, checks_1.getNextPosition)(firstUnderlineSecondText, 9, containingDiv, "left", "Second text", false, 0, true, false);
        if (!secondResult)
            throw new Error("result is null");
        (0, globals_1.expect)(secondResult.currentNode).toBe(thirdRawText);
        (0, globals_1.expect)(secondResult.offset).toBe(thirdRawText.textContent.length - 1);
    });
    (0, globals_1.test)("move right and stop on reset on sibling interruption", function () {
        // move by just one in overall text
        const firstResult = (0, checks_1.getNextPosition)(thirdRawText, thirdRawText.textContent.length - 1, containingDiv, "right", ".", false, 0, true, false);
        if (!firstResult)
            throw new Error("result is null");
        (0, globals_1.expect)(firstResult.currentNode).toBe(firstUnderlineFirstText);
        (0, globals_1.expect)(firstResult.offset).toBe(1);
        // move by regex which intentionally will not fit the first interrupted-sibling text node
        const secondResult = (0, checks_1.getNextPosition)(thirdRawText, 5, containingDiv, "right", "Strong Third", false, 0, true, false);
        if (!secondResult)
            throw new Error("result is null");
        (0, globals_1.expect)(secondResult.currentNode).toBe(firstUnderlineFirstText);
        (0, globals_1.expect)(secondResult.offset).toBe(1);
    });
});
