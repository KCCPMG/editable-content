type WackyLinkProps = {
  initialText: String
}


export default function WackyLink({initialText}: WackyLinkProps) {
  return (
    <div 
      contentEditable
      
      style={{
        backgroundColor: "red",
        display: "inline-block"
      }}
    >
      {initialText}
    </div>
  )
}

