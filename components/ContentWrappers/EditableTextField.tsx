import { EditableContent, RenderedContent } from "@kccpmg/editable-content";
import styles from "./EditableTextField.module.css";

type EditableTextFieldProps = {
  editMode: boolean
}

export default function EditableTextField({ editMode }: EditableTextFieldProps) {

  if (editMode) {
    return (
      <EditableContent
        className={styles.EditableTextField}
        disableNewLines={true}
      />
    )
  } else return (
    <RenderedContent 
      className={styles.EditableTextField}
    />
  )

}