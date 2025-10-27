See demo at [https://editable-content.vercel.app/](https://editable-content.vercel.app/)
See full documentation at [https://editable-content.vercel.app/documentation](https://editable-content.vercel.app/documentation)



editable-content is a collection of components and context to give developers the ability to create limited rich-text editors, including React components to wrap text. At a high level, there are four basic components:

- An `EditableContentContextProvider`, which must be an ancestor to the other components.
- An `EditableContent` component in which a user can write, delete, and edit text
- One or more `EditTextButton` components, which provide the ability to add, remove, and break text wrappers within an `EditableContent` component
- A `RenderedContent` component, which is a non-editable version of `EditableContent`

Only one `EditableContent` or `RenderedContent` should be rendered at a time per instance of `EditableContentContextProvider`.


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