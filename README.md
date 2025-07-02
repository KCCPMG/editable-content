# Actual README

How to use:

### EditableContentContextProvider

The EditableContentContextProvider *must* be rendered as an ancestor to the EditableContent component. It does not take any props on its own, but will hold all the relevant state that the EditableContent depends on. All of this can be accessed through the useEditableContentContext hook.

### useEditableContentContext

useEditableContentContext is a simple custom hook which exposes the context at work in the EditableContentContextProvider component, and is the same hook which is used by the EditableContent component itself. The following are the properties which can be extracted from `useEditableContentContext()`

  - contentRef: MutableRefObject<HTMLDivElement | null>
    - The contentRef is a ref object which in this case is assigned to the contenteditable div at the heart of EditableContent. It is inadvisable to do anything with this, as it may adversely affect the functionality of the component
  - contentRefCurrentInnerHTML: string
    - Stringified HTML representing the content of the contenteditable div, and should update on all changes.
  - setContentRefCurrentInnerHTML: Dispatch<SetStateAction<string>>
    - The setter for contentRefCurrentInnerHTML and can be accessed directly, but is also called by EditableComponent on normal changes to the content of 
  - selectionToString: string,
    - If the window's selection is inside of the contentRef, this is the textContent (no markup) of the selectionn
  - setSelectionToString: Dispatch<SetStateAction<string>>
    - The setter for selectionToString, which is called when a selection is made within the contentRef
  - selectionAnchorNode: Node | null,
    - When the selection is within the contentRef, this is the selection's anchor node. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionAnchorNode: Dispatch<SetStateAction<Node | null>>
    - Setter for the selection anchor node
  - selectionAnchorOffset: number | null,
    - When the selection is within the contentRef, this is the selection's anchor offset. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionAnchorOffset: Dispatch<SetStateAction<number | null>>
    - Setter for the selection anchor offset
  - selectionFocusNode: Node | null, 
    - When the selection is within the contentRef, this is the selection's focus node. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionFocusNode: Dispatch<SetStateAction<Node | null>>
    - Setter for the selection focus node
  - selectionFocusOffset: number | null, 
    - When the selection is within the contentRef, this is the selection's focus offset. This is primarily used internally to trigger state updates when the selection changes.
  - setSelectionFocusOffset: Dispatch<SetStateAction<number | null>>
    - Setter for the selection focus offset
  - hasSelection: boolean,
    - A boolean representing if the window's selection is within the contentRef
  - setHasSelection: Dispatch<SetStateAction<boolean>>
    - The setter for hasSelection, which is called when the the contentRef's focus and blur events fire
  - portals: Array<ReactPortal>,
    - 
  - setPortals: Dispatch<SetStateAction<Array<ReactPortal>>>
    -
  - portalsState: {[key: string]: any},
    -
  - setPortalsState: Dispatch<SetStateAction<{[key: string]: any}>>
    -
  - mustReportState: {[key: string]: boolean}, 
    -
  - setMustReportState: Dispatch<SetStateAction<{[key: string]: any}>>
    -
  - divToSetSelectionTo: HTMLElement | null,
    -
  - setDivToSetSelectionTo: Dispatch<SetStateAction<HTMLElement | null>>
    -
  - getDehydratedHTML: (callback: (dehydratedHTML: string) => void) => void
    -

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


# Next.js Boilerplate

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
