"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
const globals_1 = require("@jest/globals");
const unused_utils_1 = require("../unused_utils/unused_utils");
const test_constants_and_helpers_1 = require("./test_constants_and_helpers");
const checks_1 = require("../src/utils/checks");
function experimentalMoveAndCompareSelectionCheckText(selection, limitingContainer, moveDirection, expAnchorNode, expAnchorOffset, character) {
    (0, unused_utils_1.experimental_moveSelection)(selection, limitingContainer, moveDirection);
    (0, globals_1.expect)(selection === null || selection === void 0 ? void 0 : selection.anchorNode).toBe(expAnchorNode);
    (0, globals_1.expect)(selection === null || selection === void 0 ? void 0 : selection.anchorOffset).toBe(expAnchorOffset);
    if (character)
        (0, globals_1.expect)(selection === null || selection === void 0 ? void 0 : selection.anchorNode.textContent[selection.anchorOffset]).toBe(character);
}
// using experimental_moveSelection
(0, globals_1.describe)("test experimental_moveSelection", function () {
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
    (0, globals_1.test)("confirm all nodes are what and where they should be", function () {
        const textNodes = (0, checks_1.getAllTextNodes)([LC]);
        (0, globals_1.expect)(textNodes.length).toBe(7);
        const totalTextContent = "\u200BStrong Text\u200B\u200B This is text after strong\u200B\u200B This is more text\u200Babc\u200B\u200B\u200B\u200B  test \u200B hello\u200B\u200B   \u200B";
        (0, globals_1.expect)(textNodes.map(tn => tn.textContent).join("")).toBe(totalTextContent);
        (0, globals_1.expect)(LC.textContent).toBe(totalTextContent);
        (0, globals_1.expect)(LC.childNodes.length).toBe(4);
        (0, globals_1.expect)(LC.childNodes[0].nodeName).toBe("STRONG");
        (0, globals_1.expect)(LC.childNodes[0].childNodes.length).toBe(1);
        (0, globals_1.expect)(LC.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(LC.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
        (0, globals_1.expect)(LC.childNodes[3].nodeName).toBe("STRONG");
        (0, globals_1.expect)(LC.childNodes.length).toBe(4);
    });
    (0, globals_1.test)("move selection left", function () {
        const selection = window.getSelection();
        (0, globals_1.expect)(secondStrongFourthText.textContent.length).toBe(21);
        (0, globals_1.expect)(secondStrongFourthText);
        // set after final character (zero-width space) in last text node
        selection.setBaseAndExtent(secondStrongFourthText, 21, secondStrongFourthText, 21);
        (0, test_constants_and_helpers_1.compareSelection)(selection, secondStrongFourthText, 21, secondStrongFourthText, 21);
        // should skip 1 zero-width space
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 19, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 18, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 17, " ");
        // next move should skip two zero-width spaces
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 14, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 13, "l");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 12, "l");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 11, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 10, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 9, " ");
        // next move should skip one zero-width space
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 7, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 6, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 4, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 3, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 2, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongFourthText, 1, " ");
        // going to prior text node, should skip node entirely as it is a direct sibling without valid characters, go to secondStrongSecondText
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongSecondText, 2, "c");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongSecondText, 1, "b");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", secondStrongSecondText, 0, "a");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 19, "\u200B");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 18, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 17, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 16, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 15, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 14, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 13, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 12, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 11, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 10, "m");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 9, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 8, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 7, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 6, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 4, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 3, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 2, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootSecondTextNode, 1, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 26, "g");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 25, "n");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 24, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 23, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 22, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 21, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 20, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 19, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 18, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 17, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 16, "f");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 15, "a");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 14, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 13, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 12, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 11, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 10, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 9, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 8, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 7, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 6, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 4, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 3, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 2, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", rootFirstTextNode, 1, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 12, "\u200B");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 11, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 10, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 9, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 8, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 7, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 6, "g");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 5, "n");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 4, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 3, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 2, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 1, "S");
        // Nowhere else to go, should stay in place
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "left", strongText, 1, "S");
    });
    (0, globals_1.test)("move selection right", function () {
        const selection = window.getSelection();
        // set before first 
        selection.setBaseAndExtent(strongText, 1, strongText, 1);
        (0, test_constants_and_helpers_1.compareSelection)(selection, strongText, 1, strongText, 1);
        (0, test_constants_and_helpers_1.checkText)(selection, "S");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 2, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 3, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 4, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 5, "n");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 6, "g");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 7, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 8, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 9, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 10, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 11, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", strongText, 12, "\u200B");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 1, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 2, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 3, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 4, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 6, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 7, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 8, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 9, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 10, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 11, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 12, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 13, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 14, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 15, "a");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 16, "f");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 17, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 18, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 19, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 20, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 21, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 22, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 23, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 24, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 25, "n");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 26, "g");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootFirstTextNode, 27, "\u200B");
        // rootSecondTextNode - "\u200B This is more text\u200B"
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 2, "T");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 3, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 4, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 6, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 7, "i");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 8, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 9, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 10, "m");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 11, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 12, "r");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 13, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 14, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 15, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 16, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 17, "x");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 18, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", rootSecondTextNode, 19, "\u200B");
        // go into empty text node because it is not a sibling
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFirstText, 0, undefined);
        // secondStrongSecondText "abc\u200B", should skip first character due to being siblings
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongSecondText, 1, "b");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongSecondText, 2, "c");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongSecondText, 3, "\u200B");
        // skip secondStrongThirdText because it is empty and a sibling
        // secondStrongFourthText "\u200B  test \u200B hello\u200B\u200B   \u200B", skip first space, only zws in between last position and space
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 2, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 3, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 4, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 5, "s");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 6, "t");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 7, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 8, "\u200B");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 10, "h");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 11, "e");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 12, "l");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 13, "l");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 14, "o");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 15, "\u200B");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 18, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 19, " ");
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 20, "\u200B");
        // moving right again should have no effect
        experimentalMoveAndCompareSelectionCheckText(selection, LC, "right", secondStrongFourthText, 20, "\u200B");
    });
    afterAll(function () {
        document.body.innerHTML = test_constants_and_helpers_1.startingHTML;
    });
});
(0, globals_1.describe)("test setSelection", function () {
    (0, globals_1.test)("set Selection on text inside italics node", function () {
        const italics = document.querySelector("i");
        (0, globals_1.expect)(italics).not.toBeNull();
        const selection = (0, unused_utils_1.setSelection)(italics, 0, italics, italics.childNodes.length);
        (0, globals_1.expect)(selection === null || selection === void 0 ? void 0 : selection.toString()).toEqual(italics.textContent);
    });
    (0, globals_1.test)("set Selection on limited text inside italics node", function () {
        var _a;
        const italics = document.querySelector("i#italics-2");
        (0, globals_1.expect)(italics).not.toBeNull();
        const italicsText = italics.childNodes[0];
        const selection = (0, unused_utils_1.setSelection)(italicsText, 7, italicsText, 18);
        const range = new Range();
        range.setStart(italicsText, 7);
        range.setEnd(italicsText, 18);
        range.setStart(italicsText, 0);
        range.setEnd(italicsText, 7);
        (0, globals_1.expect)(selection).not.toBeNull();
        (0, globals_1.expect)((_a = selection.anchorNode) === null || _a === void 0 ? void 0 : _a.nodeName).toBe("#text");
        (0, globals_1.expect)(selection.anchorNode).toBe(selection.focusNode);
        (0, globals_1.expect)(selection.toString()).toEqual("and Italics");
    });
});
