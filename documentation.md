- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [EditableContentContextProvider](#editablecontentcontextprovider)
  - [Populating Wrappers](#populating-wrappers)
  - [Defining Your Own React Component Wrappers](#defining-your-own-react-component-wrappers)
    - [Marking Content for Exclusion](#marking-content-for-exclusion)
    - [A Note On Contexts Used By Wrappers](#a-note-on-contexts-used-by-wrappers)
  - [useEditableContentContext](#useeditablecontentcontext)
- [EditableContent](#editablecontent)
  - [A Note on EditableContent Rendering](#a-note-on-editablecontent-rendering)
- [RenderedContent](#renderedcontent)
- [EditTextButton](#edittextbutton)
  - [Basic Rules for EditTextButton Behavior](#basic-rules-for-edittextbutton-behavior)
  - [Special Rules for Unbreakable Elements](#special-rules-for-unbreakable-elements)
  - [EditTextButton Props](#edittextbutton-props)
- [Browser Behavior and Text](#browser-behavior-and-text)
- [Known Issues](#known-issues)

## Introduction

editable-content is a collection of components and context to give developers the ability to create limited rich-text editors, including React components to wrap text. At a high level, there are four basic components:

- An `EditableContentContextProvider`, which must be an ancestor to the other components.
  
- An `EditableContent` component in which a user can write, delete, and edit text
  
- One or more `EditTextButton` components, which provide the ability to add, remove, and break text wrappers within an `EditableContent` component
  
- A `RenderedContent` component, which is a non-editable version of `EditableContent`

Only one `EditableContent` or `RenderedContent` should be rendered at a time per instance of `EditableContentContextProvider`.


## Getting Started

To view the package on npm, visit [https://www.npmjs.com/package/@kccpmg/editable-content](https://www.npmjs.com/package/@kccpmg/editable-content). To install:

```
npm install @kccpmg/editable-content
```

Basic Example:

```
function EditableContentExample() {

  const editing = useState<boolean>(true);

  const keyAndWrapperObjs = [
    {
      dataKey: "strong",
      wrapper: <strong></strong>
    }
  ];

  return (
    <EditableContentContextProvider keyAndWrapperObjs={keyAndWrapperObjs}>
      {editing ? (
        <>
          <EditTextButton dataKey="strong">
            B
          </EditTextButton>
          <EditableContent />
        </>
      ) :
        <RenderedContent />
      }
    </EditableContentContextProvider>
  )
}

```


## EditableContentContextProvider

The `EditableContentContextProvider` *must* be rendered as an ancestor to the EditableContent component. It takes only one prop (see Defining Your Own Wrappers) and will hold all the relevant state that the `EditableContent` and `RenderedContent` depend on. `EditableContentContextProvider` takes four props:

- `children`: ReactNode, standard use of children in a React context
  
- `keyAndWrapperObjs`: An array of type `KeyAndWrapperObj`, which are the options for a user to wrap their text with. See "Defining Your Own React Component Wrappers" below
  
- `initialHTML`: (optional) string, which will be the HTML which initially populates an `EditableContent` or `RenderedContent` instance 

- `initialProps`: (optional) object of which each key corresponds to a portalId, and the value is an object of props with new values. For an example of this object, see `updatePortalProps` in the `useEditableContentContext` section. When a portal is first created, its React component will populate with props from this object if there is a corresponding portalId that contains props to pass in.

### Populating Wrappers

A `KeyAndWrapperObj` is an object to be defined which will correspond to a text wrapper 
To make a wrapper available to your provider, it must be passed to the EditableContentContext in the prop `keyAndWrapperObjs`. This prop takes an array of objects, each of which represents a wrapper and has two key/value pairs:

```
type KeyAndWrapperObj = {
  dataKey: string
  wrapper: React.ReactElement,
}
```

In order to function properly, the value passed to `dataKey` must be unique among the objects in the array. Because the `wrapper` value must be a `React.ReactElement`, note that this can be either a functional React component or a simple (not nested) html wrapper. As for what is necessary for React wrappers, more on that next.

### Defining Your Own React Component Wrappers

As a part of the rendering process, there are several props which will be passed to each React wrapper automatically, and should be included in the Type definition of your wrapper's Props. Those props are the following:

- `portalId`: the id of the portal to which the wrapper will be appended
  
- `getContext`: a function which will be passed to your rendered wrapper automatically and will return the `EditableContentContextProvider`'s value, similar to `useEditableContentContext` (more on that later)
  
  - **IMPORTANT:** Do NOT call `useEditableContentContext` in the body of your wrapper. Because wrappers are passed as props to the `EditableContentContextProvider`, they do not *initially* render as descendants of `EditableContentContextProvider`, and as such, this will cause an error with `useEditableContentContext` checking for a safe context. Call `getContext` instead. (For more on this issue, see "A Note On Contexts Used By Wrappers" below)
  
- `children`: ReactNode, standard use of children in a React context

When declaring the PropTypes for your wrappers, make sure that any of the above props which you wish to access are declared as optional. Inside the component, make sure that any access of these props is conditional and safe. 

#### Marking Content for Exclusion

When you 'unwrap' text from a React component, the process that is happening is that all of the text of that component is being extracted, the component is deleted, and then the text is put back in its correct place. For most purposes, this is fine for a text decoration, but there may be times where your React component aims to add text as part of the React component itself. For example, if you have a React component meant for a user to decree that text in a certain place is a name, you might have the following set of actions for a hypothetical app:

- A user types some text 'Alan Turing' into an `EditableContent` component
  
- The user, following the logic flow of the app, wants to indicate that this is a name
  
- The user selects the text 'Alan Turing' and then clicks the 'NAME' `EditTextButton`
  
- Clicking the button creates a React component which puts 'Alan Turing' into a div, but also adds the preceding text 'NAME:', so the total text content of the React component is now 'NAME: Alan Turing'
  
- The user decides they are done with the text, so they click a button which removes the `EditableContent` instance and replaces it with a `RenderedContent` instance. The React component's text is removed, the component is destroyed, and then the component is re-rendered in the `RenderedContent` instance. However, because the component is rendering the text 'NAME' as a precedent to the text that it will receive, the full text of the component will now be 'NAME: NAME: Alan Turing'

-OR-

- If instead of rendering the text, the user instead decides they made a mistake and click the 'NAME' button again to remove the decoration, the React component will be removed, but the text 'NAME: Alan Turing' will then be rendered as plain text in its place.

This is obviously undesired behavior, but the `EditableContentContextProvider` can check for content which it should not "count" when it is removing a React component. The solution is that any html element which contains content which should not be factored in should be given the 'data-exclude-from-dehydrated' attribute. This is also exported from `utils/constants` as `EXCLUDE_FROM_DEHYDRATED`. Here is an example from the `PropfulBox` component in the demo site's "Propful Only" example:

```
return (
  <Box    
    onClick={increaseClicks} 
    {...rest}
  >
    <span 
      {...{[EXCLUDE_FROM_DEHYDRATED]: ""}}
    >
      {clickCount}&nbsp;
    </span>
    {children}
  </Box>
)
```
In this example, the clickCount is increased by clicking on the box and is rendered dynamically, but rendering the text or unwrapping the text from the React component will *not* cause the clickCount to be rendered as text.


#### A Note On Contexts Used By Wrappers

When a wrapper is passed to the `keyAndWrapperObjs` array it is initially called as a function at that level, meaning it will not initially have access to any context which is a descendant of the `EditableContentContextWrapper`. 

For example: 

```
function MyWrapper() {
  const { myContextValue } = useContext(MyContext)
}

<EditableContentContextProvider
  keyAndWrapperObjs={[
    dataKey: "my-wrapper",
    wrapper: <MyWrapper />
  ]}
>
  <MyContextProvider>
    <EditableContent />
  </MyContextProvider>
</EditableContentContextProvider>
```

This will fail, because even though `MyWrapper` will only be rendered to the DOM within the `EditableContent`, which itself is within `MyContextProvider`, the initial call of the function is *outside* the scope of `MyContextProvider`

In order to use context, you can do one of two things. The first of which is to make all calls to context safe by using default destructuring logic, as below: 

```
function MyWrapper() {
  const { myContextValue = 0 } = useContext(MyContext)
}

```

The second option is to simply change the order in which the context providers render, so that `MyWrapper` is called within the scope of `MyContextProvider` from the beginning:

```
function MyWrapper() {
  const { myContextValue } = useContext(MyContext)
}

<MyContextProvider>
  <EditableContentContextProvider
    keyAndWrapperObjs={[
      dataKey: "my-wrapper",
      wrapper: <MyWrapper />
    ]}
  >
    <EditableContent />
  </EditableContentContextProvider>
</MyContextProvider>
```


### useEditableContentContext

`useEditableContentContext` is a simple custom hook which exposes the context at work in the EditableContentContextProvider component, and is the same hook which is used by the `EditableContent` and `RenderedContent` components themselves. If `EditableContentContext` is not found at the time that `useEditableContentContext` is called, it will throw an error. For that reason, it must not be used in your wrappers (as per "A Note on Contexts Used By Wrappers" above). However, this context can be consumed within your wrappers by using the `getContext` function.

Additionally, there may be other components you may wish to use within the scope of `EditableContentContextProvider` for the purposes of viewing or extracting data from the Provider. For example, you may wish to extract the `dehydratedHTML` for the purposes of processing, saving to a database, sending an API request, etc.

The following are the properties which can be extracted from `useEditableContentContext`

- `contextInstanceIdRef`: MutableRefObject<string>
  - This is a ref, the current value of which is a unique string which ties together the Provider with EditTextButtons and EditableContent to keep the `hasSelection` state from being set to false when an `EditTextButton` is clicked corresponding to that Provider. Note that there are known issues with this in strict mode/development, see "Known Issues" below. 
  
- `contentRef`: MutableRefObject<HTMLDivElement | null>
  - The contentRef is a ref object which corresponds to the `EditableContent` or `RenderedContent` div which is being rendered to the DOM. This assignment is handled automatically by those components, and is one of several reasons why only one instance of `EditableContent` or `RenderedContent` should ever be rendered per `EditableContentContextProvider` at a time.
  
- `contentRefCurrentInnerHTML`: string
  - Stringified HTML representing the content of the `EditableContent` or `RenderedContent` div, and should update on all changes.
  
- `setContentRefCurrentInnerHTML`: Dispatch<SetStateAction<string>>
  - The setter for `contentRefCurrentInnerHTML` and can be accessed directly, but is also called by `EditableContent` or `RenderedContent` naturally as the HTML is changed (by user input or hydration of React components).
  
- `selectionToString`: string
  - If the window's selection is inside of the contentRef, this is the `textContent` (no markup) of the selection.
  
- `setSelectionToString`: Dispatch<SetStateAction<string>>
  - The setter for selectionToString, which is called when a selection is made within the `EditableContent` div.
  
- `selectionAnchorNode`: Node | null
  - When the selection is within the `EditableContent` div, this is the selection's anchor node. This is primarily used internally to trigger state updates when the selection changes.
  
- `setSelectionAnchorNode`: Dispatch<SetStateAction<Node | null>>
  - Setter for the selection anchor node, called automatically by a 'selectionchange' handler assigned to the document when `EditableContent` is rendered.
  
- `selectionAnchorOffset`: number | null
  - When the selection is within the `EditableContent` div, this is the selection's anchor offset. This is primarily used internally to trigger state updates when the selection changes.
  
- `setSelectionAnchorOffset`: Dispatch<SetStateAction<number | null>>
  - Setter for the selection anchor offset, called automatically by a 'selectionchange' handler assigned to the document when `EditableContent` is rendered.

- `selectionFocusNode`: Node | null 
  - When the selection is within the `EditableContent` div, this is the selection's focus node. This is primarily used internally to trigger state updates when the selection changes.
  
- `setSelectionFocusNode`: Dispatch<SetStateAction<Node | null>>
  - Setter for the selection focus node, called automatically by a 'selectionchange' handler assigned to the document when `EditableContent` is rendered.

- `selectionFocusOffset`: number | null
  - When the selection is within the `EditableContent` div, this is the selection's focus offset. This is primarily used internally to trigger state updates when the selection changes.

- `setSelectionFocusOffset`: Dispatch<SetStateAction<number | null>>
  - When the selection is within the `EditableContent` div, this is the selection's focus offset. This is primarily used internally to trigger state updates when the selection changes.
  
- `hasSelection`: boolean,
  - A boolean representing if the window's selection is within the `EditableContent` div.
  
- `setHasSelection`: Dispatch<SetStateAction<boolean>>
  - The setter for hasSelection, which is called when the the contentRef's focus and blur events fire.

- `portals`: Array<ReactPortal>
  - This is the array of ReactPortals which are appended to specific divs in the contentRef. These ReactPortals are directly rendered into the contentRef, and each portal has a key (referred to as the portalId) which is the unique id of the portal.

- `setPortals`: Dispatch<SetStateAction<Array<ReactPortal>>>
  - This is the setter for portals and is called directly only in `EditableContentContextProvider`, but is also called in other functions which are included in `EditableContentContext`.
  
- `divToSetSelectionTo`: HTMLElement | null
  - This is a div within the `EditableContent` div that should be selected by `window.getSelection()` and represents a div which has (or is about to have) a portal appended to it.
  
- `setDivToSetSelectionTo`: Dispatch<SetStateAction<HTMLElement | null>>
  - The setter for `divToSetSelectionTo` which is called inside of the `createContentPortal` function in `EditableContentContextProvider`.
  
- `prepareDehydratedHTML`: (callback: (dehydratedHTML: string) => void) => void
  - This is a helper function which takes the `contentRefCurrentInnerHTML` and converts it into dehydrated html (all html added by React component wrappers removed), and then passes the dehydrated html to a callback taken as an argument. Internally, this is used to keep `dehydratedHTML` up to date by calling `prepareDehydratedHTML(setDehydratedHTML)` whenever the `contentRefCurrentInnerHTML` is changed. Generally, using `dehydratedHTML` directly will likely suit your purposes. 
  
- `updatePortalProps`: (updateObj: PortalProps) => void
  - This is a function for updating one or more props passed to the portals rendered in `EditableContent` or `RenderedContent`. The function takes an `updateObj` of which each key corresponds to a portalId, and the value is an object of props with new values. For example:
  ```
  {
    'some-portal-id': {
      'first-prop-to-update': newPropValue,
      'second-prop-to-update': newPropValue
    },
    'other-portal-id': {
      'first-prop-to-update': newPropValue
    }
  }
  ```  
  - Each specified portalId will have its portal in `portals` replaced with a clone of itself with the new values for any prop(s) specified. Portals which are not specified with a portalId will not be changed, and portals which are being changed do not need all props to be specified, the only changes that will be made will be the ones to explicitly included props. From the demo, here's an example of changing the props for all portals which the `data-button-key`/`dataKey` of 'propful-only':
  ```
  // on componentBorderColor change, updatePortalProps
  useEffect(function() {
    if (!contentRef.current) return;
    const divs = Array.from(contentRef.current.querySelectorAll("div[data-button-key='propful-only']"));
    const keys = divs.map(div => div.getAttribute('id')?.split("portal-container-")[1]);

    const updateObj = Object.assign({}, ...keys.map(key => {
      if (typeof key != "string") return {};
      // else
      return {[key]: {borderC: componentBorderColor}}
    }))

    updatePortalProps(updateObj);
  }, [componentBorderColor])
  ```

- `getAllPortalProps`: () => PortalProps
  - Goes through the portals state and returns an object where the key is the portalId of a portal and the value is an object containing all props.

- `keyAndWrapperObjs`: Array<KeyAndWrapperObj>
  - This is the same as the prop which is passed to `EditableContentContextProvider`.

- `updateContent`: () => void
  - A function for re-formatting the `contentRef.current` div to keep it consistent with regard to text nodes, cleaning up empty elements, resetting the selection, passing the re-formatted HTML to `setContentRefCurrentInnerHTML`, and then re-establishing focus on `contentRef.current`.

- `createContentPortal`: (component: ReactElement, buttonKey: string) => string | undefined

  - A function which creates a portalId, a div which will house a ReactPortal, a ReactPortal for the passed in component, and extracts any selected text to be passed as a child to the component. This is exposed as a part of the context and is used internally, but is not recommended for direct use.

- `appendPortalToDiv`: (containingDiv: HTMLDivElement) => void
  - A function which creates a React component and the ReactPortal which it will belong to, extracts the text from the containingDiv and passes it to the component, and attaches the ReactPortal to the containingDiv. This is exposed as a part of the context and is used internally, but is not recommended for direct use.

- `removePortal`: (key: string) => void
  - Given a key, finds the portal with that portalId and removes it from portals.

- `updateSelection`: () => void
  - Resets the scroll of the `contentRef.current` div, gets the current selection, and if it is within `contentRef.current`, resets all of the state related to the selection (`setAnchorNode`, `setAnchorOffset`, etc.).

- `dehydratedHTML`: string
  - The inner HTML of `contentRef.current` stripped of all content which is marked as needing to be excluded from dehydrated, as well as all non-text nodes within a portal containing div. This is effectively the HTML with all React markup removed.
  
- `resetPortalContainers`: () => void
  - This function resets the portals by extracting the text from the portal containing divs, passing it to the cloned components and reestablishing the portals with their containing divs. This is used in both `EditableContent` and `RenderedContent` to hydrate with React when the `portals` state is already populated.

- `assignContentRef`: (newRef: null | HTMLDivElement) => void
  - This function assigns `contentRef.current` to the div which belongs to either `EditableContent` or `RenderedContent`.

- `buttonUpdateTrigger`: boolean
  - A boolean that is triggered when a button is clicked, simply to force the `EditableContentContext` to update its state. This may be removed in later updates.

- `triggerButtonUpdate`: () => void
  - Flips the value of `buttonUpdateTrigger` to force a state update. This may be removed in later updates.


## EditableContent

`EditableContent` is the component which houses the actual 'contenteditable' div. It takes only two props, both of which are optional:

- `className`: string
  - The className which will be passed to the div for any desired CSS styling. This is especially useful for determining scroll behavior.
  
- `disableNewLines`: boolean
  - If disableNewLines is true, pressing 'Enter' will prevent the default behavior of creating a `<br/>` element to add a new line in the div. This is useful for creating `<input>`-like fields which do not extend beyond one line.

The `EditableContent` component does not require anything beyond these props and being placed within the scope of an `EditableContentContextProvider`. Selection changes, portal hydration, etc. are handled internally. 

### A Note on EditableContent Rendering

`EditableContent` makes significant usage of `useEffect` to populate and update its text content, the selection, and React components. Because of the logic which operates directly on the DOM, 'strict mode' double-renders can cause DOM-modifying logic to restart before it's finished, resulting in the deletion of content. To counter this, there is a check within `EditableContent` to look at `process.env.NODE_ENV`, and if it is set to "development", the order of `useEffect` operations is altered to allow for the initial render to completely finish (both calls) before resuming the `useEffect` logic related to portals.

## RenderedContent

`RenderedContent` is effectively a pared-down version of `EditableContent`, because it renders the same way but has no logic for keyboard inputs or selection changes. It takes only one prop, which is optional:

- `className`: string
  
  - The className which will be passed to the div for any desired CSS styling. This is especially useful for determining scroll behavior.

`RenderedContent` is affected by the same logic as `EditableContent` when it comes to renders, see "A Note on EditableContent Rendering" above.

## EditTextButton

`EditTextButton` is the control used for wrapping and unwrapping selected text. Before getting into the component logic, it's important to understand how these buttons behave.

### Basic Rules for EditTextButton Behavior

- Each `EditTextButton` keeps track of the ReactElement wrapper to which it is assigned. 

- Each `EditTextButton` keep track of a query which corresponds to the ReactElement, the most significant part of which is the `data-bk` attribute.

- If *all* of the text in a selection is a descendant of one or more elements which match the query, the text is considered selected. If *none or only some of the text* in a selection matches the query, the text is not considered selected.

- If the text is considered selected, the button will appear to be clicked. If the text is not considered selected, the button will not appear clicked.

- If the focus is outside of the `EditableContent` or the selected text may not be clicked (for example it is inside of an unbreakable element), the button will be **disabled**.

- If a button is not clicked, clicking it will first remove all elements matching the query in the selection, then will wrap the entire selection in a newly created element.

- If a button is already clicked, clicking it will break up the surrounding element such that the selection will no longer be a part of an element which matches the query.

### Special Rules for Unbreakable Elements

Some elements are considered "unbreakable", which means that they are affected by specific rules. An element is "unbreakable" either because it is specifically declared as being unbreakable (by passing it the attribute `data-unbreakable=""`) or it is a React component. If an element is "unbreakable", the button will have slightly different behavior in some scenarios.

- No other element can exist within an unbreakable element, meaning that if the selection is within an unbreakable element, every `EditTextButton` will be disabled, except for the one pertaining to that element. This also means that if the selection includes *any* element in whole or in part, the `EditTextButton` for an unbreakable component will be disabled.

- If a selection is partially in an unbreakable element and partially outside of it, the `EditTextButton` for the unbreakable element will also be disabled.

- If a selection is inside of an unbreakable element, clicking the `EditTextButton` will **make the entire wrapper disappear,** and in the case of a React component, will delete the component and remove it from `portals`. The one exception to this is below.

- If a selection is inside of an unbreakable element and the cursor is collapsed and at the end of the text inside of the element, clicking the button will not affect the wrapper, but will move the cursor to the next available space after the wrapper. This is meant to intuitively follow as best as possible clicking a button to start a text style, then after finishing typing what should be in that style, "turning the style off" and continuing normally.

### EditTextButton Props

The `EditTextButton`, in addition to the props below, accepts any props from MaterialUI's `ButtonOwnProps` (except for 'color'), as well as any props from `React.ComponentPropsWithoutRef<'button'>`. All of these props will be passed automatically to the Button/button. Here are the additional explicit props:

- `isMUIButton?`: boolean
  - If this is set to true, `EditTextButton` will render as its base an MUI `Button` component instead of a plain `<button>`.
  
- `dataKey`: string
  - This is the key which must be the same as in one of the objects in the `KeyAndWrapperObj` which is passed as a prop to `EditableContentContextProvider`. This key is responsible for telling `EditTextButton` which wrapper it is responsible for assigning/removing.
  
- `children?`: ReactNode
  - The children of the button, ideally short text or an icon.
  
-  `selectedClassName?`: string
   - An optional prop which will add this string to the className if the button is selected.
  
-  `deselectedClassName?`: string
   -  An optional prop which will add this string to the className if the button is deselected.
  
- `selectedVariant?`: ButtonOwnProps["variant"]
  - An optional prop for use if `isMUIButton` is set to true. This will be the MUI variant the button takes on when the button is selected.
  
- `deselectedVariant?`: ButtonOwnProps["variant"]
  - An optional prop for use if `isMUIButton` is set to true. This will be the MUI variant the button takes on when the button is deselected.
  
- `selectCallback?`: htmlSelectCallback | reactSelectCallback
  - A function which will fire when the `EditTextButton` is clicked to become selected, to which the wrapper will be passed. If the wrapper is a React component, the portalId will be the second parameter passed to the function.
  
- `deselectCallback?`: () => void | undefined
  - A function which will fire when the `EditTextButton` is clicked to make text deselected. This function is not passed any argument.


## Browser Behavior and Text

By default, browsers take certain actions in managing white space and cursor placement, sometimes creating undesirable behavior. For example, typing in a given element, unwrapping the element, and then hitting the space bar would give the user an expectation of continuing to write in plain text from that point. However, Chrome will prevent this, because this would mean a new Text Node beginning with a space, which Chrome assumes is wrong, and so Chrome would extend the wrapper element over the cursor that the user just tried to break out of the previous wrapper.

As a result, a great deal of default behavior in using a contenteditable div has been overridden here.

- Pressing the spacebar will create a non-breaking space rather than a traditional space.
- Elements are padded with zero-width spaces so that the first and last character of text inside of any given element should both be zero-width spaces. These are being constantly managed by the processes involved in wrapping, unwrapping, and cleaning up text. Accordingly, these should not require any action from you in terms of getting these components to work correctly, but may require attention depending on how the actual content will be used in other parts of your application.
 

## Known Issues

- Undo
  - Undoing (Ctrl+Z / Cmd+Z) does not work as desired as virtually all keyboard inputs invoke e.preventDefault, which among other things, prevents those inputs from being added to the browser's undo cache.
  - In order to address this, it will likely be necessary to create a separate cache relative to each instance of `EditableContent` or `EditableContentContextProvider`.

- `data-context-id` assignment error in development mode
  - Upon loading in dev mode, an error is generated: ``Warning: Prop `data-context-id` did not match. Server: "some-uuid-value" Client: "some-other-uuid-value".`` It is unclear why this error is occurring, but it does not happen outside of development mode.
  - Additionally unknown at the time is why clicking a button does not set the `hasSelection` state to false, given that the `data-context-id` does not match the `contextInstanceIdRef.current` in strict/development mode, and this should result in a call to `setHasSelection(false)`.
  
- This package includes @mui/material and @emotion/styled as dependencies to enable MUIbuttons. Because this is a large addition in terms of bundle, this may be changed in the future to either a conditional import or the MUI-enabled EditTextButton removed and placed in a new package.


