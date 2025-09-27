"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditableContent;
var react_1 = require("react");
var EditableContentContext_1 = require("./EditableContentContext");
var selection_movements_1 = require("./utils/selection_movements");
var checks_1 = require("./utils/checks");
var dom_operations_1 = require("./utils/dom_operations");
function EditableContent(_a) {
    var className = _a.className, disableNewLines = _a.disableNewLines;
    var _b = (0, EditableContentContext_1.useEditableContentContext)(), contextInstanceIdRef = _b.contextInstanceIdRef, contentRef = _b.contentRef, setContentRefCurrentInnerHTML = _b.setContentRefCurrentInnerHTML, hasSelection = _b.hasSelection, setHasSelection = _b.setHasSelection, portals = _b.portals, setPortals = _b.setPortals, divToSetSelectionTo = _b.divToSetSelectionTo, setDivToSetSelectionTo = _b.setDivToSetSelectionTo, appendPortalToDiv = _b.appendPortalToDiv, updateSelection = _b.updateSelection, updateContent = _b.updateContent, dehydratedHTML = _b.dehydratedHTML, resetPortalContainers = _b.resetPortalContainers, assignContentRef = _b.assignContentRef;
    var _c = (0, react_1.useState)(false), safeToUpdateInUseEffect = _c[0], setSafeToUpdateInUseEffect = _c[1];
    var _d = (0, react_1.useState)(0), initialRendersAchieved = _d[0], setInitialRendersAchieved = _d[1];
    // on initial render
    (0, react_1.useEffect)(function () {
        console.log(process.env.NODE_ENV);
        if (contentRef.current) {
            // populate div with html and update state
            contentRef.current.innerHTML = dehydratedHTML;
            // identify portal divs, load react portals
            var reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
            if (portals.length === 0) {
                reactContainerDivs.forEach(function (rcd) { return appendPortalToDiv(rcd); });
            }
            else
                resetPortalContainers();
            setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
            setInitialRendersAchieved(function (initialRendersAchieved) { return initialRendersAchieved + 1; });
        }
        // assign event listeners
        document.addEventListener('selectionchange', function (e) {
            var selection = window.getSelection();
            if (!selection ||
                !contentRef.current ||
                !(0, checks_1.selectionIsDescendentOfNode)(selection, contentRef.current)) {
                updateSelection();
            }
            else {
                handleSelectionChange();
            }
        });
        // teardown
        return function () {
            // remove selection listener, clear contentRef for reassignment
            document.removeEventListener('selectionchange', handleSelectionChange);
            contentRef.current = null;
        };
    }, [contentRef]);
    (0, react_1.useEffect)(function () {
        if (process.env.NODE_ENV === "development") {
            if (initialRendersAchieved >= 2) {
                setSafeToUpdateInUseEffect(true);
            }
        }
        else {
            if (initialRendersAchieved >= 1) {
                setSafeToUpdateInUseEffect(true);
            }
        }
    }, [initialRendersAchieved]);
    // on portal change
    (0, react_1.useEffect)(function () {
        var _a;
        // clean up divs which no longer contain a portal
        if (!contentRef.current)
            return;
        // only update content if initial render useEffect has completed
        if (safeToUpdateInUseEffect)
            updateContent();
        // collect and delete portal divs marked for deletion
        var toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
        toDelete.forEach(function (td) { return (0, dom_operations_1.promoteChildrenOfNode)(td); });
        if (hasSelection) {
            console.log("reset selection in portals useEffect");
            (0, selection_movements_1.resetSelectionToTextNodes)();
        }
    }, [portals]);
    // on divToSetSelectionTo change
    (0, react_1.useEffect)(function () {
        var _a;
        // once react portal has rendered, set selection to text within, clear divToSetSelectionTo
        if (divToSetSelectionTo) {
            if (divToSetSelectionTo.childNodes.length > 0) {
                (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.setBaseAndExtent(divToSetSelectionTo, 0, divToSetSelectionTo, divToSetSelectionTo.childNodes.length);
                (0, selection_movements_1.resetSelectionToTextNodes)();
                setDivToSetSelectionTo(null);
            }
        }
    }, [divToSetSelectionTo]);
    /**
     * run on initial render to unlock future runs of updateContent on portals
     * changes but to prevent it from running right away
     */
    (0, react_1.useEffect)(function () {
        setSafeToUpdateInUseEffect(true);
    }, []);
    function handleSelectionChange() {
        var selection = window.getSelection();
        if (selection && contentRef.current) {
            var anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode = selection.focusNode, focusOffset = selection.focusOffset;
            if (!anchorNode || !focusNode)
                return;
            if (!(0, checks_1.selectionHasTextNodes)(selection, contentRef.current))
                return;
            // check if selection is fine, if so, updateSelection (no reset)
            if (anchorNode.nodeType === Node.TEXT_NODE &&
                focusNode.nodeType === Node.TEXT_NODE &&
                (0, checks_1.isValidTextEndpoint)(anchorNode, anchorOffset, true) &&
                (0, checks_1.isValidTextEndpoint)(focusNode, focusOffset, true)) {
                (0, selection_movements_1.resetSelectionToUsableText)();
                updateSelection();
                return;
            }
            // else - selection is not fine, reset selection
            updateSelection();
            return;
        }
        // else - no selection or contentRef.current, do nothing
    }
    return (<>
      <div contentEditable ref={assignContentRef} className={className} spellCheck={false} 
    // style={{ whiteSpace: "pre" }}
    onFocus={function () {
            var _a;
            // create empty text node if necessary
            if (contentRef.current && (0, checks_1.getAllTextNodes)([contentRef.current]).length === 0) {
                var textNode = new Text("\u200B\u200B");
                contentRef.current.append(textNode);
                (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.setBaseAndExtent(textNode, 1, textNode, 1);
                updateContent();
            }
            setHasSelection(true);
        }} onBlurCapture={function (e) {
            // if blurring because button is being clicked, do not setHasSelection to false
            if (!e.relatedTarget ||
                e.relatedTarget.tagName !== 'BUTTON' ||
                e.relatedTarget.getAttribute('data-context-id') !== contextInstanceIdRef.current) {
                setHasSelection(false);
            }
            // else, relatedTarget is button, retain hasSelection as true
        }} onKeyDown={function (e) {
            var selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || !contentRef.current)
                return;
            var range = selection.getRangeAt(0);
            // delete range before replacing with character to prevent text merging
            if (e.key.length === 1 &&
                range.startContainer instanceof Text &&
                range.endContainer instanceof Text) {
                e.preventDefault();
                e.stopPropagation();
                if (range.toString().length > 0) {
                    range.startContainer.insertData(range.startOffset, e.key);
                    range.setStart(range.startContainer, range.startOffset + 1);
                    range.extractContents();
                    return;
                }
                var char = e.key === " " ? "\u00a0" : e.key;
                range.startContainer.insertData(range.startOffset, char);
                range.setEnd(range.startContainer, range.startOffset + 1);
                range.collapse();
                updateContent();
                return;
            }
            if (e.code === "Enter") {
                e.preventDefault();
                if (disableNewLines)
                    return;
                // else continue
                var br = document.createElement('br');
                range.extractContents();
                range.insertNode(br);
                // recushion prior node
                if (range.startContainer instanceof Text) {
                    (0, dom_operations_1.cushionTextNode)(range.startContainer);
                }
                // this should always be true, text node should exist to begin with or is created above
                if (br.nextSibling instanceof Text) {
                    (0, dom_operations_1.cushionTextNode)(br.nextSibling);
                    range.setStart(br.nextSibling, 1);
                    range.collapse();
                }
                updateContent();
            }
            if (e.code === "ArrowLeft") {
                if (!e.shiftKey &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.moveSelection)(selection, contentRef.current, "left");
                }
                else if (e.shiftKey &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.extendSelection)(selection, contentRef.current, "left");
                }
                else if (e.shiftKey &&
                    (e.altKey ||
                        e.ctrlKey) &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.extendWordSelection)(selection, contentRef.current, "left");
                }
            }
            if (e.code === "ArrowRight") {
                if (!e.shiftKey &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.moveSelection)(selection, contentRef.current, "right");
                }
                else if (e.shiftKey &&
                    !e.altKey &&
                    !e.ctrlKey &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.extendSelection)(selection, contentRef.current, "right");
                }
                else if (e.shiftKey &&
                    (e.altKey ||
                        e.ctrlKey) &&
                    !e.metaKey) {
                    e.preventDefault();
                    (0, selection_movements_1.extendWordSelection)(selection, contentRef.current, "right");
                }
            }
            if (e.code === "Delete") {
                e.preventDefault();
                if (range.toString().length === 0) {
                    (0, selection_movements_1.extendSelection)(selection, contentRef.current, "right");
                }
                (0, dom_operations_1.clearAndResetSelection)(selection);
                updateContent();
            }
            if (e.code === "Backspace") {
                e.preventDefault();
                if (range.toString().length === 0) {
                    (0, selection_movements_1.extendSelection)(selection, contentRef.current, "left");
                }
                (0, dom_operations_1.clearAndResetSelection)(selection);
                updateContent();
            }
        }}>
      </div>
      {portals}
    </>);
}
