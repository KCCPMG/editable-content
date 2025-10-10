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
    const { contentRef, setHasSelection, portals, appendPortalToDiv, dehydratedHTML, resetPortalContainers, assignContentRef } = (0, EditableContentContext_1.useEditableContentContext)();
    // on initial render - populate portal containers without deleting for being empty
    (0, react_1.useLayoutEffect)(() => {
        setHasSelection(false);
        if (contentRef.current) {
            // populate with dehydratedHTML
            contentRef.current.innerHTML = dehydratedHTML;
            // identify portal divs, load react portals
            const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
            if (portals.length === 0) {
                reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd));
            }
            else
                resetPortalContainers();
        }
        // teardown
        return () => {
            contentRef.current = null; // clear contentRef to be reassigned
        };
    }, [contentRef]);
    // on portal change
    (0, react_1.useEffect)(() => {
        var _a;
        if (!contentRef.current)
            return;
        // clean up divs which no longer contain a portal
        const toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
        toDelete.forEach(td => (0, dom_operations_1.promoteChildrenOfNode)(td));
    }, [portals]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { ref: assignContentRef, className: className, spellCheck: false }),
        portals));
}
