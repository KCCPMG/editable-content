import Link from "next/link";


export default function Contents() {

  return (
    <>
      <ul>
        <li>
          <Link href="#editablecontent">
            EditableContent
          </Link>
        </li>
        <ul>
          <li>
            <Link href="#editablecontentcontextprovider">
              EditableContentContextProvider
            </Link>
          </li>
          <li>
            <Link href="#populating-wrappers">
              Populating wrappers
            </Link>
          </li>
          <li>
            <Link href="#defining-your-own-react-component-wrappers">
              Defining Your Own React Component Wrappers
            </Link>
          </li>
          <ul>
            <li>
              <Link href="#marking-content-for-exclusion">
                Marking Content for Exclusion
              </Link>
            </li>
            <li>
              <Link href="#a-note-on-contexts-used-by-wrappers">
                A Note On Contexts Used By Wrappers
              </Link>
            </li>
          </ul>
          <li>
            <Link href="#useeditablecontentcontext">
              useEditableContentContext
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="#editablecontent">
              EditableContent
            </Link>
          </li>
          <li>
            <Link href="#a-note-on-editablecontent-rendering">
              A Note on EditableContent Rendering
            </Link>
          </li>
        </ul>
        <li>
          <Link href="#renderedcontent">
            RenderedContent
          </Link>
        </li>
        <ul>
          <li>
            <Link href="#edittextbutton">
              EditTextButton
            </Link>
          </li>
          <li>
            <Link href="#basic-rules-for-edittextbutton-behavior">
              Basic Rules for EditTextButton behavior
            </Link>
          </li>
          <li>
            <Link href="#special-rules-for-unbreakable-elements">
              Special Rules for Unbreakable elements
            </Link>
          </li>
          <li>
            <Link href="#edittextbutton-props">
              EditTextButton props
            </Link>
          </li>
        </ul>
        <li>
          <Link href="#browser-behavior-and-text">
            Browser Behavior and Text
          </Link>
        </li>
        <li>
          <Link href="#known-issues">
            Known Issues
          </Link>
        </li>
      </ul>
    </>
  )

}