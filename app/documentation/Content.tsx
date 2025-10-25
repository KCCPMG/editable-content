"use client";
import ReactMarkdown from "react-markdown";


export default function Content({stringified}: {stringified: string}) {

  return (
    <ReactMarkdown
      children={stringified}
      components={{
        code(props) {
          const { children, node, ...rest } = props;
          if (children && typeof children === "string" && !(children.match("\n"))) {
            return (
              <code 
                style={{
                  padding: "4px",
                  backgroundColor: "#EEE"
                }}
                {...rest}
              >
                {children}
              </code>
            )
          } else return (
            <code 
              style={{
                backgroundColor: "#EEE"
              }}
              {...rest}
            >
              {children}
            </code>
          )

        },
        pre(props) {
          const { children, node, ...rest } = props;
          if (node) {
            const nodeChildren = Array.from(node.children);
            if (nodeChildren.some(nc => nc.type==="element" && nc.tagName === "code")) {
              return (
                <pre
                  style={{
                    padding: "6px",
                    backgroundColor: "#EEE"
                  }}
                  {...rest}
                >
                  {children}
                </pre>
              )
            } else return (
              <pre {...rest} children={children} />
            )
          }
        }
      }}
    />
  )
}