# Actual README

How to use:

### EditableContent

EditableContent is the root component from which everything else flows. EditableContent takes two props: 

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
      - Beyond this, all properties that you pass will be treated as props for an MUI Button (if isMUIButton is true) or an HTML Button, and the TypeScript allowed properties will reflect that decision. The one exception to this is the "variant" prop, which is not accepted, but is replaced with the "selectedVariant" and "deselectedVariant" props.

#### Unbreakable Elements

There are elements which you can assign the "unbreakable" attribute to, which generally means that those elements are not to be affected by other selections and deselections but are rather distinct blocks. Here are the basic rules:


  - If a selection is created which covers all or part of an unbreakable element in addition to other text outside of the unbreakable element, the wrap operation will not affect the unbreakable element or any of its contents
  - An unbreakable element cannot be created over or within other elements- if there are any nodes in the range which are not text nodes, the option to create an unbreakable element is removed. 
  - If a selection is fully inside of an unbreakable element, toggling the unbreakable button will remove the entire unbreakable element, promoting the contained text



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
