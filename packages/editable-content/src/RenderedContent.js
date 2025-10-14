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
exports.default = RenderedContent;
const react_1 = __importStar(require("react"));
const EditableContentContext_1 = require("./EditableContentContext");
const dom_operations_1 = require("./utils/dom_operations");
function RenderedContent({ className }) {
    const { contentRef, setHasSelection, portals, appendPortalToDiv, dehydratedHTML, resetPortalContainers, assignContentRef, updateContent } = (0, EditableContentContext_1.useEditableContentContext)();
    const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = (0, react_1.useState)(false);
    const [initialRendersAchieved, setInitialRendersAchieved] = (0, react_1.useState)(0);
    const renderedContentRef = (0, react_1.useRef)(null);
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
        if (renderedContentRef.current) {
            // assign contentRef if not assigned
            if (!contentRef.current || (contentRef.current != renderedContentRef.current)) {
                assignContentRef(renderedContentRef.current);
            }
            // contentRef.current is editableContentRef
            if (contentRef.current == renderedContentRef.current) {
                // populate div with html and update state
                contentRef.current.innerHTML = dehydratedHTML;
                // setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
            }
        }
        setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1);
        // teardown
        return () => {
            try {
                console.log("\nteardown");
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
            if (renderedContentRef.current &&
                (contentRef.current == renderedContentRef.current)) {
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
            (contentRef.current == renderedContentRef.current) &&
            safeToUpdateInUseEffect) {
            // collect and delete portal divs marked for deletion
            const toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
            toDelete.forEach(td => (0, dom_operations_1.promoteChildrenOfNode)(td));
            updateContent(); // cleans up, sets contentRefInnerHTML
        }
    }, [portals]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { ref: renderedContentRef, className: className, spellCheck: false }),
        portals));
}
