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
    const { contextInstanceIdRef, contentRef, setContentRefCurrentInnerHTML, hasSelection, setHasSelection, portals, setPortals, divToSetSelectionTo, setDivToSetSelectionTo, appendPortalToDiv, updateSelection, updateContent, dehydratedHTML, resetPortalContainers, assignContentRef } = (0, EditableContentContext_1.useEditableContentContext)();
    const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = (0, react_1.useState)(false);
    const [initialRendersAchieved, setInitialRendersAchieved] = (0, react_1.useState)(0);
    const editableContentRef = (0, react_1.useRef)(null);
    // on initial render
    (0, react_1.useEffect)(() => {
        console.log(process.env.NODE_ENV);
        if (editableContentRef.current) {
            if (!contentRef.current || contentRef.current != editableContentRef.current) {
                assignContentRef(editableContentRef.current);
            }
        }
        // if (!contentRef.current || contentRef.current != editableContentRef.current) {
        //   if (editableContentRef.current) {
        //     assignContentRef(editableContentRef.current);
        //   }
        // }
        if (contentRef.current && (contentRef.current == editableContentRef.current)) {
            // populate div with html and update state
            contentRef.current.innerHTML = dehydratedHTML;
            // identify portal divs, load react portals
            const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
            if (portals.length === 0) {
                reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd));
            }
            else
                resetPortalContainers();
            console.log("before setContentRefCurrentInnerHTML in EditableContent");
            // setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
            setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1);
        }
        // assign event listeners
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
        // teardown
        return () => {
            // remove selection listener, clear contentRef for reassignment
            try {
                document.removeEventListener('selectionchange', handleSelectionChange);
            }
            catch (err) {
                console.log("selection change handler error", err);
            }
            // contentRef.current = null;
            try {
                console.log("\nteardown");
                assignContentRef(null);
            }
            catch (err) {
                console.log("assignContentRef error:", err);
            }
        };
    }, [contentRef]);
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
    // on portal change
    (0, react_1.useEffect)(() => {
        var _a;
        // clean up divs which no longer contain a portal
        // if (!contentRef.current) return;
        if (contentRef.current && (contentRef.current == editableContentRef.current)) {
            // only update content if initial render useEffect has completed
            if (safeToUpdateInUseEffect) {
                // console.log("updating content", contentRef.current && (contentRef.current == editableContentRef.current));
                // updateContent();
            }
            // collect and delete portal divs marked for deletion
            const toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
            // console.log(`attempting to delete ${toDelete.length} portal divs`)
            toDelete.forEach(td => (0, dom_operations_1.promoteChildrenOfNode)(td));
            if (hasSelection) {
                console.log("reset selection in portals useEffect");
                (0, selection_movements_1.resetSelectionToTextNodes)();
            }
        }
    }, [portals]);
    // on divToSetSelectionTo change
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
    /**
     * run on initial render to unlock future runs of updateContent on portals
     * changes but to prevent it from running right away
     */
    (0, react_1.useEffect)(() => {
        setSafeToUpdateInUseEffect(true);
    }, []);
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
