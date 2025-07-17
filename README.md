# Overview

EditableContent is a collection of components and context to give developers the ability to create their own rich-text editors, including React components to wrap text. The basic gist is that an `EditableContentContextProvider` will be rendered at the top level, and then within, an `EditableContent` component which takes arguments for initialHTML and for the buttons that it will render. Using functions and values passed down from `EditableContentContextProvider`, it is possible for developers to dehydrate HTML and then rehydrate it to restore React wrappers through the provider's use of instances of `ReactPortal`.

How to use:

### EditableContentContextProvider

The EditableContentContextProvider *must* be rendered as an ancestor to the EditableContent component. It takes only one prop (see Defining Your Own Wrappers) and will hold all the relevant state that the EditableContent depends on. All of this can be accessed through the useEditableContentContext hook.





### Populating wrappers

To make a wrapper available to your provider, it must be passed to the EditableContentContext in the prop `keyAndWrapperObjs`. This prop takes an array of objects, each of which represents a wrapper and has two key/value pairs:

```
KeyAndWrapperObj = {
  dataKey: string,
  wrapper: React.ReactElement,
}
```

In this case the wrapper is JSX rendering a React component or HTML. More on React Wrappers next.


### Defining Your Own React Component Wrappers

As a part of the rendering process, there are several props which will be passed to each wrapper automatically and should not be passed into the wrapper declaration here. Those props are the following:

  - `portalId`: the id of the portal to which the wrapper will be appended
  - `getContext`: a function which will return the result of `useEditableContentContext`. **IMPORTANT:** Do NOT call `useEditableContentContext` in the body of your wrapper, as this will cause an error. Call `getContext` instead.
  - `children`: children is the reserved prop for the children this component will receive, all of which is handled for you as part of the portal creation process

When declaring the PropTypes for your wrappers, make sure that any of these values which you wish to access are declared as optional. Inside the component, make sure that any access of these props is conditional. When declaring your PropTypes, you should include the following:

 - `children?: React.ReactNode`
 - `[key: string]: any`

When passing props to your component in the return call, make sure to destructure `{...rest}` from your props, and then to pass `{...rest}` into the top level of the component. This will ensure that you can pass additional props through, and especially will pass through the `data-unbreakable` prop which is assigned behind the scenes.



### useEditableContentContext

useEditableContentContext is a simple custom hook which exposes the context at work in the EditableContentContextProvider component, and is the same hook which is used by the EditableContent component itself. The following are the properties which can be extracted from `useEditableContentContext()`

  - contentRef: MutableRefObject<HTMLDivElement | null>
    - The contentRef is a ref object which in this case is assigned to the contenteditable div at the heart of EditableContent. It is inadvisable to do anything with this, as it may adversely affect the functionality of the component
  - contentRefCurrentInnerHTML: string
    - Stringified HTML representing the content of the contenteditable div, and should update on all changes.
  - setContentRefCurrentInnerHTML: Dispatch<SetStateAction<string>>
    - The setter for contentRefCurrentInnerHTML and can be accessed directly, but is also called by EditableComponent on normal changes to the content of 
  - selectionToString: string
    - If the window's selection is inside of the contentRef, this is the textContent (no markup) of the selection
  - setSelectionToString: Dispatch<SetStateAction<string>>
    - The setter for selectionToString, which is called when a selection is made within the contentRef
  - selectionAnchorNode: Node | null
    - When the selection is within the contentRef, this is the selection's anchor node. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionAnchorNode: Dispatch<SetStateAction<Node | null>>
    - Setter for the selection anchor node
  - selectionAnchorOffset: number | null
    - When the selection is within the contentRef, this is the selection's anchor offset. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionAnchorOffset: Dispatch<SetStateAction<number | null>>
    - Setter for the selection anchor offset
  - selectionFocusNode: Node | null 
    - When the selection is within the contentRef, this is the selection's focus node. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionFocusNode: Dispatch<SetStateAction<Node | null>>
    - Setter for the selection focus node
  - selectionFocusOffset: number | null
    - When the selection is within the contentRef, this is the selection's focus offset. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionFocusOffset: Dispatch<SetStateAction<number | null>>
    - Setter for the selection focus offset
  - hasSelection: boolean,
    - A boolean representing if the window's selection is within the contentRef
  - setHasSelection: Dispatch<SetStateAction<boolean>>
    - The setter for hasSelection, which is called when the the contentRef's focus and blur events fire
  - portals: Array<ReactPortal>
    - This is the array of ReactPortals which are appended to specific divs in the contentRef. These portals are directly rendered into the contentRef, and each portal has a key which is the unique id of this portal   
  - setPortals: Dispatch<SetStateAction<Array<ReactPortal>>>
    - This is the setter for portals and is called within the EditableContent component
  - portalsState: {[key: string]: any}
    - This is an object that represents the individual state of each ReactPortal component rendered into the contentRef. This is a copy of that state, which is to say that it is downstream of those ReactPortals and the ReactPortals do not listen to this object. This is a means of being able to access the state for to perform other operations on or with for other parts in your app. In this object, the key represents the unique id which is assigned to the portal, so that portals and their state can be matched.
  - setPortalsState: Dispatch<SetStateAction<{[key: string]: any}>>
    - The setter for portalsState, which is called within EditableContent when ReactPortals are created or destroyed
  - mustReportState: {[key: string]: boolean} 
    - deprecated
  - setMustReportState: Dispatch<SetStateAction<{[key: string]: any}>>
    - deprecated
  - divToSetSelectionTo: HTMLElement | null
    - This is a div used in the internal logic for creating content portals
  - setDivToSetSelectionTo: Dispatch<SetStateAction<HTMLElement | null>>
    - The setter for divToSetSelectionTo, used internally and generally not necessary for you to use.
  - getDehydratedHTML: (callback: (dehydratedHTML: string) => void) => void
    - This is a helper function which is designed specifically for the developer to call. This prop takes a function that you will define, which will be passed the dehydratedHTML as an argument. The dehydratedHTML is the HTML of the contentRef with all of the ReactPortals removed and only the containing div and the textContent remaining. This is a means of being able to save the content that is created in EditableContent, as the dehydratedHTML can be passed as a prop to EditableContent, and assuming the `editTextButtons` are the same, the same hydrated React will be rendered.  
  - updatePortalProps: 

### EditableContent

EditableContent is the root component from which everything else flows. EditableContent takes four props: 

  - initialHTML: string
    - This is the initial HTML that will populate the contenteditable div at creation.
  - editTextButtons: Array<MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps>
    - Each object added here will render a MaterialUI Button or an HTML button. If you wish to use an MUI Button, set "isMUIButton" to true. If you set "isMUIButton" to false or do not include it, an HTML button will be rendered. 
    - Each object has several required properties:
      - dataKey: string
        - A unique string which will serve as the key for the renndered button as well as a way of retrieving text which has been put into a wrapper by that button (not yet implemented)
      - child: ReactNode
        - A single child which will be rendered as the child of the button. This is usually going to be an icon or a short string demonstrating what clicking the button will do to the selection
      - wrapperArgs: WrapperArgs
        - wrapperArgs is an object which must have a specified "element", which is a string corresponding to the type of element being created (i.e. "span", "i", "strong", etc.) A classList or id can also be included but are not necessary
      - selectCallback: a callback function that will be run when clicking the button to wrap a section of text. This callback will not receive any arguments, but there is nothing in the flow between the button click to the point of calling the callback will change the value of window.getSelection(). This can be helpful for performing operations which will need to provide other information to the wrapper element. For example, a common use case would be adding a dialog which will give the user the opportunity to type in what url will be used for the href property of an anchor tag. It is recommended that when an operation such as this concludes, the logic should *reset the selection* to what it was at the time of the button click, but the execution of this as well as the decision to do so is at your discretion.
      - deselectCallback: The same as selectCallback but when the button click leads to a text unwrap operation rather than a wrap.
      - Beyond this, all properties that you pass will be treated as props for an MUI Button (if isMUIButton is true) or an HTML Button, and the TypeScript allowed properties will reflect that decision. The one exception to this is the "variant" prop, which is not accepted, but is replaced with the "selectedVariant" and "deselectedVariant" props.


#### Unbreakable Elements

There are elements which you can assign the "unbreakable" attribute to, which generally means that those elements are not to be affected by other selections and deselections but are rather distinct blocks. Here are the basic rules:


  - If a selection is created which covers all or part of an unbreakable element in addition to other text outside of the unbreakable element, the wrap operation will not affect the unbreakable element or any of its contents
  - An unbreakable element cannot be created over or within other elements- if there are any nodes in the range which are not text nodes, the option to create an unbreakable element is removed. 
  - If a selection is fully inside of an unbreakable element, toggling the unbreakable button will remove the entire unbreakable element, promoting the contained text. If a selection is at the end of an unbreakable element, the unbreakable element will exist as is and the cursor going forward will not be part of that element.



# Outline

The goal of this is to create a rich text editor which will have the following

- a div which is contenteditable
- a row of buttons which contain the text decoration controls

## Just cursor

- When the cursor is in plain text
  - None of the buttons appear clicked
  - Clicking a button will wrap the cursor in the appropriate element

- When the cursor is in decorated text
  - The button(s) corresponding to that decoration will appear clicked
  - Clicking a button will break the decoration so that the cursor is in between the decorative tags

## Selection

...tbd
