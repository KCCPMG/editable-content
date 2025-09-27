"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableContentContext = void 0;
exports.EditableContentContextProvider = EditableContentContextProvider;
exports.useEditableContentContext = useEditableContentContext;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var uuid_1 = require("uuid");
var constants_1 = require("./utils/constants");
var checks_1 = require("./utils/checks");
var dom_operations_1 = require("./utils/dom_operations");
var selection_movements_1 = require("./utils/selection_movements");
exports.EditableContentContext = (0, react_1.createContext)(null);
function EditableContentContextProvider(_a) {
    var children = _a.children, keyAndWrapperObjs = _a.keyAndWrapperObjs, initialHTML = _a.initialHTML, initialProps = _a.initialProps;
    var contentRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(""), contentRefCurrentInnerHTML = _b[0], setContentRefCurrentInnerHTML = _b[1];
    var _c = (0, react_1.useState)(""), selectionToString = _c[0], setSelectionToString = _c[1];
    var _d = (0, react_1.useState)(null), selectionAnchorNode = _d[0], setSelectionAnchorNode = _d[1];
    var _e = (0, react_1.useState)(null), selectionAnchorOffset = _e[0], setSelectionAnchorOffset = _e[1];
    var _f = (0, react_1.useState)(null), selectionFocusNode = _f[0], setSelectionFocusNode = _f[1];
    var _g = (0, react_1.useState)(null), selectionFocusOffset = _g[0], setSelectionFocusOffset = _g[1];
    var _h = (0, react_1.useState)(false), hasSelection = _h[0], setHasSelection = _h[1];
    var _j = (0, react_1.useState)([]), portals = _j[0], setPortals = _j[1];
    var _k = (0, react_1.useState)(null), divToSetSelectionTo = _k[0], setDivToSetSelectionTo = _k[1];
    var _l = (0, react_1.useState)(initialHTML || ""), dehydratedHTML = _l[0], setDehydratedHTML = _l[1];
    var _m = (0, react_1.useState)(false), buttonUpdateTrigger = _m[0], setButtonUpdateTrigger = _m[1];
    var contextInstanceIdRef = (0, react_1.useRef)((0, uuid_1.v4)());
    function triggerButtonUpdate() {
        setButtonUpdateTrigger(!buttonUpdateTrigger);
    }
    /**
     * Used in place of ref={contentRef} to avoid race condition
     * in resetting ref on component render
     * @param newRef
     */
    function assignContentRef(newRef) {
        contentRef.current = newRef;
    }
    (0, react_1.useEffect)(function () {
        getDehydratedHTML(setDehydratedHTML);
    }, [contentRefCurrentInnerHTML]);
    /**
     * Create DOMParser from current html of contentRef.current, remove
     * all tags which are marked for exclusion, find divs which house
     * portals, remove all contents of those divs except text, pass
     * dehydrated html to callback.
     * @param callback
     */
    function getDehydratedHTML(callback) {
        var parsedHTMLBody = (typeof window !== "undefined") ?
            new DOMParser().parseFromString(contentRefCurrentInnerHTML, "text/html").body :
            null;
        if (!parsedHTMLBody)
            return;
        // remove all tags marked for exclusion
        var tagsToIgnore = Array.from(parsedHTMLBody.querySelectorAll("[".concat(constants_1.EXCLUDE_FROM_DEHYDRATED, "]")));
        tagsToIgnore.forEach(function (tti) { return tti.remove(); });
        var divs = Array.from(parsedHTMLBody.querySelectorAll("div[data-button-key]"));
        var _loop_1 = function (div) {
            var divRange = new Range();
            divRange.setStart(div, 0);
            divRange.setEnd(div, div.childNodes.length);
            var textNodes = (0, checks_1.getRangeChildNodes)(divRange, parsedHTMLBody)
                .filter(function (cn) { return cn.nodeType === Node.TEXT_NODE; });
            divRange.extractContents();
            textNodes.forEach(function (tn) {
                divRange.insertNode(tn);
            });
        };
        for (var _i = 0, divs_1 = divs; _i < divs_1.length; _i++) {
            var div = divs_1[_i];
            _loop_1(div);
        }
        return callback(parsedHTMLBody.innerHTML);
    }
    /**
     * Go through the keys of the update object, find the corresponding portal
     * in portals, clone portal with new props, filter out original portals and
     * then setPortals with clones
     * @param updateObj
     */
    function updatePortalProps(updateObj) {
        var portalClones = [];
        var portalIds = Object.keys(updateObj); // ids of portals to update only
        if (portalIds.length === 0)
            return; // prevent unnecessary setPortals especially during dev re-render
        return setPortals(function (previousPortals) {
            portalIds.forEach(function (portalId) {
                var _a;
                var foundPortalIndex = previousPortals.findIndex(function (portal) { return portal.key === portalId; });
                if (foundPortalIndex < 0)
                    return;
                var container = (_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("#portal-container-".concat(portalId));
                if (!container)
                    return;
                var foundPortal = previousPortals[foundPortalIndex];
                if (!foundPortal)
                    return;
                var targetComponent = foundPortal.children;
                if (!(0, react_1.isValidElement)(targetComponent))
                    return;
                // else proceed
                var props = Object.assign({}, targetComponent.props, updateObj[portalId]);
                var clone = (0, react_1.cloneElement)(targetComponent, props, targetComponent.props.children);
                var clonedPortal = (0, react_dom_1.createPortal)(clone, container, portalId);
                portalClones.push(clonedPortal);
            });
            if (portalClones.length === 0)
                return previousPortals; // second check to prevent bad setState
            // remove stale portals, replace with portalClones
            return (__spreadArray(__spreadArray([], previousPortals.filter(function (portal) { return portal.key === null || !portalIds.includes(portal.key); }), true), portalClones, true));
        });
    }
    /**
     * Updates portals state by extracting children from the div which will house the portal,
     * then passing those children to the portal
     * @returns
     */
    function resetPortalContainers() {
        return setPortals(function (previousPortals) {
            var portalClones = [];
            previousPortals.forEach(function (portal) {
                var _a;
                var portalId = portal.key;
                var container = (_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("#portal-container-".concat(portalId));
                if (!container)
                    return;
                var children = container.innerHTML;
                container.innerHTML = "";
                var foundPortalIndex = previousPortals.findIndex(function (portal) { return portal.key === portalId; });
                if (foundPortalIndex < 0)
                    return;
                var foundPortal = previousPortals[foundPortalIndex];
                if (!foundPortal)
                    return;
                var targetComponent = foundPortal.children;
                if (!(0, react_1.isValidElement)(targetComponent))
                    return;
                var clone = (0, react_1.cloneElement)(targetComponent, targetComponent.props, children);
                var clonedPortal = (0, react_dom_1.createPortal)(clone, container, portalId);
                portalClones.push(clonedPortal);
            });
            return portalClones;
        });
    }
    /**
     * Gets current props for all portals in context
     * @returns PortalProps
     */
    function getAllPortalProps() {
        return Object.assign.apply(Object, __spreadArray([{}], portals.map(function (portal) {
            var _a;
            var targetComponent = portal.children;
            if (!(0, react_1.isValidElement)(targetComponent))
                return null;
            var key = portal.key;
            if (!key)
                return null;
            return _a = {}, _a[key] = targetComponent.props, _a;
        }), false));
    }
    /**
     * Update state related to selection to reflect the
     * current window.getSelection()
     */
    function updateSelection() {
        resetScroll();
        var gotSelection = window.getSelection();
        // if selection is within contentRef.current or IS contentRef.current
        if (gotSelection &&
            contentRef.current &&
            ((0, checks_1.selectionIsDescendentOfNode)(gotSelection, contentRef.current) ||
                (gotSelection.anchorNode === contentRef.current &&
                    gotSelection.focusNode === contentRef.current))) {
            setSelectionToString(gotSelection.toString());
            setSelectionAnchorNode(gotSelection.anchorNode);
            setSelectionAnchorOffset(gotSelection.anchorOffset);
            setSelectionFocusNode(gotSelection.focusNode);
            setSelectionFocusOffset(gotSelection.focusOffset);
        }
        else {
            setSelectionToString("");
        }
    }
    /**
     * Reset selection to text nodes, setContentRefCurrentInnerHTML
     * (which will also update dehydrated HTML on useEffect), restore
     * focus on contentRef
     */
    function updateContent() {
        /**
         * Get all text nodes in contentRef.current, make sure
         * that they begin and end with a zero width space
         */
        var _a, _b;
        if (contentRef.current) {
            var textNodes = (0, checks_1.getAllTextNodes)([contentRef.current]);
            (0, dom_operations_1.resetTextNodesCushions)(textNodes);
            var badTextNodes = (0, checks_1.identifyBadTextNodes)(textNodes, contentRef.current);
            badTextNodes.forEach(function (btn) { return btn.remove(); });
            (0, dom_operations_1.deleteEmptyElements)(contentRef.current);
        }
        if (hasSelection) {
            (0, selection_movements_1.resetSelectionToTextNodes)();
        }
        setContentRefCurrentInnerHTML(((_a = contentRef === null || contentRef === void 0 ? void 0 : contentRef.current) === null || _a === void 0 ? void 0 : _a.innerHTML) || "");
        (_b = contentRef.current) === null || _b === void 0 ? void 0 : _b.focus();
    }
    // TODO: rework vertical logic to comprehensive approach based on focus node/offset
    /**
     * Reset scroll of container by
     * - scrolling up if range is above current view
     * - scrolling down if range is below current view
     * - scrolling left if range is to left of current view
     * - scrolling right if range is to right of current view
     * @returns
     */
    function resetScroll() {
        var _a;
        // initialize
        var range = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0);
        var selectionDirection = (0, checks_1.getSelectionDirection)(window.getSelection());
        if (!range || !contentRef.current)
            return;
        var rangeRect = range.getBoundingClientRect();
        var containerRect = contentRef.current.getBoundingClientRect();
        var comparisonRange = range.cloneRange();
        if (selectionDirection === "backward")
            comparisonRange.collapse(true);
        else
            comparisonRange.collapse(false);
        // vertical reset scroll
        if (rangeRect.top >= containerRect.top &&
            rangeRect.top <= (containerRect.top + containerRect.height) &&
            (rangeRect.top + rangeRect.height) >= containerRect.top &&
            (rangeRect.top + rangeRect.height) <= (containerRect.top + containerRect.height)) {
            // do nothing, range is visible within current lc scroll
        }
        else {
            // range is above current lc scroll window
            if (rangeRect.top < containerRect.top) {
                // targetOffset is distance between rangeRect and where it should be
                var targetOffset = containerRect.top - rangeRect.top;
                contentRef.current.scroll(0, contentRef.current.scrollTop - targetOffset);
            }
            // range is below current lc scroll window
            else if ((rangeRect.top + rangeRect.height) >= (containerRect.top + containerRect.height)) {
                // targetOffset is distance between rangeRect and where it should be
                var targetOffset = (rangeRect.top + rangeRect.height) - (containerRect.top + containerRect.height);
                contentRef.current.scroll(0, contentRef.current.scrollTop + targetOffset);
            }
        }
        // horizontal reset scroll
        var comparisonRangeRect = comparisonRange.getBoundingClientRect();
        if (comparisonRangeRect.left < containerRect.left) {
            contentRef.current.scrollBy(comparisonRangeRect.left - containerRect.left, 0);
        }
        if (comparisonRangeRect.right > containerRect.right) {
            contentRef.current.scrollBy(comparisonRangeRect.right - containerRect.right, 0);
        }
    }
    /**
     * Clone react component with child text. If this is the first time this
     * portal is being created, load initial props for this component if they
     * exist, create portal, add portal to portals.
     * @param component
     * @param props
     * @param text
     * @param targetDiv
     */
    function cloneElementIntoPortal(component, props, text, targetDiv) {
        var portalId = props["key"];
        var additionalProps = {
            portalId: portalId,
            "data-unbreakable": "",
            getContext: useEditableContentContext
        };
        setPortals(function (previousPortals) {
            var priorIndex = previousPortals.findIndex(function (p) { return p.key === portalId; });
            var componentInitialProps = {};
            if (priorIndex >= 0) {
                previousPortals.splice(priorIndex, 1);
            }
            else {
                if (initialProps && initialProps[portalId]) {
                    for (var _i = 0, _a = Object.entries(initialProps[portalId]); _i < _a.length; _i++) {
                        var _b = _a[_i], k = _b[0], v = _b[1];
                        componentInitialProps[k] = v;
                    }
                }
            }
            var clone = (0, react_1.cloneElement)(component, __assign(__assign(__assign({}, props), additionalProps), componentInitialProps), text);
            var portal = (0, react_dom_1.createPortal)(clone, targetDiv, props["key"] || null);
            return __spreadArray(__spreadArray([], previousPortals, true), [portal], false);
        });
    }
    /**
     * Generate a containing div element with data-button-key indicating
     * type of React Element it holds, append ReactElement to that div,
     * create portal and add that portal to portals state
     * @param component
     */
    function createContentPortal(component, buttonKey) {
        var _a;
        var uuid = (0, uuid_1.v4)();
        var id = constants_1.PORTAL_CONTAINER_ID_PREFIX + uuid;
        var newDiv = document.createElement("div");
        newDiv.setAttribute('id', id);
        newDiv.setAttribute('data-button-key', buttonKey);
        newDiv.style.display = "inline";
        var selection = window.getSelection();
        if (!selection)
            return;
        var range = selection.getRangeAt(0);
        // expanding assignment to allow insertion of other logic if need be
        var text = (function () {
            var rangeToString = range.toString();
            if (rangeToString.length > 0) {
                return rangeToString;
            }
            else {
                return '\u200B\u200B';
            }
        }());
        range === null || range === void 0 ? void 0 : range.extractContents();
        range.insertNode(newDiv);
        setDivToSetSelectionTo(newDiv);
        var foundNewDiv = (_a = contentRef === null || contentRef === void 0 ? void 0 : contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("#".concat(id));
        if (!foundNewDiv)
            return;
        // currently only handling range text, not nested elements
        if (contentRef.current && contentRef.current && foundNewDiv) {
            cloneElementIntoPortal(component, { key: uuid, 'data-bk': buttonKey }, text, foundNewDiv);
            return uuid;
        }
    }
    /**
     * Finds an existing div that should house a React portal,
     * then finds the correct button by looking in the editTextButtons
     * prop for the corresponding dataKey, renders the correct component
     * from that button's wrapperInstructions, creates a portal
     * and appends that portal to portals. This is called when RenderedContent
     * or EditableContent first render
     * @param containingDiv
     */
    function appendPortalToDiv(containingDiv) {
        var key = containingDiv.getAttribute("data-button-key");
        var containingDivId = containingDiv.getAttribute('id');
        if (!containingDivId)
            return;
        var uuid = containingDivId.split(constants_1.PORTAL_CONTAINER_ID_PREFIX)[1];
        if (!uuid || uuid.length === 0)
            return;
        if (!key)
            return;
        var contentRange = new Range();
        contentRange.setStart(containingDiv, 0);
        contentRange.setEnd(containingDiv, containingDiv.childNodes.length);
        var text = contentRange.toString();
        var content = contentRange.extractContents(); // content currently unused
        // find correct wrapper button
        var foundKeyAndWrapperObj = keyAndWrapperObjs.find(function (obj) { return obj.dataKey === key; });
        if (!foundKeyAndWrapperObj)
            return;
        if (!(0, checks_1.getIsReactComponent)(foundKeyAndWrapperObj.wrapper))
            return;
        var component = foundKeyAndWrapperObj.wrapper;
        cloneElementIntoPortal(component, { key: uuid, 'data-bk': key }, text, containingDiv);
    }
    /**
     * Remove a portal from the portals object selecting by its key
     * @param key
     */
    function removePortal(key) {
        var portalsCopy = __spreadArray([], portals, true);
        var targetIndex = portalsCopy.findIndex(function (p) { return p.key === key; });
        portalsCopy.splice(targetIndex, 1);
        setPortals(portalsCopy);
    }
    return (<exports.EditableContentContext.Provider value={{
            contextInstanceIdRef: contextInstanceIdRef,
            contentRef: contentRef,
            contentRefCurrentInnerHTML: contentRefCurrentInnerHTML,
            setContentRefCurrentInnerHTML: setContentRefCurrentInnerHTML,
            selectionToString: selectionToString,
            setSelectionToString: setSelectionToString,
            selectionAnchorNode: selectionAnchorNode,
            setSelectionAnchorNode: setSelectionAnchorNode,
            selectionAnchorOffset: selectionAnchorOffset,
            setSelectionAnchorOffset: setSelectionAnchorOffset,
            selectionFocusNode: selectionFocusNode,
            setSelectionFocusNode: setSelectionFocusNode,
            selectionFocusOffset: selectionFocusOffset,
            setSelectionFocusOffset: setSelectionFocusOffset,
            hasSelection: hasSelection,
            setHasSelection: setHasSelection,
            portals: portals,
            setPortals: setPortals,
            divToSetSelectionTo: divToSetSelectionTo,
            setDivToSetSelectionTo: setDivToSetSelectionTo,
            getDehydratedHTML: getDehydratedHTML,
            updatePortalProps: updatePortalProps,
            getAllPortalProps: getAllPortalProps,
            keyAndWrapperObjs: keyAndWrapperObjs,
            updateContent: updateContent,
            createContentPortal: createContentPortal,
            appendPortalToDiv: appendPortalToDiv,
            removePortal: removePortal,
            updateSelection: updateSelection,
            dehydratedHTML: dehydratedHTML,
            resetPortalContainers: resetPortalContainers,
            assignContentRef: assignContentRef,
            buttonUpdateTrigger: buttonUpdateTrigger,
            triggerButtonUpdate: triggerButtonUpdate
        }}>
      {children}
    </exports.EditableContentContext.Provider>);
}
function useEditableContentContext() {
    var context = (0, react_1.useContext)(exports.EditableContentContext);
    if (!context) {
        throw new Error("useEditableContentContext must be in EditableContentContextProvider");
    }
    return context;
}
