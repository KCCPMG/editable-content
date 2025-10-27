"use strict";
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
exports.EditableContentContext = void 0;
exports.EditableContentContextProvider = EditableContentContextProvider;
exports.useEditableContentContext = useEditableContentContext;
const react_1 = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const uuid_1 = require("uuid");
const constants_1 = require("./utils/constants");
const checks_1 = require("./utils/checks");
const dom_operations_1 = require("./utils/dom_operations");
const selection_movements_1 = require("./utils/selection_movements");
exports.EditableContentContext = (0, react_1.createContext)(null);
function EditableContentContextProvider({ children, keyAndWrapperObjs, initialHTML, initialProps }) {
    const contentRef = (0, react_1.useRef)(null);
    const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = (0, react_1.useState)("");
    const [selectionToString, setSelectionToString] = (0, react_1.useState)("");
    const [selectionAnchorNode, setSelectionAnchorNode] = (0, react_1.useState)(null);
    const [selectionAnchorOffset, setSelectionAnchorOffset] = (0, react_1.useState)(null);
    const [selectionFocusNode, setSelectionFocusNode] = (0, react_1.useState)(null);
    const [selectionFocusOffset, setSelectionFocusOffset] = (0, react_1.useState)(null);
    const [hasSelection, setHasSelection] = (0, react_1.useState)(false);
    const [portals, setPortals] = (0, react_1.useState)([]);
    const [divToSetSelectionTo, setDivToSetSelectionTo] = (0, react_1.useState)(null);
    const [dehydratedHTML, setDehydratedHTML] = (0, react_1.useState)(initialHTML || "");
    const [buttonUpdateTrigger, setButtonUpdateTrigger] = (0, react_1.useState)(false);
    const [stableUUID] = (0, react_1.useState)((0, uuid_1.v4)());
    const contextInstanceIdRef = (0, react_1.useRef)(stableUUID);
    const portalsResetting = (0, react_1.useRef)(false);
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
        // console.log("contentRefCurrentInnerHTML changing:", contentRefCurrentInnerHTML)
        prepareDehydratedHTML(setDehydratedHTML);
    }, [contentRefCurrentInnerHTML]);
    (0, react_1.useEffect)(function () {
        portalsResetting.current = false;
    }, [portals]);
    /**
     * Create DOMParser from current html of contentRef.current, remove
     * all tags which are marked for exclusion, find divs which house
     * portals, remove all contents of those divs except text, pass
     * dehydrated html to callback.
     * @param callback
     */
    function prepareDehydratedHTML(callback) {
        // create manipulable copy of contentRefCurrentInnerHTML
        const parsedHTMLBody = (typeof window !== "undefined") ?
            new DOMParser().parseFromString(contentRefCurrentInnerHTML, "text/html").body :
            null;
        if (!parsedHTMLBody)
            return;
        // remove all tags marked for exclusion
        const tagsToIgnore = Array.from(parsedHTMLBody.querySelectorAll(`[${constants_1.EXCLUDE_FROM_DEHYDRATED}]`));
        try {
            tagsToIgnore.forEach(tti => tti.remove());
        }
        catch (err) {
            console.log(err);
        }
        const portalDivs = Array.from(parsedHTMLBody.querySelectorAll("div[data-button-key]"));
        for (let div of portalDivs) {
            const divRange = new Range();
            divRange.setStart(div, 0);
            divRange.setEnd(div, div.childNodes.length);
            const textNodes = (0, checks_1.getRangeChildNodes)(divRange, parsedHTMLBody)
                .filter(cn => cn.nodeType === Node.TEXT_NODE);
            divRange.extractContents();
            textNodes.forEach(tn => {
                divRange.insertNode(tn);
            });
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
        const portalClones = [];
        const portalIds = Object.keys(updateObj); // ids of portals to update only
        if (portalIds.length === 0)
            return; // prevent unnecessary setPortals especially during dev re-render
        return setPortals(previousPortals => {
            portalIds.forEach(portalId => {
                var _a;
                const foundPortalIndex = previousPortals.findIndex(portal => portal.key === portalId);
                if (foundPortalIndex < 0)
                    return;
                const container = (_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`#portal-container-${portalId}`);
                if (!container)
                    return;
                const foundPortal = previousPortals[foundPortalIndex];
                if (!foundPortal)
                    return;
                const targetComponent = foundPortal.children;
                if (!(0, react_1.isValidElement)(targetComponent))
                    return;
                // else proceed
                const props = Object.assign({}, targetComponent.props, updateObj[portalId]);
                const clone = (0, react_1.cloneElement)(targetComponent, props, targetComponent.props.children);
                const clonedPortal = (0, react_dom_1.createPortal)(clone, container, portalId);
                portalClones.push(clonedPortal);
            });
            if (portalClones.length === 0)
                return previousPortals; // second check to prevent bad setState
            // remove stale portals, replace with portalClones
            return ([
                ...previousPortals.filter(portal => portal.key === null || !portalIds.includes(portal.key)),
                ...portalClones
            ]);
        });
    }
    /**
     * Updates portals state by extracting children from the div
     * which will house the portal, then passing those children to
     * the portal
     * @returns
     */
    function resetPortalContainers() {
        if (portalsResetting.current === true)
            return;
        else
            portalsResetting.current = true;
        return setPortals(previousPortals => {
            const portalClones = [];
            previousPortals.forEach(function (portal) {
                var _a;
                const portalId = portal.key;
                const container = (_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`#portal-container-${portalId}`);
                if (!container)
                    return;
                const childText = container.textContent;
                container.innerHTML = "";
                const foundPortalIndex = previousPortals.findIndex(portal => portal.key === portalId);
                if (foundPortalIndex < 0)
                    return;
                const foundPortal = previousPortals[foundPortalIndex];
                if (!foundPortal)
                    return;
                const targetComponent = foundPortal.children;
                if (!(0, react_1.isValidElement)(targetComponent))
                    return;
                const clone = (0, react_1.cloneElement)(targetComponent, targetComponent.props, childText);
                const clonedPortal = (0, react_dom_1.createPortal)(clone, container, portalId);
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
        return Object.assign({}, ...portals.map(portal => {
            const targetComponent = portal.children;
            if (!(0, react_1.isValidElement)(targetComponent))
                return null;
            const key = portal.key;
            if (!key)
                return null;
            return { [key]: targetComponent.props };
        }));
    }
    /**
     * Update state related to selection to reflect the
     * current window.getSelection()
     */
    function updateSelection() {
        resetScroll();
        const gotSelection = window.getSelection();
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
        var _a;
        if (contentRef.current) {
            const textNodes = (0, checks_1.getAllTextNodes)([contentRef.current]);
            (0, dom_operations_1.resetTextNodesCushions)(textNodes);
            const badTextNodes = (0, checks_1.identifyBadTextNodes)(textNodes, contentRef.current);
            badTextNodes.forEach(btn => btn.remove());
            (0, dom_operations_1.deleteEmptyElements)(contentRef.current);
        }
        if (hasSelection) {
            (0, selection_movements_1.resetSelectionToTextNodes)();
        }
        setContentRefCurrentInnerHTML(((_a = contentRef === null || contentRef === void 0 ? void 0 : contentRef.current) === null || _a === void 0 ? void 0 : _a.innerHTML) || "");
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
        const range = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0);
        const selectionDirection = (0, checks_1.getSelectionDirection)(window.getSelection());
        if (!range || !contentRef.current)
            return;
        const rangeRect = range.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();
        const comparisonRange = range.cloneRange();
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
                const targetOffset = containerRect.top - rangeRect.top;
                contentRef.current.scroll(0, contentRef.current.scrollTop - targetOffset);
            }
            // range is below current lc scroll window
            else if ((rangeRect.top + rangeRect.height) >= (containerRect.top + containerRect.height)) {
                // targetOffset is distance between rangeRect and where it should be
                const targetOffset = (rangeRect.top + rangeRect.height) - (containerRect.top + containerRect.height);
                contentRef.current.scroll(0, contentRef.current.scrollTop + targetOffset);
            }
        }
        // horizontal reset scroll
        const comparisonRangeRect = comparisonRange.getBoundingClientRect();
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
        const portalId = props["key"];
        const additionalProps = {
            portalId: portalId,
            "data-unbreakable": "",
            getContext: useEditableContentContext
        };
        setPortals(previousPortals => {
            const priorIndex = previousPortals.findIndex(p => p.key === portalId);
            const componentInitialProps = {};
            if (priorIndex >= 0) {
                previousPortals.splice(priorIndex, 1);
            }
            else {
                if (initialProps && initialProps[portalId]) {
                    for (let [k, v] of Object.entries(initialProps[portalId])) {
                        componentInitialProps[k] = v;
                    }
                }
            }
            const clone = (0, react_1.cloneElement)(component, Object.assign(Object.assign(Object.assign({}, props), additionalProps), componentInitialProps), text);
            const portal = (0, react_dom_1.createPortal)(clone, targetDiv, props["key"] || null);
            return [...previousPortals, portal];
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
        const uuid = (0, uuid_1.v4)();
        const id = constants_1.PORTAL_CONTAINER_ID_PREFIX + uuid;
        const newDiv = document.createElement("div");
        newDiv.setAttribute('id', id);
        newDiv.setAttribute('data-button-key', buttonKey);
        newDiv.style.display = "inline";
        const selection = window.getSelection();
        if (!selection)
            return;
        const range = selection.getRangeAt(0);
        // expanding assignment to allow insertion of other logic if need be
        const text = (function () {
            const rangeToString = range.toString();
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
        const foundNewDiv = (_a = contentRef === null || contentRef === void 0 ? void 0 : contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(`#${id}`);
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
        const key = containingDiv.getAttribute("data-button-key");
        const containingDivId = containingDiv.getAttribute('id');
        if (!containingDivId)
            return;
        const uuid = containingDivId.split(constants_1.PORTAL_CONTAINER_ID_PREFIX)[1];
        if (!uuid || uuid.length === 0)
            return;
        if (!key)
            return;
        const contentRange = new Range();
        contentRange.setStart(containingDiv, 0);
        contentRange.setEnd(containingDiv, containingDiv.childNodes.length);
        const text = contentRange.toString();
        const content = contentRange.extractContents(); // content currently unused
        // find correct wrapper button
        const foundKeyAndWrapperObj = keyAndWrapperObjs.find(obj => obj.dataKey === key);
        if (!foundKeyAndWrapperObj)
            return;
        if (!(0, checks_1.getIsReactComponent)(foundKeyAndWrapperObj.wrapper))
            return;
        const component = foundKeyAndWrapperObj.wrapper;
        cloneElementIntoPortal(component, { key: uuid, 'data-bk': key }, text, containingDiv);
    }
    /**
     * Remove a portal from the portals object selecting by its key
     * @param key
     */
    function removePortal(key) {
        const portalsCopy = [...portals];
        const targetIndex = portalsCopy.findIndex(p => p.key === key);
        portalsCopy.splice(targetIndex, 1);
        setPortals(portalsCopy);
    }
    return (react_1.default.createElement(exports.EditableContentContext.Provider, { value: {
            contextInstanceIdRef,
            contentRef,
            contentRefCurrentInnerHTML,
            setContentRefCurrentInnerHTML,
            selectionToString,
            setSelectionToString,
            selectionAnchorNode,
            setSelectionAnchorNode,
            selectionAnchorOffset,
            setSelectionAnchorOffset,
            selectionFocusNode,
            setSelectionFocusNode,
            selectionFocusOffset,
            setSelectionFocusOffset,
            hasSelection,
            setHasSelection,
            portals,
            setPortals,
            divToSetSelectionTo,
            setDivToSetSelectionTo,
            prepareDehydratedHTML,
            updatePortalProps,
            getAllPortalProps,
            keyAndWrapperObjs,
            updateContent,
            createContentPortal,
            appendPortalToDiv,
            removePortal,
            updateSelection,
            dehydratedHTML,
            resetPortalContainers,
            assignContentRef,
            buttonUpdateTrigger,
            triggerButtonUpdate
        } }, children));
}
function useEditableContentContext() {
    const context = (0, react_1.useContext)(exports.EditableContentContext);
    if (!context) {
        throw new Error("useEditableContentContext must be in EditableContentContextProvider");
    }
    return context;
}
