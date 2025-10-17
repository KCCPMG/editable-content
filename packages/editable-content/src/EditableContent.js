"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditableContent;
const react_1 = __importStar(require("react"));
const EditableContentContext_1 = require("./EditableContentContext");
const selection_movements_1 = require("./utils/selection_movements");
const checks_1 = require("./utils/checks");
const dom_operations_1 = require("./utils/dom_operations");
function EditableContent({ className, disableNewLines }) {
    const { contextInstanceIdRef, contentRef, setContentRefCurrentInnerHTML, hasSelection, setHasSelection, portals, divToSetSelectionTo, setDivToSetSelectionTo, appendPortalToDiv, updateSelection, updateContent, dehydratedHTML, resetPortalContainers, assignContentRef } = (0, EditableContentContext_1.useEditableContentContext)();
    const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = (0, react_1.useState)(false);
    const [initialRendersAchieved, setInitialRendersAchieved] = (0, react_1.useState)(0);
    const editableContentRef = (0, react_1.useRef)(null);
    /**
     * On initial render only
     * Assigns editableContentRef.current to
     * contentRef.current if they are not already
     * the same (this safely works across both renders
     * in development mode). Once the assignment
     * has been made, populates the contentRef.current's
     * innerHTML with the dehydratedHTML, and then
     * calls setContentRefCurrentInnerHTML. Note that
     * this does *not* call updateContent, which contains
     * cleanup logic that would cause deletion of react
     * portal divs during their initial population. This
     * also adds the selectionchange event handler, updates
     * the initialRenders achieved state for determining if
     * it is safe to execute post-render logic, and returns
     * the teardown logic of assigning null to contentRef and
     * removing the selectionchange handler.
     */
    (0, react_1.useEffect)(() => {
        if (editableContentRef.current) {
            // assign contentRef if not assigned
            if (!contentRef.current || (contentRef.current != editableContentRef.current)) {
                assignContentRef(editableContentRef.current);
            }
            // contentRef.current is editableContentRef
            if (contentRef.current == editableContentRef.current) {
                // populate div with html and update state
                contentRef.current.innerHTML = dehydratedHTML;
                setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
            }
        }
        // assign selectionchange event listener
        document.addEventListener('selectionchange', (e) => {
            const selection = window.getSelection();
            if (!selection ||
                !contentRef.current ||
                !(0, checks_1.selectionIsDescendentOfNode)(selection, contentRef.current)) {
                updateSelection();
            }
            else {
                handleSelectionChange();
            }
        });
        setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1);
        // teardown
        return () => {
            // remove selection listener, clear contentRef for reassignment
            try {
                document.removeEventListener('selectionchange', handleSelectionChange);
            }
            catch (err) {
                console.log("selection change handler error", err);
            }
            try {
                assignContentRef(null);
            }
            catch (err) {
                console.log("assignContentRef error:", err);
            }
        };
    }, []);
    /**
     * On change to initialRendersAchieved
     * If initial renders have been achieved, (2
     * for development, 1 for production), then
     * setSafeToUpdateInUseEffect(true)
     */
    (0, react_1.useEffect)(() => {
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
    /**
     * On change to safeToUpdateInUseEffect
     * If safeToUpdateInUseEffect, and contentRef
     * has been successfully assigned to
     * editableContentRef, populate react divs,
     * either by creating the react portals if
     * they do not exist, or by resetting them if
     * they do.
     */
    (0, react_1.useEffect)(() => {
        if (safeToUpdateInUseEffect) {
            if (editableContentRef.current &&
                (contentRef.current == editableContentRef.current)) {
                if (portals.length === 0) {
                    const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
                    reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd));
                }
                else {
                    resetPortalContainers();
                }
            }
        }
    }, [safeToUpdateInUseEffect]);
    /**
     * On portals change
     * Only runs after refs assigned and initial renders
     * complete: calls updateContent to run clean up
     * and setContentRefInnerHTML to reflect changes
     * made to dom by react portals, deletes react divs for
     * portals which have been deleted, and then makes sure
     * selection is on text nodes.
     */
    (0, react_1.useEffect)(() => {
        var _a;
        // do *not* run until refs assigned, initial render complete
        if (contentRef.current &&
            (contentRef.current == editableContentRef.current) &&
            safeToUpdateInUseEffect) {
            // collect and delete portal divs marked for deletion
            const toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
            toDelete.forEach(td => (0, dom_operations_1.promoteChildrenOfNode)(td));
            updateContent(); // cleans up, sets contentRefInnerHTML
            if (hasSelection) {
                (0, selection_movements_1.resetSelectionToTextNodes)();
            }
        }
    }, [portals]);
    /**
     * on divToSetSelectionTo change
     * If there is a div which should have the
     * selection, set selection to text within
     * the div.
     */
    (0, react_1.useEffect)(() => {
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
    function handleSelectionChange() {
        const selection = window.getSelection();
        if (selection && contentRef.current) {
            const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
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
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { contentEditable: true, ref: editableContentRef, className: className, spellCheck: false, 
            // style={{ whiteSpace: "pre" }}
            onFocus: () => {
                var _a;
                // create empty text node if necessary
                if (contentRef.current && (0, checks_1.getAllTextNodes)([contentRef.current]).length === 0) {
                    const textNode = new Text("\u200B\u200B");
                    contentRef.current.append(textNode);
                    (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.setBaseAndExtent(textNode, 1, textNode, 1);
                    updateContent();
                }
                setHasSelection(true);
            }, onBlurCapture: (e) => {
                // if blurring because button is being clicked, do not setHasSelection to false
                if (!e.relatedTarget ||
                    e.relatedTarget.tagName !== 'BUTTON' ||
                    e.relatedTarget.getAttribute('data-context-id') !== contextInstanceIdRef.current) {
                    setHasSelection(false);
                }
                // else, relatedTarget is button, retain hasSelection as true
            }, onKeyDown: (e) => {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0 || !contentRef.current)
                    return;
                const range = selection.getRangeAt(0);
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
                    const char = e.key === " " ? "\u00a0" : e.key;
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
                    const br = document.createElement('br');
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
            } }),
        portals));
}
