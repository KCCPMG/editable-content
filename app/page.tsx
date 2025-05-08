import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';

export default function Home() {
  return (
    <main
      style={{
        width: 500,
        margin: "auto",
        marginTop: 100
      }}
    >
      <EditableContent 
        initialHTML="Plain Text<strong>Strong Text</strong>"
        editTextButtons={[
          {
            dataKey: "bold",
            child: <FormatBoldIcon/>,
            wrapperArgs: {
              element: "strong"
            }

          },
        ]}
      />
    </main>
  );
}
