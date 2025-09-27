"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditTextButton;
const material_1 = require("@mui/material");
const react_1 = require("react");
const EditableContentContext_1 = require("./EditableContentContext");
const server_1 = require("react-dom/server");
const constants_1 = require("./utils/constants");
const checks_1 = require("./utils/checks");
const dom_operations_1 = require("./utils/dom_operations");
const selection_movements_1 = require("./utils/selection_movements");
/**
 * Takes a ReactNode and a dataKey and generates a
 * WrapperArgs object
 * @param rn
 * @param dataKey
 * @returns
 */
function reactNodeToWrapperArgs(rn, dataKey) {
    const element = reactNodeToElement(rn);
    if (!element)
        return { element: "" };
    let mappedAttributes = {
        'data-bk': dataKey
    };
    for (let attr of Array.from(element.attributes)) {
        if ((attr.name) === 'class' || (attr.name) === 'getContext')
            continue;
        if (attr.name === 'style') {
            // TODO: make style compatible for wrapperArgs search
            continue;
        }
        const attrName = attr.name;
        const attrValue = attr.value || '';
        mappedAttributes[attrName] = attrValue;
    }
    // set all react elements to unbreakable, might change this later
    const wrapperArgs = {
        element: element.tagName,
        classList: element.className ? element.className.split(" ") : [],
        id: element.getAttribute('id') || undefined,
        attributes: mappedAttributes,
        unbreakable: element.hasAttribute("data-unbreakable") || (0, checks_1.getIsReactComponent)(rn)
    };
    return wrapperArgs;
}
/**
 * If the window exists, generates an Element from
 * a given ReactNode. If the window does not exist,
 * returns null
 * @param reactNode
 * @returns
 */
function reactNodeToElement(reactNode) {
    const stringified = (0, server_1.renderToString)(reactNode);
    const parsedElement = (typeof window !== "undefined") ?
        new DOMParser().parseFromString(stringified, "text/html").body.children[0] :
        null;
    return parsedElement;
}
function EditTextButton(_a) {
    var _b;
    var { isMUIButton, dataKey, children, selectedVariant, deselectedVariant, selectCallback, deselectCallback } = _a, remainderProps = __rest(_a, ["isMUIButton", "dataKey", "children", "selectedVariant", "deselectedVariant", "selectCallback", "deselectCallback"]);
    const { contextInstanceIdRef, hasSelection, selectionAnchorNode, selectionAnchorOffset, selectionFocusNode, selectionFocusOffset, keyAndWrapperObjs, contentRef, updateContent, createContentPortal, portals, removePortal, buttonUpdateTrigger, triggerButtonUpdate } = (0, EditableContentContext_1.useEditableContentContext)();
    const [selected, setSelected] = (0, react_1.useState)(false);
    const [enabled, setEnabled] = (0, react_1.useState)(false);
    const [beingClicked, setBeingClicked] = (0, react_1.useState)(false);
    const thisKeyAndWrapperRef = (0, react_1.useRef)(keyAndWrapperObjs.find(kw => kw.dataKey === dataKey));
    const wrapperRef = (0, react_1.useRef)((_b = thisKeyAndWrapperRef === null || thisKeyAndWrapperRef === void 0 ? void 0 : thisKeyAndWrapperRef.current) === null || _b === void 0 ? void 0 : _b.wrapper);
    const isReactComponentRef = (0, react_1.useRef)(wrapperRef.current ? (0, checks_1.getIsReactComponent)(wrapperRef === null || wrapperRef === void 0 ? void 0 : wrapperRef.current) : false);
    // get wrapperArgs
    const wrapperArgsRef = (0, react_1.useRef)(reactNodeToWrapperArgs(wrapperRef.current, dataKey));
    const queryRef = (0, react_1.useRef)((0, dom_operations_1.generateQuery)(wrapperArgsRef.current));
    // on selection change
    (0, react_1.useEffect)(function () {
        const selection = window.getSelection();
        // disable button if div doesn't have selection and button is not actively being clicked
        if (!hasSelection && !beingClicked) {
            setSelected(false);
            setEnabled(false);
        }
        else {
            const status = (0, checks_1.getButtonStatus)(selection, wrapperArgsRef.current.unbreakable, queryRef.current, contentRef.current);
            setSelected(status.selected);
            setEnabled(status.enabled);
        }
    }, [hasSelection, selectionAnchorNode, selectionAnchorOffset, selectionFocusNode, selectionFocusOffset, buttonUpdateTrigger]);
    /**
     * Handle moving out of React component (if range is collapsed and at
     * end) or removal of React component, including removal of portal,
     * promotion of children to div containing portal, marking that div
     * for deletion in EditableContent useEffect [portals]
     */
    const unwrapReactComponent = (0, react_1.useCallback)((selection, portalsState) => {
        const range = selection.getRangeAt(0);
        if (!selection.anchorNode || !contentRef.current)
            return;
        const targetDiv = (0, checks_1.getAncestorNode)(selection.anchorNode, "div[data-button-key]", contentRef.current);
        if (!targetDiv)
            return;
        const id = targetDiv.getAttribute('id');
        const key = id === null || id === void 0 ? void 0 : id.split(constants_1.PORTAL_CONTAINER_ID_PREFIX)[1];
        if (!key || key.length === 0)
            return;
        const targetPortal = portalsState.find(p => p.key === key);
        if (!targetPortal)
            return;
        if (targetPortal.children && range.toString().length === 0) {
            const childrenRange = new Range();
            childrenRange.setStart(targetDiv, 0);
            childrenRange.setEnd(targetDiv, targetDiv.childNodes.length);
            const textNodes = (0, checks_1.getAllTextNodes)([targetDiv]);
            const lastTextNode = (0, checks_1.getLastValidTextNode)(textNodes);
            const lastTextIndex = (0, checks_1.getLastValidCharacterIndex)(lastTextNode);
            // if at end of react component, break element at end
            if (range.startContainer === lastTextNode && range.startOffset >= lastTextIndex) {
                breakElementAtEnd(targetDiv, selection);
                return;
            }
        }
        // else - there is a target portal and range is over 1 or more characters
        const targetComponent = targetPortal.children;
        if (!targetComponent || !(0, react_1.isValidElement)(targetComponent))
            return;
        // target component exists, remove portal, copy children to targetDiv
        const children = targetComponent.props.children;
        const htmlChildren = (typeof children === "string") ?
            document.createTextNode(children) :
            reactNodeToElement(children);
        htmlChildren && targetDiv.appendChild(htmlChildren);
        removePortal(key);
        /**
         * mark targetDiv for cleanup, which will promote children in EditableContent
         * useEffect with portals dependency
         */
        targetDiv.setAttribute('data-mark-for-deletion', '');
    }, [removePortal]);
    /**
     * Handle moving out of unbreakable element (if range is collapsed
     * and at end) or promotion of children from unbreakable element.
     * Assumes that range's lowest ancestor element is the element to
     * unwrap, requires caution when calling
     */
    const unwrapUnbreakableElement = (0, react_1.useCallback)((selection) => {
        if (!contentRef.current)
            return;
        const range = selection.getRangeAt(0);
        const element = (0, checks_1.getRangeLowestAncestorElement)(range);
        if (element) {
            const elementRange = new Range();
            elementRange.setStart(element, 0);
            elementRange.setEnd(element, element.childNodes.length);
            (0, selection_movements_1.resetRangeToTextNodes)(elementRange);
            const childNodes = (0, checks_1.getRangeChildNodes)(elementRange, contentRef.current);
            const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE);
            // handle break off from end of element
            if (range.toString().length === 0) {
                const lastTextNode = (0, checks_1.getLastValidTextNode)(textNodes);
                const lastTextIndex = (0, checks_1.getLastValidCharacterIndex)(lastTextNode);
                if (range.startContainer === lastTextNode && range.startOffset >= lastTextIndex) {
                    breakElementAtEnd(element, selection);
                    return;
                }
            }
            // else - selection is not at end of element
            const startNodeIndex = childNodes.findIndex(cn => cn === range.startContainer);
            const startNodeOffset = range.startOffset;
            const endNodeIndex = childNodes.findIndex(cn => cn === range.endContainer);
            const endNodeOffset = range.endOffset;
            const parentNode = element.parentNode;
            for (let i = 0; i < childNodes.length; i++) {
                parentNode === null || parentNode === void 0 ? void 0 : parentNode.insertBefore(childNodes[i], element);
                if (i === startNodeIndex) {
                    range.setStart(childNodes[i], startNodeOffset);
                }
                if (i === endNodeIndex) {
                    range.setEnd(childNodes[i], endNodeOffset);
                }
            }
            parentNode === null || parentNode === void 0 ? void 0 : parentNode.removeChild(element);
            updateContent();
            (0, selection_movements_1.resetSelectionToTextNodes)();
            return;
        }
    }, [updateContent]);
    /**
     * Move selection out of end of targetElement and into next
     * text node if it exists, and if it does not exist, creates
     * it.
     */
    const breakElementAtEnd = (0, react_1.useCallback)((targetElement, selection) => {
        var _a, _b;
        if (!contentRef.current)
            return;
        const childrenRange = new Range();
        childrenRange.setStart(targetElement, 0);
        childrenRange.setEnd(targetElement, targetElement.childNodes.length);
        const textNodes = (0, checks_1.getAllTextNodes)([targetElement]);
        if (targetElement.nextSibling && targetElement.nextSibling.nodeType === Node.TEXT_NODE) {
            (0, selection_movements_1.moveSelection)(selection, contentRef.current, "right");
        }
        else {
            const newEmptyTextNode = new Text('\u200B\u200B');
            if (targetElement.nextSibling) {
                contentRef.current.insertBefore(newEmptyTextNode, targetElement.nextSibling);
            }
            else {
                contentRef.current.append(newEmptyTextNode);
            }
            (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.setBaseAndExtent(newEmptyTextNode, 1, newEmptyTextNode, 1);
        }
        /**
         * get new selection, make sure it starts with zero width space
         * if not, add it, put selection after zero width space)
         */
        if (!(selection === null || selection === void 0 ? void 0 : selection.anchorNode))
            return;
        // if selection is still inside of element, - end of text
        if (textNodes.includes(selection.anchorNode)) {
            const newRange = new Range();
            newRange.setStartAfter(targetElement);
            newRange.collapse();
            const newTextNode = document.createTextNode("\u200B\u200B");
            newRange.insertNode(newTextNode);
            // directly set new selection
            (_b = window.getSelection()) === null || _b === void 0 ? void 0 : _b.setBaseAndExtent(newTextNode, 1, newTextNode, 1);
        }
        // make sure next text node starts with zero width space
        if (selection.anchorNode.textContent != null && (selection.anchorNode.textContent.length == 0 ||
            !selection.anchorNode.textContent[0].match("\u200B"))) {
            selection.anchorNode.nodeValue = "\u200B" + selection.anchorNode.textContent;
            selection.setBaseAndExtent(selection.anchorNode, 1, selection.anchorNode, 1);
        }
        return;
    }, []);
    /**
     * Handler for all button clicks for wrapping and unwrapping text
     * with React wrappers, non-React unbreakable wrappers, and standard
     * wrappers
     */
    const handleEditTextButtonClick = (0, react_1.useCallback)((portalArray, isSelected) => {
        var _a;
        if (!wrapperRef.current)
            return;
        const selection = window.getSelection();
        if (selection) {
            if (isSelected) {
                // selected - this action should unwrap
                if (isReactComponentRef.current) {
                    unwrapReactComponent(selection, portalArray);
                }
                else if (!isReactComponentRef.current) {
                    if (wrapperArgsRef.current.unbreakable) {
                        const originalRange = selection.getRangeAt(0); // pre unwrap selection for comparison
                        unwrapUnbreakableElement(selection);
                        // update button status if selection does not change
                        const newRange = selection.getRangeAt(0);
                        if (originalRange == newRange) {
                            triggerButtonUpdate();
                        }
                    }
                    else if (!wrapperArgsRef.current.unbreakable) {
                        const originalRange = selection.getRangeAt(0); // pre unwrap selection for comparison
                        (0, dom_operations_1.unwrapSelectionFromQuery)(selection, queryRef.current, contentRef.current); // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                        // update button status if selection does not change
                        const newRange = selection.getRangeAt(0);
                        if (originalRange == newRange) {
                            triggerButtonUpdate();
                        }
                    }
                    updateContent();
                }
                if (deselectCallback) {
                    deselectCallback();
                }
            }
            else if (!selected) {
                // not selected - this action should wrap
                if (isReactComponentRef.current) {
                    // if isReactComponent, can assert wrapperInstructions as ReactElement
                    const portalId = createContentPortal(wrapperRef.current, dataKey);
                    if (selectCallback) {
                        selectCallback(wrapperRef.current, portalId);
                    }
                }
                else if (!isReactComponentRef.current) {
                    const wrapper = (0, dom_operations_1.createWrapper)(wrapperArgsRef.current, document);
                    (0, dom_operations_1.wrapInElement)(selection, wrapper, contentRef.current);
                    // make sure all text nodes are cushioned, reset range to include ZWSs
                    const textNodes = (0, checks_1.getAllTextNodes)([wrapper]);
                    textNodes.forEach(tn => (0, dom_operations_1.cushionTextNode)(tn));
                    const range = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0);
                    range === null || range === void 0 ? void 0 : range.setStart(textNodes[0], 0);
                    const lastTextNode = textNodes[textNodes.length - 1];
                    range === null || range === void 0 ? void 0 : range.setEnd(lastTextNode, lastTextNode.length);
                    updateContent();
                    if (selectCallback) {
                        selectCallback(wrapper);
                    }
                }
            }
        }
        // if no selection, no click handler
    }, [wrapperRef, wrapperArgsRef, queryRef, contentRef, isReactComponentRef, createContentPortal, updateContent]);
    if (!wrapperRef.current)
        return;
    return (isMUIButton ?
        <material_1.Button disabled={!enabled} onMouseDown={() => {
                // prevent !hasSelection from blocking button's ability to click
                setBeingClicked(true);
            }} onClick={(e) => {
                handleEditTextButtonClick(portals, selected);
                setBeingClicked(false);
            }} variant={selected ?
                (selectedVariant || "contained") :
                (deselectedVariant || "outlined")} 
        // Only pass valid MUI Button props here
        data-context-id={contextInstanceIdRef.current} {...remainderProps}>
        {children}
      </material_1.Button> :
        <button disabled={!enabled} onMouseDown={() => {
                // prevent !hasSelection from blocking button's ability to click
                setBeingClicked(true);
            }} onClick={() => { handleEditTextButtonClick(portals, selected); }} data-context-id={contextInstanceIdRef.current} {...remainderProps}>
        {children}
      </button>);
}
