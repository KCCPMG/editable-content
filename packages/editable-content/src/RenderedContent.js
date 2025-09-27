"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedContent;
var react_1 = require("react");
var EditableContentContext_1 = require("./EditableContentContext");
var dom_operations_1 = require("./utils/dom_operations");
function RenderedContent(_a) {
    var className = _a.className;
    var _b = (0, EditableContentContext_1.useEditableContentContext)(), contentRef = _b.contentRef, setHasSelection = _b.setHasSelection, portals = _b.portals, appendPortalToDiv = _b.appendPortalToDiv, dehydratedHTML = _b.dehydratedHTML, resetPortalContainers = _b.resetPortalContainers, assignContentRef = _b.assignContentRef;
    // on initial render - populate portal containers without deleting for being empty
    (0, react_1.useLayoutEffect)(function () {
        setHasSelection(false);
        if (contentRef.current) {
            // populate with dehydratedHTML
            contentRef.current.innerHTML = dehydratedHTML;
            // identify portal divs, load react portals
            var reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
            if (portals.length === 0) {
                reactContainerDivs.forEach(function (rcd) { return appendPortalToDiv(rcd); });
            }
            else
                resetPortalContainers();
        }
        // teardown
        return function () {
            contentRef.current = null; // clear contentRef to be reassigned
        };
    }, [contentRef]);
    // on portal change
    (0, react_1.useEffect)(function () {
        var _a;
        if (!contentRef.current)
            return;
        // clean up divs which no longer contain a portal
        var toDelete = Array.from((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelectorAll("[data-mark-for-deletion]"));
        toDelete.forEach(function (td) { return (0, dom_operations_1.promoteChildrenOfNode)(td); });
    }, [portals]);
    return (<>
      <div ref={assignContentRef} className={className} spellCheck={false}>
      </div>
      {portals}
    </>);
}
